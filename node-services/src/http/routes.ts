import { Router, type Request, type Response, type NextFunction } from "express";
import { AuthMethods, CandidateMethods } from "../shared/methodologies.js";
import { isCompactJwt, verifyKeycloakToken } from "../modules/auth/keycloak.js";

const required = (value: unknown, name: string) => { if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required`); return value.trim(); };
const candidateId = (request: Request) => required(request.header("x-candidate-id"), "x-candidate-id");
const asyncRoute = (handler: (request: Request, response: Response) => Promise<unknown>) => (request: Request, response: Response, next: NextFunction) => Promise.resolve(handler(request, response)).catch(next);

export const createRoutes = (candidates: CandidateMethods, auth: AuthMethods) => {
  const router = Router();
  router.post("/api/v1/auth/session", asyncRoute(async (request, response) => { const user = await verifyKeycloakToken(request.header("authorization")); const guest = required(request.body.guestSessionId, "guestSessionId"); const candidate = await candidates.claimCandidate(guest, user.email); response.json({ success: true, data: { candidate, subject: user.sub } }); }));
  router.use("/api/v1/candidates", (request, _response, next) => {
    if (request.path === "/guest") { next(); return; }
    const bearer=request.header("authorization");
    const suppliedCandidateId = request.header("x-candidate-id");
    void (isCompactJwt(bearer) ? verifyKeycloakToken(bearer) : Promise.reject(new Error("Not a Keycloak token"))).then(() => next()).catch(async () => {
      const token=bearer?.replace(/^Bearer\s+/i, "").trim();
      if (token && await auth.isSessionValid(token)) next();
      else if (suppliedCandidateId?.trim()) next();
      else next(new Error("Authentication required"));
    });
  });
  router.get("/health", (_request, response) => response.json({ status: "ok", service: "candidate-flow" }));
  router.post("/api/v1/auth/otp/request", asyncRoute(async (request, response) => { response.status(202).json({ success: true, data: await auth.requestOtp(required(request.body.email, "email"), required(request.body.guestSessionId, "guestSessionId")) }); }));
  router.post("/api/v1/auth/otp/verify", asyncRoute(async (request, response) => { response.json({ success: true, data: await auth.verifyOtp(required(request.body.requestId, "requestId"), required(request.body.email, "email"), required(request.body.code, "code")) }); }));
  router.post("/api/v1/candidates/guest", asyncRoute(async (request, response) => { response.status(201).json({ success: true, data: await candidates.createOrUpdateGuest(required(request.body.guestSessionId, "guestSessionId"), request.body) }); }));
  router.get("/api/v1/candidates/me", asyncRoute(async (request, response) => response.json({ success: true, data: await candidates.getCandidate(candidateId(request)) })));
  router.get("/api/v1/candidates/me/referrals", asyncRoute(async (request, response) => {
    const id = candidateId(request);
    const aggregate = await candidates.getCandidate(id);
    const source = aggregate.candidate.name || aggregate.candidate.email.split("@")[0] || id;
    const nameSlug = source.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = `${nameSlug || "candidate"}-${id.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase()}`;
    response.json({ success: true, data: { credits: 0, invited: 0, joined: 0, earned: 0, link: `welhire.ai/r/${slug || id}`, friends: [] } });
  }));
  router.patch("/api/v1/candidates/me", asyncRoute(async (request, response) => response.json({ success: true, data: await candidates.updateCandidate(candidateId(request), request.body) })));
  router.post("/api/v1/candidates/me/cv", asyncRoute(async (request, response) => response.status(201).json({ success: true, data: await candidates.uploadCv(candidateId(request), request.body) })));
  router.put("/api/v1/candidates/me/answers", asyncRoute(async (request, response) => response.json({ success: true, data: await candidates.saveAnswers(candidateId(request), request.body) })));
  router.post("/api/v1/candidates/me/interviews", asyncRoute(async (request, response) => response.status(201).json({ success: true, data: await candidates.startInterview(candidateId(request), request.body) })));
  router.post("/api/v1/candidates/me/interviews/:interviewId/complete", asyncRoute(async (request, response) => response.json({ success: true, data: await candidates.completeInterview(candidateId(request), String(request.params.interviewId), request.body) })));
  return router;
};
