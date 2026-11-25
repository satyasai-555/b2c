import type { CandidateProfile, CvAnalysis, CvAnswers } from "../features/cv/candidateFlow.types";
export const defaultCandidateProfile: CandidateProfile = { name: null, email: null, initials: null, role: "Frontend Engineer", experience: "3–5 yrs", location: "Pune, India" };
export const roleOptions = ["Frontend Engineer", "React Developer", "UI Engineer", "Full-stack Developer"];
export const experienceOptions = ["0–1 yrs", "1–3 yrs", "3–5 yrs", "5–8 yrs", "8+ yrs"];
export const defaultInterviewCredits = 2;

export const defaultCvAnswers: CvAnswers = { role: "Frontend Engineer", experience: "3â€“5 yrs", location: "Pune, India" };
export const defaultCvAnalysis: CvAnalysis = {
  score: 64,
  maxScore: 100,
  projectedScore: 79,
  scoreLabel: "A solid start â€” a few fixes could add 15+ points.",
  cards: [
    { value: "4", title: "Things missing from your CV" },
    { value: "8", title: "Skills checked against the role" },
    { value: "%", title: "How you compare with other candidates" },
    { value: "AI", title: "Interview to verify your skills" },
  ],
  positives: ["Relevant frontend skills detected", "Clear role alignment"],
  negatives: ["Add more measurable achievements", "Improve keyword coverage"],
  recommendations: ["Add quantified outcomes to recent roles"],
};

export const mockParsedSkills = ["React", "TypeScript", "JavaScript", "CSS"];
