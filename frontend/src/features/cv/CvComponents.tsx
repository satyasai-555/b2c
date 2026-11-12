import { useEffect, useState, type DragEvent, type RefObject } from "react";
import "./cv-images.css";

export const steps = [
  "Upload CV",
  "Your goal",
  "CV score",
  "Log in",
  "Analysis",
  "Interview",
  "Report",
];
export const features = [
  [
    "01",
    "Deep Skill Extraction",
    "Our AI analyzes your CV to extract key skills, experience, qualifications, projects and more.",
    "/images/DeepSkillExtraction.svg",
  ],
  [
    "02",
    "Target Match & Scoring",
    "Get an instant CV score showing how well you match your selected role and industry requirements.",
    "/images/TragetMatchScoring.svg",
  ],
  [
    "03",
    "Improve & Unlock Details",
    "See key strengths, missing skills and suggestions to improve. Log in to unlock your detailed analysis and personalized recommendations.",
    "/images/UnlockSkillsIcon.svg",
  ],
] as const;

export function CvStepper({ current = 0 }: { current?: number }) {
  return (
    <div className="flex gap-3 overflow-x-auto border-b border-slate-100 bg-[#fafaff] px-5 py-4 lg:justify-center lg:gap-6">
      {steps.map((step, index) => (
        <div
          className="flex shrink-0 items-center gap-2 text-sm text-slate-500 md:text-base"
          key={step}
        >
          <b
            className={`grid h-8 w-8 place-items-center rounded-full ${index < current ? "bg-emerald-500 text-white" : index === current ? "bg-[#5453bd] text-white" : "bg-[#e5ebf4] text-slate-600"}`}
          >
            {index < current ? "✓" : index + 1}
          </b>
          <span className={index === current ? "font-bold text-[#5050bb]" : ""}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <i
              className={`mx-1 h-0.5 w-5 md:w-8 ${index < current ? "bg-emerald-400" : "bg-slate-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
export function UploadZone({
  inputRef,
  onSelect,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (file?: File) => void;
}) {
  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onSelect(event.dataTransfer.files[0]);
  };
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_12px_35px_rgba(45,45,110,0.06)] sm:p-8">
      <div
        className="grid min-h-80 cursor-pointer place-content-center rounded-2xl border-[3px] border-dashed border-[#5754bd] bg-[#fbfbff] px-5 text-center transition hover:bg-[#f5f4ff]"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={drop}
      >
        <div className="mx-auto mb-6 grid h-15 w-20 place-items-center rounded-2xl bg-[#5654bd] text-2xl text-white shadow-lg shadow-indigo-200">
          ↑
        </div>
        <h2 className="text-xl font-bold text-[#1d1d55] sm:text-2xl">
          Drag and drop your CV
        </h2>
        <p className="mt-2 text-base text-slate-500">
          or{" "}
          <button
            className="font-bold text-[#4d4db5]"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            browse files
          </button>
        </p>
        <small className="mx-auto mt-4 w-max rounded-full border border-indigo-100 px-4 py-2 text-xs text-slate-600">
          PDF or DOCX · up to 5 MB
        </small>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          hidden
          onChange={(event) => onSelect(event.target.files?.[0])}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 py-5 text-sm text-slate-500 sm:text-base">
        <span> Private until you choose to share.</span>
        <button className="font-bold text-[#4d4db5]" onClick={() => onSelect()}>
          No CV handy? Try a sample →
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-5 pb-5 text-sm text-slate-500 sm:gap-12">
        <span>Zero Spam Guarantee</span>
        <span>ATS Resume Parser 4.2</span>
      </div>
    </div>
  );
}
export function FeatureCards() {
  return (
    <section className="px-5 py-16 md:px-10 lg:px-16 lg:py-18" id="features">
      <span className="font-bold tracking-[0.2em] text-[#2e2c77]">
        CONTINUOUS INTELLIGENCE
      </span>
      <h2 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[#1d1d55] md:text-5xl">
        What happens after you drop your file?
      </h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {features.map(([number, title, text, image]) => (
          <article
            className="relative min-h-72 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10"
            key={number}
          >
            <b className="text-4xl text-indigo-200">{number}</b>
            <span className="absolute right-8 top-8 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50">
              <img src={image} alt="" className="h-8 w-8 object-contain" />
            </span>
            <h3 className="mt-12 text-2xl font-bold text-[#1d1d55]">{title}</h3>
            <p className="mt-4 text-base leading-7 text-slate-500">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function ProcessingModal({
  file,
  onClose,
  onContinue,
}: {
  file: { name: string; size: string; pages: string };
  onClose: () => void;
  onContinue: () => void;
}) {
  const [processingDone, setProcessingDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setProcessingDone(true), 2600);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#19182e]/45 p-4 sm:p-6">
      <section
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:max-h-[calc(100vh-3rem)] sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-2xl leading-none text-slate-400"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pr-10">
          <img src="/images/Upload Head.svg" alt="" className="h-11 w-11 rounded-xl bg-[#5554bd] p-2 object-contain" />
         
          <div>
            <h2 className="text-md font-bold text-[#1d1d55] sm:text-xl">
              Uploading &amp; Analyzing CV
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              WelHire Adaptive Parsing Engine
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/50 p-3">
          <span className="text-xl text-[#5654bd]">▣</span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-xs text-slate-800 sm:text-sm">
              {file.name}
            </b>
            <small className="text-xs text-slate-500">
              {file.size} · {file.pages}
            </small>
          </div>
          <strong className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1.5 text-[10px] text-emerald-700 sm:text-xs">
            100% READ
          </strong>
        </div>
        <div className="mt-4 flex justify-between gap-3 text-xs text-slate-600 sm:text-sm">
          <span>Reading CV data &amp; telemetry...</span>
          <b className="text-[#5754bd]">Loading...</b>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <i className="block h-full w-3/4 rounded-full bg-indigo-300" />
        </div>
        <div className="mt-5 space-y-2 rounded-xl border border-slate-100 p-3 text-xs sm:p-4 sm:text-sm">
          <p className={processingDone ? "text-emerald-600" : "text-indigo-400 animate-pulse"}>
            ✓{" "}
            <span className="text-slate-700">
              File verified &amp; virus scanned
            </span>
          </p>
          <p className={processingDone ? "text-emerald-600" : "text-indigo-400 animate-pulse"}>
            •{" "}
            <span className="text-slate-700">
              Extracting <b>48 skills &amp; work history</b> (3.5 yrs detected)
            </span>
          </p>
          <p className={processingDone ? "text-emerald-600" : "text-indigo-400 animate-pulse"}>
            •{" "}
            <span className="text-slate-700">
              Formatting profile for role matching
            </span>
          </p>
        </div>
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 sm:text-sm">
          Almost ready! Calibrating your questions...
        </div>
        <button
          className="mt-4 w-full rounded-xl bg-[#5754bd] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 sm:text-base"
          onClick={onContinue}
        >
          Answer 3 Quick Questions{" "}
          <span className="float-right text-xl">→</span>
        </button>
      </section>
    </div>
  );
}

export function ScoringModal({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: () => void;
}) {
  const [scoringDone, setScoringDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setScoringDone(true), 2800);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#19182e]/45 p-4">
      <section
        className="scoring-modal relative w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xl text-slate-500"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-center gap-4 pr-10">
          <span className="grid h-12 w-12 place-items-center rounded-full border-8 border-slate-100 border-r-cyan-400 text-xl">
            <img src="/images/Upload Head.svg" alt="" className="h-5 w-5 object-contain" />
            ♙
          </span>
          <div>
            <h2 className="text-1xl font-bold text-[#1d1d55]">
              Scoring your CV
            </h2>
            <p className="text-base text-slate-600">
              for Frontend Engineer roles
            </p>
          </div>
        </div>
        <div className="mt-7 space-y-3">
          <div className="flex items-center gap-4 rounded-2xl bg-slate-100 p-4 text-lg">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300 text-white">
              <img src="/images/Tick Icon.svg" alt="" className="h-5 w-5 object-contain" />
              ✓
            </span>
            <b>Reading your CV</b>
            <small className="ml-auto text-cyan-700">DONE</small>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-slate-100 p-4 text-lg">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300 text-white">
              <img src={scoringDone ? "/images/Tick Icon.svg" : "/images/Reload.svg"} alt="" className={`h-5 w-5 object-contain ${scoringDone ? "" : "animate-spin"}`} />
              ◌
            </span>
            <b>Matching to Frontend Engineer roles</b>
            {scoringDone && <small className="ml-auto text-cyan-700">DONE</small>}
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-slate-100 p-4 text-lg text-[#1d1d55]">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-700 text-white">
              <img src={scoringDone ? "/images/Tick Icon.svg" : "/images/Reload.svg"} alt="" className={`h-5 w-5 object-contain ${scoringDone ? "" : "animate-spin"}`} />
              ♻
            </span>
            <b>Calculating your score</b>
            {scoringDone && <small className="ml-auto text-cyan-700">READY</small>}
          </div>
        </div>
        <button
          className="mt-7 w-full rounded-2xl bg-[#a8a8dc] px-4 py-4 text-lg font-bold text-white"
          onClick={onContinue}
        >
          View CV Score &amp; Insights <span className="float-right">→</span>
        </button>
      </section>
    </div>
  );
}
