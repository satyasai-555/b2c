import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  CandidateFlowState,
  CvAnswers,
  UploadedCv,
} from "./candidateFlow.types";

import {type CvAnalysisPreviewResponse, cvApi, type SaveCvGoalsRequest} from "../../services/cvApi";

export type {
  CandidateFlowState,
  CvAnswers,
  CvAnalysis,
  ParsedCvDetails,
  UploadedCv,
} from "./candidateFlow.types";

export type UploadPhase =
    | "idle"
    | "initializing"
    | "uploading"
    | "parsing"
    | "succeeded"
    | "failed";

type CvAnalysisSession = CandidateFlowState & {
  cvId: string | null;
  uploadPhase: UploadPhase;
  uploadError: string | null;
  uploadCv: (file: File) => Promise<void>;
  setAnswers: (answers: CvAnswers) => void;
  setUnlocked: (unlocked: boolean) => void;
  preview: CvAnalysisPreviewResponse | null;
  analysisBusy: boolean;
  analysisError: string | null;
  submitGoals: (answers: CvAnswers) => Promise<boolean>;
};

function createInitialState(): CandidateFlowState {
  return {
    // Java identifies the guest through its session cookie.
    guestSessionId: "",
    file: null,
    answers: {
      role: "",
      experience: "",
      location: "",
    },
    parsedDetails: null,
    profile: {
      name: null,
      email: null,
      initials: null,
      role: "",
      experience: "",
      location: "",
    },
    // Compatibility defaults until we connect the preview screen.
    // These are not an analysis result.
    analysis: {
      score: 0,
      maxScore: 100,
      projectedScore: 0,
      scoreLabel: "",
      cards: [],
      positives: [],
      negatives: [],
      recommendations: [],
    },
    unlocked: false,
  };
}

function experienceSelection(years: number | null): string {
  if (years === null || !Number.isFinite(years) || years < 0) {
    return "";
  }

  if (years < 1) return "0–1 yrs";
  if (years < 3) return "1–3 yrs";
  if (years < 5) return "3–5 yrs";
  if (years < 8) return "5–8 yrs";

  return "8+ yrs";
}

const CvAnalysisContext = createContext<CvAnalysisSession | null>(null);

