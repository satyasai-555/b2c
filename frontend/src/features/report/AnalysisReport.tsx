import Header from "../landing/LandingComponents/Header";
import Footer from "../landing/LandingComponents/Footer";
import { CvStepper } from "../cv/CvComponents";
import {
  CriteriaEvidence,
  SummaryMetrics,
  WorkingAndFixes,
} from "./ReportDetails";
import { Link } from "react-router";
import { useCvAnalysis } from "../cv/CvAnalysisContext";

const blocks = [
  ["21.3", "25%", "bg-[#161b58]"],
  ["16.0", "20%", "bg-[#303574]"],
  ["18.0", "20%", "bg-[#08778b]"],
  ["13.8", "15%", "bg-cyan-500"],
  ["9.5", "10%", "bg-indigo-900"],
  ["9.5", "10%", "bg-indigo-500"],
];

export default function AnalysisReport() {
  const { file, answers, analysis } = useCvAnalysis();
  const role = answers.role || "Target role";
  const cvName = file?.name || "CV document";
  const scoreLabel = analysis.score < 50 ? "Weak" : analysis.score < 70 ? "Medium" : "Strong";
  const scoreTone = analysis.score < 50
    ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
    : analysis.score < 70
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200";
  return (
    <main className="min-h-screen bg-white text-[#151b59]">
      <Header onAction={() => {}} />
      <CvStepper current={4} />
      <section className="mx-auto max-w-360 px-5 py-8 md:px-10">
        <span className="inline-block rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-[#5050bb]">
          ● Step 5 of 7: Initial Benchmark &amp; Analysis Ready
        </span>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
            <h1 className="max-w-full truncate text-4xl font-extrabold" title={cvName.replace(/\.[^.]+$/, "")}>{cvName.replace(/\.[^.]+$/, "")}</h1>
            <span className="cv-report-role mt-2 inline-block rounded-full bg-slate-100 px-4 py-2 font-semibold">
              <span className="cv-report-role-value">{role}</span>
              Product Manager · B2B SaaS
            </span>
            <p className="mt-3 flex min-w-0 items-center gap-2 text-slate-600">
              <img src="/images/CvImage.svg" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" />
              <span className="max-w-[min(32rem,70vw)] truncate">
               Phani_Kumar_CV_2025.pdf · Analysed just now
              </span>
            </p>
            <div className="mt-5 flex gap-3">
              <button className="analysis-download-button inline-flex items-center gap-2 rounded-full border border-indigo-100 px-5 py-2.5 text-sm font-semibold">
                <img src="/images/DownLoad.svg" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" />
                <span>Download report</span>
                ⇩ Download report
              </button>
              {/* <button className="px-3 py-2.5 text-sm font-semibold text-slate-600">
                ⟳ Re-upload CV
              </button> */}
            </div>
          </div>
          <div className="relative w-full rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Resume score
            </p>
            <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50">
              <img src="/images/VerifiedBadge.svg" alt="Verified score" className="h-5 w-5 object-contain" />
            </span>
            <strong className="mt-2 flex items-center gap-3 text-5xl">
              {analysis.score}{" "}
              <span className={`rounded-full px-3 py-1 text-base font-medium ${scoreTone}`}>
                {scoreLabel}
              </span>
            </strong>
            <p className="text-sm text-slate-500">
              out of 100 · 6 weighted criteria
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-cyan-50 px-4 py-2 text-sm text-cyan-700">
              <img src="/images/MultiSparks.svg" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" />
              Projected with 5 fixes: <b>~93</b>
            </div>
          </div>
        </div>
        <section className="mt-8 rounded-3xl border border-indigo-100 p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">
              Where the {analysis.score} points come from
            </h2>
            <p className="text-sm text-slate-500">
              Each block = weight × criterion score. Striped = points still
              available.
            </p>
          </div>
          <div className="mt-6 flex h-12 overflow-hidden rounded-xl">
            {blocks.map(([value, width, color]) => (
              <div
                className={`${color} flex items-center justify-center border-r-2 border-white text-sm text-white`}
                style={{ width }}
                key={value}
              >
                {value}
              </div>
            ))}
            <div className="flex flex-1 items-center justify-center bg-slate-100 text-sm text-slate-500">
              12 left
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
            <span>▪ Impact &amp; achievements · 25%</span>
            <span>▪ Skills &amp; keywords · 20%</span>
            <span>▪ Experience &amp; relevance · 20%</span>
            <span>▪ Formatting &amp; ATS · 15%</span>
            <span>▪ Education &amp; credentials · 10%</span>
            <span>▪ Readability &amp; structure · 10%</span>
          </div>
        </section>
        <section className="mt-7 rounded-3xl bg-linear-to-r from-[#21186e] to-[#172b60] p-8 text-white shadow-lg">
          <span className="rounded-full bg-indigo-400/30 px-4 py-2 text-sm font-semibold text-cyan-300">
            ⚡ AI-POWERED RESUME ENHANCER
          </span>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold">
                Enrich your profile with AI — Turn an 88 into a 93+
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-indigo-100">
                Our diagnostic model detected 5 high-leverage fixes across
                metric framing, B2B SaaS keyword density, and discovery
                terminology.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white/10 px-4 py-2">
                  ↗ +5 Projected points
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2">
                  ✓ 6 Ready-to-verify skills
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2">
                  ▣ ATS 98% pass rate
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <button className="rounded-full bg-cyan-300 px-8 py-4 font-bold text-cyan-950">
                Enrich my profile with AI →
              </button>
              <Link
                to="/interview/setup"
                className="rounded-full bg-white/10 px-8 py-3"
              >
                Proceed to Mock Interview (Step 6) →
              </Link>
            </div>
          </div>
        </section>
        <section className="mt-8">
          <h2 className="text-2xl font-bold">Summary</h2>
          <p className="mt-1 text-slate-500">
            The short version: how this resume reads against the target job
            profile.
          </p>
          <article className="mt-5 rounded-3xl border border-indigo-100 p-7 text-lg leading-8 text-slate-700 shadow-sm">
            <span className="rounded-full bg-indigo-100 px-4 py-2 text-xs font-bold">
              VERDICT
            </span>
            <p className="mt-5">
              A <b className="text-cyan-700">strong fit</b> for B2B SaaS product
              management. Hands-on ownership of an AI-based hiring platform,
              roadmap and backlog delivery, and a steady record of automation
              carry the score. What holds it back is <u>commercial language</u>:
              there is no adoption, retention, or revenue metric, and discovery
              practice is never explicitly named.
            </p>
          </article>
          <SummaryMetrics />
        </section>
        <WorkingAndFixes />
        <CriteriaEvidence />
      </section>
      <Footer onAction={() => {}} />
    </main>
  );
}
