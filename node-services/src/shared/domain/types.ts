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

export type CvRecord = {
  id: string;
  candidateId: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  parsed: boolean;
  parsedDetails: { skills: string[]; yearsExperience: number | null; parserVersion: string } | null;
  uploadedAt: string;
};

export type InterviewRecord = {
  id: string;
  candidateId: string;
  role: string;
  status: "started" | "completed";
  answers: Array<{ question: string; text: string }>;
  score: number | null;
  startedAt: string;
  completedAt: string | null;
};

export type OtpRequest = { id: string; email: string; guestSessionId: string; code: string; expiresAt: number; attempts: number };
export type AuthSession = { token: string; candidateId: string; expiresAt: number };

export type RequestOtpPayload = { email: string; guestSessionId: string };
export type VerifyOtpPayload = { requestId: string; email: string; code: string };
export type UpsertCandidatePayload = { name?: string; role?: string; experience?: string; location?: string };
export type UploadCvPayload = { fileName: string; fileSize?: number; mimeType?: string };
export type SaveAnswersPayload = { role: string; experience: string; location: string };
export type StartInterviewPayload = { role: string };
export type CompleteInterviewPayload = { answers: Array<{ question: string; text: string }> };
