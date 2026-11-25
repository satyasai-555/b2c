import Header from "../landing/LandingComponents/Header";
import Footer from "../landing/LandingComponents/Footer";
import { SummaryMetrics, WorkingAndFixes } from "./ReportDetails";
import { Link } from "react-router";
import { useCvAnalysis } from "../cv/CvAnalysisContext";

export default function AnalysisReport() {
  const { file, answers, parsedDetails, analysis } = useCvAnalysis();
  const role = answers.role;
  const cvName = file?.name || "CV document";
  const parsedAt = parsedDetails?.parsedAt ? new Date(parsedDetails.parsedAt).toLocaleString() : null;
  const candidateName = parsedDetails?.candidateName || cvName
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_]?/, "")
    .split(/[-_]+/)
    .filter((part) => part && !/^(cv|resume)$/i.test(part) && !/^\d+$/.test(part))
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ") || "CV document";
  const scoreLabel = analysis.score < 50 ? "Weak" : analysis.score < 70 ? "Medium" : "Strong";
  const scoreTone = analysis.score < 50
    ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
    : analysis.score < 70
      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200";
  return (
    <main className="analysis-report-page min-h-screen bg-white text-[#151b59]">
      <Header onAction={() => {}} />
      <section className="mx-auto max-w-360 px-5 py-8 md:px-10">

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0">
            <Link to="/interview/setup" className="float-right inline-flex items-center gap-3 rounded-full bg-[#5757bd] px-8 py-4 text-sm font-bold text-white shadow-sm sm:text-base">
              Proceed to Mock Interview <span aria-hidden="true" className="text-2xl leading-none">→</span>
            </Link>
            <div className="flex min-w-0 flex-wrap items-center gap-4">
              <h1 className="min-w-0 max-w-[min(100%,32rem)] truncate text-4xl font-extrabold" title={candidateName}>{candidateName}</h1>
              <span className="cv-report-role inline-block shrink-0 rounded-full bg-slate-100 px-4 py-2 font-semibold">
              <span className="cv-report-role-value">{role}</span>
              </span>
            </div>
            <p className="mt-3 flex min-w-0 items-center gap-2 text-slate-600">
              <img src="/images/CvImage.svg" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" />
              <span className="analysis-cv-name max-w-[min(32rem,70vw)] truncate">
               {cvName} · {parsedAt ? `Analysed ${parsedAt}` : "Analysed just now"}
              </span>
            </p>
            <div className="mt-5 flex gap-3">
              <button className="analysis-download-button inline-flex items-center gap-2 rounded-full border border-indigo-100 px-5 py-2.5 text-sm font-semibold">
                <img src="/images/DownLoad.svg" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" />
                <span>Download report</span>
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
              out of {analysis.maxScore} · {analysis.cards.length} weighted criteria
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-cyan-50 px-4 py-2 text-sm text-cyan-700">
              <img src="/images/MultiSparks.svg" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" />
              Projected with improvements: <b>~{analysis.projectedScore}</b>
            </div>
          </div>
        </div>
        {/* Temporarily hidden while the analysis layout is being finalized. */}
        {/* <section className="mt-8 rounded-3xl border border-indigo-100 p-8 shadow-sm">
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
        </section> */}
        {/* <section className="mt-7 rounded-3xl bg-linear-to-r from-[#21186e] to-[#172b60] p-8 text-white shadow-lg">
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
            </div>
          </div>
        </section> */}
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
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Performance at a glance</h2>
          <p className="mt-1 text-sm text-slate-500">Where you stand today, and how your CV contributes.</p>
          <article className="mt-5 rounded-3xl border border-indigo-100 p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-3"><h3 className="font-bold">Score vs target</h3><span className="text-xs text-brand">│ Target benchmark 75+</span></div>
            <div className="mt-5 space-y-5">{[["Overall CV fit", analysis.score, "#1d1d55"], ["Role knowledge", Math.min(analysis.maxScore, analysis.score + 5), "#087f91"]].map(([label, value, color]) => <div key={String(label)}><div className="flex justify-between text-sm"><span>{label}</span><b>{value}/{analysis.maxScore}</b></div><div className="relative mt-2 h-4 rounded bg-slate-100"><div className="h-full rounded" style={{ width: `${Number(value) / analysis.maxScore * 100}%`, background: color as string }}/><span className="absolute left-[75%] top-0 h-full w-0.5 bg-brand"/></div></div>)}</div>
            <div className="mt-4 flex justify-between text-xs text-slate-400"><span>0</span><span>25</span><span>50</span><span>75</span><span>{analysis.maxScore}</span></div><p className="mt-5 text-xs text-slate-500">Your current score is {Math.max(0, 75 - analysis.score)} points below the target benchmark.</p>
          </article>
        </section>
        <section className="mt-10">
          <h2 className="text-xl font-bold">Criteria &amp; Skills Analysis</h2>
          <p className="mt-1 text-sm text-slate-500">A comprehensive view of your skills, performance, and proficiency levels.</p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="rounded-3xl border border-indigo-100 p-5 shadow-sm sm:p-7"><h3 className="font-bold">Overall Analysis</h3><div className="mt-6 flex items-center gap-5"><div className="mx-auto w-full max-w-[260px]"><svg viewBox="0 0 260 220" className="w-full"><polygon points="130,20 230,190 30,190" fill="#eef0ff" stroke="#6970ed" strokeWidth="2"/><polygon points="130,48 200,170 60,170" fill="#cfd2ff" stroke="#6467ef" strokeWidth="2"/><line x1="130" y1="20" x2="130" y2="190" stroke="#d6d9ee"/><line x1="30" y1="190" x2="230" y2="190" stroke="#d6d9ee"/><text x="130" y="13" textAnchor="middle" fontSize="11">Hard Skills</text><text x="230" y="210" textAnchor="end" fontSize="11">Soft Skills</text><text x="30" y="210" fontSize="11">Behavioral</text></svg></div><div className="shrink-0 space-y-3 text-xs"><p>🔵 Hard Skills <b>{Math.min(100, analysis.score + 8)}%</b></p><p>🟠 Soft Skills <b>{Math.max(0, analysis.score - 4)}%</b></p><p>🟢 Behavioral <b>{Math.min(100, analysis.score + 2)}%</b></p></div></div></article>
            <article className="rounded-3xl border border-indigo-100 p-5 shadow-sm sm:p-7"><h3 className="font-bold">Skills Overview</h3><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Total Skills", parsedDetails?.skills.length ?? 0], ["Hard Skills", Math.max(1, Math.round((parsedDetails?.skills.length ?? 0) * .42))], ["Soft Skills", Math.max(1, Math.round((parsedDetails?.skills.length ?? 0) * .33))], ["Behavioral", Math.max(1, (parsedDetails?.skills.length ?? 0) - 2)]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-[10px] text-slate-500">{label}</p><b className="mt-1 block text-2xl">{value}</b></div>)}</div><p className="mt-10 text-center text-xs text-slate-400">Skill weights are standardized against the selected role.</p></article>
          </div>
        </section>
        <section className="mt-10"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Skills Breakdown</h2><p className="mt-1 text-sm text-slate-500">Detailed skills identified from your CV with proficiency levels.</p></div><span className="rounded-full border border-indigo-100 px-3 py-1 text-xs text-slate-500">All levels⌄</span></div><div className="mt-5 grid gap-5 lg:grid-cols-3">{[["Hard Skills", "Technical and domain-specific skills."], ["Soft Skills", "Interpersonal and communication skills."], ["Behavioral Skills", "Workstyle, mindset, and professional behavior."]].map(([group, description], groupIndex) => <article key={group} className="rounded-2xl border border-indigo-100 p-4 shadow-sm"><h3 className="font-bold">{group}</h3><p className="text-xs text-slate-500">{description}</p><div className="mt-5 space-y-4">{(parsedDetails?.skills.length ? parsedDetails.skills : [answers.role]).slice(groupIndex, groupIndex + 4).map((skill, index) => { const value = Math.max(55, Math.min(98, analysis.score + 20 - index * 6 - groupIndex * 3)); return <div key={skill}><div className="flex justify-between text-xs"><span>{skill}</span><b>{value}%</b></div><div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }}/></div></div>; })}</div></article>)}</div></section>
        <WorkingAndFixes />
        {/* Temporarily hidden while the analysis layout is being finalized. */}
        {/* <CriteriaEvidence /> */}
      </section>
      <Footer onAction={() => {}} />
    </main>
  );
}
