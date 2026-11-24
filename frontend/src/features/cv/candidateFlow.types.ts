export type UploadedCv = { name: string; size: string; pages: string; type: string };
export type CvAnswers = { role: string; experience: string; location: string };
export type CandidateProfile = { name: string | null; email: string | null; initials: string | null; role: string; experience: string; location: string };
export type ParsedCvDetails = { candidateName: string | null; email: string | null; skills: string[]; yearsExperience: number | null; parserVersion: string; parsedAt: string };
export type CvAnalysis = { score: number; maxScore: number; projectedScore: number; scoreLabel: string; cards: { value: string; title: string }[]; positives: string[]; negatives: string[]; recommendations: string[] };
export type CandidateFlowState = { guestSessionId: string; file: UploadedCv | null; answers: CvAnswers; parsedDetails: ParsedCvDetails | null; profile: CandidateProfile; analysis: CvAnalysis; unlocked: boolean };
