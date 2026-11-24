export type ApiResponse<T> = { success: true; data: T };
export type OtpRequestResponse = {
  requestId: string;
  expiresAt: string;
  devCode?: string;
};
export type Candidate = {
  id: string;
  guestSessionId: string;
  email: string;
  name: string;
  initials: string;
  role: string | null;
  experience: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CandidateAggregate = {
  candidate: Candidate;
  cvs: unknown[];
  interviews: unknown[];
};
export type AuthResult = { token: string; expiresAt: string; candidate: Candidate };
export type KeycloakSession = { candidate: Candidate; subject?: string };

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:9002";
let accessToken: (() => string | undefined) | undefined;
export const setAccessTokenProvider = (provider: () => string | undefined) => { accessToken = provider; };
let appToken: string | undefined;
const getStoredToken = () => {
  if (typeof window === "undefined") return undefined;
  try {
    const user = JSON.parse(window.localStorage.getItem("welhire-demo-user") || "null") as { token?: string } | null;
    return user?.token;
  } catch { return undefined; }
};

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...((accessToken?.() || appToken || getStoredToken()) ? { Authorization: `Bearer ${accessToken?.() || appToken || getStoredToken()}` } : {}), ...init.headers },
  });
  const body = (await response.json()) as
    | ApiResponse<T>
    | { success: false; error: { message: string } };
  if (!response.ok || !body.success)
    throw new Error(body.success ? "Request failed" : body.error.message);
  return body.data;
}

export const candidateApi = {
  createGuest: (guestSessionId: string) =>
    request<Candidate>("/api/v1/candidates/guest", {
      method: "POST",
      body: JSON.stringify({ guestSessionId }),
    }),
  requestOtp: (email: string, guestSessionId: string) =>
    request<OtpRequestResponse>("/api/v1/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ email, guestSessionId }),
    }),
  verifyOtp: async (payload: { requestId: string; email: string; code: string }) => {
    const result = await request<AuthResult>(
      "/api/v1/auth/otp/verify",
      { method: "POST", body: JSON.stringify(payload) },
    ); appToken = result.token; return result;
  },
  syncKeycloakSession: (guestSessionId: string) => request<KeycloakSession>("/api/v1/auth/session", { method: "POST", body: JSON.stringify({ guestSessionId }) }),
  getCandidate: (candidateId: string) =>
    request<CandidateAggregate>("/api/v1/candidates/me", {
      headers: { "x-candidate-id": candidateId },
    }),
  updateCandidate: (candidateId: string, payload: Record<string, string>) =>
    request<Candidate>("/api/v1/candidates/me", {
      method: "PATCH",
      headers: { "x-candidate-id": candidateId },
      body: JSON.stringify(payload),
    }),
  saveAnswers: (
    candidateId: string,
    payload: { role: string; experience: string; location: string },
  ) =>
    request<Candidate>("/api/v1/candidates/me/answers", {
      method: "PUT",
      headers: { "x-candidate-id": candidateId },
      body: JSON.stringify(payload),
    }),
  uploadCv: (
    candidateId: string,
    payload: { fileName: string; fileSize?: number; mimeType?: string },
  ) =>
    request<unknown>("/api/v1/candidates/me/cv", {
      method: "POST",
      headers: { "x-candidate-id": candidateId },
      body: JSON.stringify(payload),
    }),
};
