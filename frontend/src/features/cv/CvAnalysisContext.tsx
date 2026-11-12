import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type UploadedCv = {
  name: string;
  size: string;
  pages: string;
  type: string;
};

export type CvAnswers = {
  role: string;
  experience: string;
  location: string;
};

export type CvAnalysis = {
  score: number;
  maxScore: number;
  projectedScore: number;
  scoreLabel: string;
  cards: { value: string; title: string }[];
};

type CvAnalysisSession = {
  file: UploadedCv | null;
  answers: CvAnswers;
  analysis: CvAnalysis;
  unlocked: boolean;
  setFile: (file: UploadedCv) => void;
  setAnswers: (answers: CvAnswers) => void;
  setUnlocked: (unlocked: boolean) => void;
};

const defaultAnswers: CvAnswers = {
  role: "Frontend Engineer",
  experience: "3–5 yrs",
  location: "Pune, India",
};

const defaultAnalysis: CvAnalysis = {
  score: 64,
  maxScore: 100,
  projectedScore: 79,
  scoreLabel: "A solid start — a few fixes could add 15+ points.",
  cards: [
    { value: "4", title: "Things missing from your CV" },
    { value: "8", title: "Skills checked against the role" },
    { value: "%", title: "How you compare with other candidates" },
    { value: "AI", title: "Interview to verify your skills" },
  ],
};

const CvAnalysisContext = createContext<CvAnalysisSession | null>(null);

export function CvAnalysisProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<UploadedCv | null>(null);
  const [answers, setAnswers] = useState(defaultAnswers);
  const [unlocked, setUnlocked] = useState(false);
  const value = useMemo(() => ({ file, answers, analysis: defaultAnalysis, unlocked, setFile, setAnswers, setUnlocked }), [file, answers, unlocked]);
  return <CvAnalysisContext.Provider value={value}>{children}</CvAnalysisContext.Provider>;
}

export function useCvAnalysis() {
  const context = useContext(CvAnalysisContext);
  if (!context) throw new Error("useCvAnalysis must be used inside CvAnalysisProvider");
  return context;
}