export function CvAnalysisProvider({
                                     children,
                                   }: {
  children: ReactNode;
}) {
  const [state, setState] =
      useState<CandidateFlowState>(createInitialState);

  const [cvId, setCvId] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] =
      useState<UploadPhase>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadInProgress = useRef(false);
  const [preview, setPreview] =
      useState<CvAnalysisPreviewResponse | null>(null);

  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analysisInProgress = useRef(false);

  const value = useMemo<CvAnalysisSession>(() => ({
    ...state,
    cvId,
    uploadPhase,
    uploadError,


    uploadCv: async (selected) => {
      if (uploadInProgress.current || analysisInProgress.current) return;

      uploadInProgress.current = true;
      setUploadError(null);
      setPreview(null);
      setAnalysisError(null);
      setCvId(null);

      const file: UploadedCv = {
        name: selected.name,
        size: `${(selected.size / 1024 / 1024).toFixed(2)} MB`,
        pages: "",
        type: selected.type,
      };

      setState({
        ...createInitialState(),
        file,
      });

      try {
        if (!/\.(pdf|docx)$/i.test(selected.name)) {
          throw new Error("Please select a PDF or DOCX file.");
        }

        if (selected.size <= 0) {
          throw new Error("The selected CV file is empty.");
        }

        setUploadPhase("initializing");

        const initialized = await cvApi.initializeUpload(selected);
        setCvId(initialized.cvId);

        setUploadPhase("uploading");
        await cvApi.uploadFile(selected, initialized.upload);

        setUploadPhase("parsing");
        const completed = await cvApi.completeUpload(initialized.cvId);

        if (
            completed.parsingStatus !== "SUCCEEDED" ||
            !completed.parsedData
        ) {
          throw new Error("CV parsing did not complete successfully.");
        }

        const parsed = completed.parsedData;

        const skills = Array.from(new Set([
          ...(parsed.softwareSkills ?? []),
          ...(parsed.softSkills ?? []),
          ...(parsed.behaviourSkills ?? []),
        ]));

        const experience = experienceSelection(
            parsed.yearsOfExperience,
        );

        const name = parsed.name;
        const initials = name
            ? name.trim().split(/\s+/).slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase()).join("")
            : null;

        const location =
            parsed.matchedLocation ?? parsed.location ?? "";

        setState((previous) => ({
          ...previous,
          parsedDetails: {
            candidateName: name,
            email: parsed.emailId,
            skills,
            yearsExperience: parsed.yearsOfExperience,
            // These fields are not supplied by Java.
            parserVersion: "",
            parsedAt: "",
          },
          answers: {
            ...previous.answers,
            experience,
            location,
          },
          profile: {
            ...previous.profile,
            name,
            email: parsed.emailId,
            initials,
            experience,
            location,
          },
        }));

        setUploadPhase("succeeded");
      } catch (error) {
        setUploadError(
            error instanceof Error
                ? error.message
                : "The CV upload could not be completed.",
        );
        setUploadPhase("failed");
      } finally {
        uploadInProgress.current = false;
      }
    },

    setAnswers: (answers) => {
      setState((previous) => ({
        ...previous,
        answers,
        profile: {
          ...previous.profile,
          ...answers,
        },
      }));
    },

    preview,
    analysisBusy,
    analysisError,

    submitGoals: async (answers) => {
      if (analysisInProgress.current || uploadInProgress.current) {
        return false;
      }

      if (!cvId || uploadPhase !== "succeeded") {
        setAnalysisError("Upload and parse your CV before submitting goals.");
        return false;
      }

      analysisInProgress.current = true;
      setAnalysisBusy(true);
      setAnalysisError(null);
      setPreview(null);

      try {
        const request = toGoalsRequest(answers);

        await cvApi.saveGoals(cvId, request);

        setState((previous) => ({
          ...previous,
          answers,
          profile: {
            ...previous.profile,
            ...answers,
          },
        }));

        const result = await cvApi.analyze(cvId);

        if (result.cvId !== cvId) {
          throw new Error("The analysis response does not match this CV.");
        }

        setPreview(result);
        return true;
      } catch (error) {
        setAnalysisError(
            error instanceof Error
                ? error.message
                : "Your CV analysis could not be completed.",
        );

        return false;
      } finally {
        analysisInProgress.current = false;
        setAnalysisBusy(false);
      }
    },
    // UI state only; this does not authorize access to a real report.
    setUnlocked: (unlocked) => {
      setState((previous) => ({
        ...previous,
        unlocked,
      }));
    },
  }), [
    state,
    cvId,
    uploadPhase,
    uploadError,
    preview,
    analysisBusy,
    analysisError,
  ]);

  function toGoalsRequest(answers: CvAnswers): SaveCvGoalsRequest {
    const experience = answers.experience
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, "")
        .toLowerCase();

    const ranges: Record<
        string,
        { minExperience: number; maxExperience: number | null }
    > = {
      "0-1yrs": { minExperience: 0, maxExperience: 1 },
      "1-3yrs": { minExperience: 1, maxExperience: 3 },
      "3-5yrs": { minExperience: 3, maxExperience: 5 },
      "5-8yrs": { minExperience: 5, maxExperience: 8 },
      "8+yrs": { minExperience: 8, maxExperience: null },
    };

    const range = ranges[experience];
    const targetRole = answers.role.trim();
    const preferredLocation = answers.location.trim();

    if (!range) {
      throw new Error("Please select your experience range.");
    }

    if (!targetRole || !preferredLocation) {
      throw new Error("Please enter your target role and preferred location.");
    }

    if (targetRole.length > 200 || preferredLocation.length > 200) {
      throw new Error("Role and location must each be 200 characters or fewer.");
    }

    return {
      targetRole,
      ...range,
      preferredLocation,
    };
  }

  return (
      <CvAnalysisContext.Provider value={value}>
        {children}
      </CvAnalysisContext.Provider>
  );
}

export function useCvAnalysis() {
  const context = useContext(CvAnalysisContext);

  if (!context) {
    throw new Error(
        "useCvAnalysis must be used inside CvAnalysisProvider",
    );
  }

  return context;
}