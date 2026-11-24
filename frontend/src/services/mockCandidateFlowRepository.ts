import { defaultCandidateProfile, defaultCvAnalysis, defaultCvAnswers, mockParsedSkills } from "../mocks/candidateFlowMockData";
import type { CandidateFlowState, CvAnswers, ParsedCvDetails, UploadedCv } from "../features/cv/candidateFlow.types";

const STORAGE_KEY = "welhire-cv-session";
const GUEST_KEY = "welhire-guest-session-id";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `guest-${Date.now()}`;
}

export function readGuestSessionId() {
  if (typeof window === "undefined") return "guest-server";
  const existing = window.localStorage.getItem(GUEST_KEY);
  if (existing) return existing;
  const id = makeId();
  window.localStorage.setItem(GUEST_KEY, id);
  return id;
}

export function readCandidateFlow(): CandidateFlowState {
  const guestSessionId = readGuestSessionId();
  if (typeof window === "undefined") return { guestSessionId, file: null, answers: defaultCvAnswers, parsedDetails: null, profile: defaultCandidateProfile, analysis: defaultCvAnalysis, unlocked: false };
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as Partial<CandidateFlowState>;
    return { guestSessionId, file: stored.file || null, answers: { ...defaultCvAnswers, ...stored.answers }, parsedDetails: stored.parsedDetails || null, profile: { ...defaultCandidateProfile, ...stored.profile }, analysis: { ...defaultCvAnalysis, ...stored.analysis }, unlocked: stored.unlocked === true };
  } catch { return { guestSessionId, file: null, answers: defaultCvAnswers, parsedDetails: null, profile: defaultCandidateProfile, analysis: defaultCvAnalysis, unlocked: false }; }
}

function save(state: Partial<CandidateFlowState>) {
  if (typeof window === "undefined") return;
  const current = readCandidateFlow();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
}

export function saveUploadedCv(file: UploadedCv) {
  const candidateName = file.name.replace(/\.[^.]+$/, "").replace(/^\d+[-_]?/, "").split(/[-_]+/)[0] || null;
  const parsed: ParsedCvDetails = { candidateName, email: null, skills: mockParsedSkills, yearsExperience: 3.5, parserVersion: "mock-parser-1.0", parsedAt: new Date().toISOString() };
  save({ file, parsedDetails: parsed, profile: { ...defaultCandidateProfile, name: candidateName, experience: "3–5 yrs" } });
  return parsed;
}

export function saveCandidateAnswers(answers: CvAnswers) { save({ answers, profile: { ...readCandidateFlow().profile, role: answers.role, experience: answers.experience, location: answers.location } }); }
export function saveUnlocked(unlocked: boolean) { save({ unlocked }); }
