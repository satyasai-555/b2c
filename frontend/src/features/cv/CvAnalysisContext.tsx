import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CandidateFlowState, CvAnswers, UploadedCv } from "./candidateFlow.types";
import { readCandidateFlow, saveCandidateAnswers, saveUnlocked, saveUploadedCv } from "../../services/mockCandidateFlowRepository";

export type { CandidateFlowState, CvAnswers, CvAnalysis, ParsedCvDetails, UploadedCv } from "./candidateFlow.types";

type CvAnalysisSession = CandidateFlowState & {
  setFile: (file: UploadedCv) => void;
  setAnswers: (answers: CvAnswers) => void;
  setUnlocked: (unlocked: boolean) => void;
};

const CvAnalysisContext = createContext<CvAnalysisSession | null>(null);

export function CvAnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CandidateFlowState>(() => readCandidateFlow());
  useEffect(() => {
    const sync = () => setState(readCandidateFlow());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const value = useMemo<CvAnalysisSession>(() => ({
    ...state,
    setFile: (file) => {
      const parsedDetails = saveUploadedCv(file);
      setState((previous) => ({ ...previous, file, parsedDetails, profile: { ...previous.profile, name: parsedDetails.candidateName, experience: "3–5 yrs" } }));
    },
    setAnswers: (answers) => {
      saveCandidateAnswers(answers);
      setState((previous) => ({ ...previous, answers, profile: { ...previous.profile, ...answers } }));
    },
    setUnlocked: (unlocked) => {
      saveUnlocked(unlocked);
      setState((previous) => ({ ...previous, unlocked }));
    },
  }), [state]);

  return <CvAnalysisContext.Provider value={value}>{children}</CvAnalysisContext.Provider>;
}

export function useCvAnalysis() {
  const context = useContext(CvAnalysisContext);
  if (!context) throw new Error("useCvAnalysis must be used inside CvAnalysisProvider");
  return context;
}
