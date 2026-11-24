import { useState } from "react";
import Header from "../landing/LandingComponents/Header";
import Footer from "../landing/LandingComponents/Footer";
import { ScoringModal } from "./CvComponents";
import CvScoreView from "./CvScoreView";
import { useCvAnalysis } from "./CvAnalysisContext";
import { experienceOptions as mockExperienceOptions, roleOptions } from "../../mocks/candidateFlowMockData";

const experienceOptions = mockExperienceOptions;
/* const experienceOptions = [
  "0–1 yrs",
  "1–3 yrs",
  "3–5 yrs",
  "5–8 yrs",
  "8+ yrs",
]; */

export default function CvQuestions() {
  const { file, answers, parsedDetails, setAnswers } = useCvAnalysis();
  const [role, setRole] = useState(answers.role);
  const [experience, setExperience] = useState(answers.experience);
  const [location, setLocation] = useState(answers.location);
  const [scoring, setScoring] = useState(false);
  const [showScore, setShowScore] = useState(false);
  if (showScore) return <CvScoreView />;
  const saveAnswers = () => {
    setAnswers({ role, experience, location });
    setScoring(true);
  };
  return (
    <main className="min-h-screen bg-white text-[#1d1d55]">
      <Header onAction={() => {}} />

      <section className="cv-questions-layout mx-auto max-w-[1320px] px-5 py-7 md:px-8 lg:px-10">
        
        <div className="cv-upload-success mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-9 py-4 text-sm text-emerald-950">
          <div className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-md text-white">
            ✓
          </div>
          <b className="text-base">{file?.name ?? "CV document"}</b>
          <strong className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs text-emerald-700">
            READ SUCCESSFULLY
          </strong>
          <span className="text-slate-500">• {parsedDetails?.skills.length ?? 0} skills detected</span>
          {/* <button className="ml-auto rounded-lg border border-purple-100 bg-white px-3 py-2 text-sm font-bold text-[#5050bb]">
            ↻ Change / Re-upload
          </button> */}
        </div>
        <div className="cv-calibration-card mx-auto mt-7 max-w-[980px] rounded-[1.75rem] border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
          <span className="hidden inline-block rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-[#5050bb]">
            ☷ &nbsp; Step 2: Role Calibration
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
            Three quick questions
          </h1>
          <p className="mt-1 text-lg text-slate-500">
            So we score your CV against the right role.
          </p>
          <div className="mt-8">
            <label className="text-lg font-bold">
              1 · What role are you aiming for?
            </label>
            <input
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-base outline-none focus:border-indigo-400"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
            <p className="mt-3 text-sm text-slate-500">
              Suggested from your CV:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {roleOptions.map((item) => (
                <button
                  key={item}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${role === item ? "bg-[#5754bd] text-white" : "bg-indigo-50 text-[#5050bb]"}`}
                  onClick={() => setRole(item)}
                >
                  {role === item ? "✓ " : ""}
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7">
            <div className="flex flex-wrap justify-between gap-2">
              <label className="text-lg font-bold">
                2 · How much experience do you have?
              </label>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                ✧ Auto-detected: {parsedDetails?.yearsExperience ?? 0} yrs
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
              {experienceOptions.map((item) => (
                <button
                  key={item}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${experience === item ? "border-[#5754bd] bg-[#5754bd] text-white" : "border-slate-200 text-slate-600"}`}
                  onClick={() => setExperience(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7">
            <div className="flex justify-between gap-3">
              <label className="text-lg font-bold">
                3 · Where do you want to work?
              </label>
              <span className="text-sm text-slate-400">City or Remote</span>
            </div>
            <input
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-base outline-none focus:border-indigo-400"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <button
            className="mt-7 w-full rounded-xl bg-[#5754bd] px-5 py-3.5 text-lg font-bold text-white"
            onClick={saveAnswers}
          >
            Get my CV score →
          </button>
        </div>
      </section>
      {scoring && (
        <ScoringModal
          onClose={() => setScoring(false)}
          onContinue={() => {
            setScoring(false);
            setShowScore(true);
          }}
        />
      )}
      <Footer onAction={() => {}} />
    </main>
  );
}
