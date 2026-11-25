import type { AuthSession, Candidate, CvRecord, InterviewRecord, OtpRequest } from "../domain/types.js";

// Database query boundary. Replace this adapter with PostgreSQL/Prisma later.
export class CandidateDb {
  private readonly candidates = new Map<string, Candidate>();
  private readonly cvs = new Map<string, CvRecord>();
  private readonly interviews = new Map<string, InterviewRecord>();
  private readonly otps = new Map<string, OtpRequest>();
  private readonly sessions = new Map<string, AuthSession>();
  findCandidateByEmail(email: string) { return Promise.resolve([...this.candidates.values()].find((item) => item.email === email.toLowerCase()) ?? null); }
  findCandidateById(id: string) { return Promise.resolve(this.candidates.get(id) ?? null); }
  findCandidateByGuestSession(id: string) { return Promise.resolve([...this.candidates.values()].find((item) => item.guestSessionId === id) ?? null); }
  saveCandidate(value: Candidate) { this.candidates.set(value.id, value); return Promise.resolve(value); }
  saveCv(value: CvRecord) { this.cvs.set(value.id, value); return Promise.resolve(value); }
  listCvs(id: string) { return Promise.resolve([...this.cvs.values()].filter((item) => item.candidateId === id)); }
  saveInterview(value: InterviewRecord) { this.interviews.set(value.id, value); return Promise.resolve(value); }
  listInterviews(id: string) { return Promise.resolve([...this.interviews.values()].filter((item) => item.candidateId === id)); }
  saveOtp(value: OtpRequest) { this.otps.set(value.id, value); return Promise.resolve(value); }
  findOtp(id: string) { return Promise.resolve(this.otps.get(id) ?? null); }
  saveSession(value: AuthSession) { this.sessions.set(value.token, value); return Promise.resolve(value); }
  findSession(token: string) { return Promise.resolve(this.sessions.get(token) ?? null); }
}
export const db = new CandidateDb();
