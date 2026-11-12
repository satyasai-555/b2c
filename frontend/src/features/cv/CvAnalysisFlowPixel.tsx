import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../landing/LandingComponents/Header";
import Footer from "../landing/LandingComponents/Footer";
import {
  CvStepper,
  FeatureCards,
  ProcessingModal,
  UploadZone,
} from "./CvComponents";
import { useCvAnalysis } from "./CvAnalysisContext";

const chips = [
  ["/images/Raise meter.svg", "Instant CV score"],
  ["/images/VerifiedBadge.svg", "AI-verified skills"],
  ["/images/Hand deal.svg", "Matched jobs"],
] as const;

export default function CvAnalysisFlowPixel() {
  const { file, setFile } = useCvAnalysis();
  const [modal, setModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const selectFile = (selected?: File) => {
    if (selected) {
      setFile({
        name: selected.name,
        size: `${(selected.size / 1024 / 1024).toFixed(1)} MB`,
        pages: "2 pages",
        type: selected.type || "application/octet-stream",
      });
    }
    setModal(true);
  };
  return (
    <div className="min-h-screen bg-white text-[#1d1d55]">
      <Header onAction={() => {}} />
      <CvStepper />
      <main>
<section className="mx-auto grid max-w-470 items-start gap-8 px-5 py-7 md:px-10 lg:grid-cols-[.95fr_1.05fr] lg:gap-12 lg:px-12 lg:py-8">
          <div>
            <span className="mb-7 block w-max rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-[#5050bb]">
              ● Step 1 of 7: Initial Profile Intake
            </span>
            <span className="mb-7 flex w-max items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-[#5050bb]">
              FREE · NO SIGN-UP TO START
            </span>
            <h1 className="max-w-3xl text-[clamp(2.0rem,4.2vw,4.6rem)] font-extrabold leading-[.96] tracking-tight">
              See how strong your profile is —{" "}
              <em className="not-italic text-[#5654bd]">free, in a minute.</em>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-6 text-slate-600">
              Upload your CV and get an instant score for the role you want. Then prove your real-world skills with an AI interview and get
              discovered directly by leading companies.
            </p>
            <div className="cv-chip-row mt-4 flex flex-wrap gap-3">
              {chips.map(([icon, label]) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-[#25245e] shadow-sm"
                  key={label}
                >
                  <img src={icon} alt="" className="h-5 w-5 object-contain" />
                  {label}
                </span>
              ))}
            </div>
            <div className="cv-trust-row mt-7 flex items-start gap-3">
              <div className="flex shrink-0 -space-x-2">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 ring-2 ring-white">
                  AK
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-500 text-xs font-bold text-white ring-2 ring-white">
                  RM
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-600 text-xs font-bold text-white ring-2 ring-white">
                  TS
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white ring-2 ring-white">
                  JD
                </span>
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-base tracking-wide text-amber-500">
                    ★★★★★
                  </span>
                  <strong className="text-sm text-[#1d1d55]">4.9/5</strong>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Trusted by <span className="text-slate-800">40,000+</span>{" "}
                  candidates across engineering &amp; product
                </p>
              </div>
            </div>
          </div>
          <UploadZone inputRef={inputRef} onSelect={selectFile} />
          
        </section>
        <FeatureCards />
      </main>
      {modal && (
        <ProcessingModal
          file={file ?? { name: "CV document", size: "—", pages: "—" }}
          onClose={() => setModal(false)}
          onContinue={() => navigate("/cv-analysis/questions")}
        />
      )}
      <Footer onAction={() => {}} />
    </div>
  );
}
