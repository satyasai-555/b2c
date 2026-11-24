import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { AuthMethods } from "../modules/auth/auth.service.js";
import { CandidateMethods } from "../modules/candidates/candidate.service.js";
import { db } from "../shared/database/database.js";
import { createRoutes } from "../modules/candidates/candidate.routes.js";

export const repository = db;
export const candidates = new CandidateMethods(db);
export const auth = new AuthMethods(db, candidates);
export const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "2mb" }));

app.use(createRoutes(candidates, auth));
app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => { const message = error instanceof Error ? error.message : "Unexpected server error"; const status = message === "Authentication required" ? 401 : message.includes("required") || message.includes("Invalid") ? 400 : message.includes("not found") ? 404 : 500; response.status(status).json({ success: false, error: { code: status === 500 ? "INTERNAL_ERROR" : status === 401 ? "UNAUTHORIZED" : "VALIDATION_ERROR", message } }); });
