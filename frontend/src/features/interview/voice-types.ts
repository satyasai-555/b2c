export type InterviewSetup = {
  mode: "role" | "jd";
  role: string;
  skills: string[];
  jobDescription: string;
};
export type SessionInput = {
  setup: InterviewSetup;
  answerMode: "text" | "voice";
  deviceId: string;
};
export function isSessionInput(value: unknown): value is SessionInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SessionInput>;
  const s = v.setup;
  return !!s && typeof s === "object" &&
    (s.mode === "role" || s.mode === "jd") &&
    typeof s.role === "string" && !!s.role.trim() &&
    Array.isArray(s.skills) && s.skills.length > 0 && s.skills.length <= 15 &&
    s.skills.every(x => typeof x === "string" && !!x.trim()) &&
    typeof s.jobDescription === "string" &&
    (s.mode !== "jd" || !!s.jobDescription.trim()) &&
    (v.answerMode === "text" || v.answerMode === "voice") &&
    typeof v.deviceId === "string";
}
export type WorkerRequest = { id: number; audio: Float32Array };
export type WorkerReply =
  | { id: number; type: "status"; message: string }
  | { id: number; type: "result"; text: string }
  | { id: number; type: "error"; message: string };
