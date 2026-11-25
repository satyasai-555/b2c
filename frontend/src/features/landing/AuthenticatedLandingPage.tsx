import { ArrowRight, Check, FileText, Play, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router";
import Header from "./LandingComponents/Header";
import Footer from "./LandingComponents/Footer";
import { ScoreRing, SkillBars } from "./LandingComponents/UI";
import { nameFromEmail, useCandidateSession } from "../../hooks/useCandidateSession";
import { useCvAnalysis } from "../cv/CvAnalysisContext";

export default function AuthenticatedLandingPage() {
  const navigate = useNavigate();
  const { user } = useCandidateSession();
  const { analysis, answers, parsedDetails } = useCvAnalysis();
  const displayName = user ? nameFromEmail(user.email) : parsedDetails?.candidateName || "Guest";
  const score = analysis.score;
  const parsedCount = parsedDetails?.skills.length ?? 0;
  const quickActions = [{ Icon: FileText, title: "Analyze My CV", description: "Get an AI-powered CV score and insights." }, { Icon: Play, title: "Start AI Interview", description: "Practice with role-based interview questions." }, { Icon: Target, title: "Skill Gap Analysis", description: "Identify gaps and get learning suggestions." }];
  const action = (title: string) => {
    if (title === "Analyze My CV") navigate("/cv-analysis");
    else if (title === "Practice an Interview") navigate("/interview/setup");
    else if (title === "Refer & earn") navigate("/refer");
  };

  return <div className="min-h-screen bg-[#fbfcff] text-[#17204d]">
    <Header onAction={action} />
    <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
      <section className="grid items-center gap-8 rounded-3xl bg-linear-to-br from-[#fbfaff] to-white py-4 lg:grid-cols-[1fr_.9fr] lg:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-brand">Welcome back, {displayName}</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Continue your career preparation and <span className="text-brand">get recruiter ready.</span></h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">Practice, get AI-led feedback, improve your skills, and unlock better job opportunities.</p>
          <div className="mt-7 flex flex-wrap gap-3"><button className="primary" onClick={() => action("Analyze My CV")}>Continue Practice <ArrowRight size={16}/></button><button className="secondary" onClick={() => action("Practice an Interview")}>Take AI Interview <ArrowRight size={16}/></button></div>
          <div className="mt-7 flex flex-wrap gap-5 text-xs text-slate-500"><span><Check size={14} className="mr-1 inline text-brand"/>Personalized practice</span><span><Check size={14} className="mr-1 inline text-brand"/>Real interview experience</span><span><Check size={14} className="mr-1 inline text-brand"/>Actionable feedback</span></div>
        </div>
        <div className="relative mx-auto flex h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl bg-indigo-50 sm:h-96"><img src={`${import.meta.env.BASE_URL}assets/design-reference.png`} alt="Candidate preparing for an interview" className="h-full w-full object-contain"/><div className="absolute left-3 top-3 rounded-xl bg-white/95 p-3 text-xs shadow-lg"><p className="text-slate-500">Your Prep Score</p><ScoreRing score={score} size={52}/><strong className="text-emerald-600">{score}% match</strong></div><div className="absolute bottom-3 right-3 rounded-xl bg-white/95 p-3 text-xs shadow-lg"><p className="font-semibold">Next up</p><p className="mt-1 text-slate-500">AI Mock Interview</p><button className="mt-2 rounded-lg bg-brand px-4 py-1.5 font-semibold text-white" onClick={() => action("Practice an Interview")}>Continue →</button></div></div>
      </section>

      <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Your Preparation at a Glance</h2><p className="mt-1 text-sm text-slate-500">Track your progress and keep improving.</p></div><button className="text-sm font-semibold text-brand" onClick={() => navigate("/cv-analysis/report")}>View Detailed Report →</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[score, "Prep Score"], [parsedCount, "Skills Detected"], [analysis.cards.length, "Report Areas"], [answers.role, "Target Role"]].map(([value, label]) => <article key={label} className="rounded-2xl border border-line bg-white p-5 shadow-sm"><Sparkles size={16} className="text-brand"/><p className="mt-4 truncate text-2xl font-bold" title={String(value)}>{value}{label === "Prep Score" && "%"}</p><p className="mt-1 text-xs text-slate-500">{label}</p></article>)}</div></section>

      <section className="mt-10"><h2 className="text-2xl font-bold">Continue Where You Left Off</h2><article className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"><span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-indigo-50 text-brand"><Play size={22}/></span><div className="min-w-0 flex-1"><p className="font-bold">AI Mock Interview</p><p className="text-xs text-slate-500">{answers.role} · Ready to start</p><div className="mt-2 h-1.5 max-w-md rounded-full bg-slate-100"><div className="h-full w-1/3 rounded-full bg-brand"/></div></div><button className="secondary" onClick={() => action("Practice an Interview")}>Resume <ArrowRight size={15}/></button></article></section>

      <section className="mt-10"><h2 className="text-2xl font-bold">Quick Actions</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{quickActions.map(({ Icon, title, description }) => <button key={title} className="rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => action(title)}><span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-brand"><Icon size={17}/></span><p className="mt-4 font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p><ArrowRight size={15} className="mt-4 ml-auto text-brand"/></button>)}</div></section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2"><article className="rounded-2xl border border-line bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Your Growth</h2><div className="mt-5 flex items-center gap-6"><ScoreRing score={score} size={105}/><div className="min-w-0 flex-1"><SkillBars compact/></div></div></article><article className="rounded-2xl bg-indigo-50 p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles size={18} className="text-brand"/>Recommended for You</h2><div className="mt-5 space-y-3">{analysis.recommendations.slice(0, 3).map((recommendation) => <button key={recommendation} className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm"><span>{recommendation}</span><ArrowRight size={15} className="shrink-0 text-brand"/></button>)}</div></article></section>
    </main>
    <Footer onAction={action} />
  </div>;
}
