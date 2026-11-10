"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { InterviewSetup } from "../interview/voice-types";
import "./interview-report.css";
import InterviewHeader from "../../components/layout/InterviewHeader";

type Answer = { question: string; text: string; audio: Blob | null };
type Props = {
  setup: InterviewSetup;
  answers: readonly Answer[];
  totalQuestions: number;
  elapsedSeconds: number;
  candidateName?: string;
  onDownloadTranscript: () => void;
};
const card = "rounded-3xl border border-[#d9ddff] bg-white p-6 sm:p-8";
const outlineButton = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d9ddff] bg-white px-5 py-3 text-sm font-semibold text-[#495c84] transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const sampleScores = [70, 56, 62, 72, 65];
const sampleChecklist = ["Explain the situation and your goal", "Describe your own actions and reasoning", "Share a concrete result and what you learned"];
const topics = [
  { label: "HIGHEST PRIORITY", title: "Clear communication", text: "Build concise answers with a clear beginning, decision, and result." },
  { label: "FRAMEWORK DRILL", title: "Measuring impact", text: "Practise explaining outcomes using meaningful evidence and metrics." },
  { label: "SCENARIO PRACTICE", title: "Explaining trade-offs", text: "Discuss competing priorities and why you chose one approach." },
];
function Mark({ children, tone = "violet" }: { children: ReactNode; tone?: "violet" | "green" | "amber" }) {
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-brand"}`}>{children}</span>;
}
function Recording({ blob, number }: { blob: Blob; number: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => { const value = URL.createObjectURL(blob); setUrl(value); return () => URL.revokeObjectURL(value); }, [blob]);
  const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
  return <div className="report-no-print mt-5 border-t border-indigo-100 pt-4">
    <audio controls src={url || undefined} aria-label={`Recording for question ${number}`} className="w-full" />
    <a href={url || undefined} download={`interview-answer-${number}.${extension}`} className="mt-3 inline-block text-sm font-semibold text-brand underline">Download this recording</a>
  </div>;
}
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="mt-7">
    <div className="mb-3 flex justify-between gap-3 font-semibold"><span className="text-[#495c84]">{label}</span><span>{value}/100</span></div>
    <div role="meter" aria-label={`${label}, illustrative demo score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="relative h-6 overflow-hidden rounded-md bg-slate-100">
      <div style={{ width: `${value}%`, backgroundColor: color }} className="h-full rounded-md" />
      <span aria-hidden="true" className="absolute inset-y-0 left-3/4 w-0.5 bg-brand" />
    </div>
  </div>;
}
function Radar() {
  const id = useId();
  const labels = ["Structure", "Evidence", "Trade-offs", "Impact"];
  const values = [70, 56, 62, 72];
  const point = (axis: number, value: number) => {
    const angle = -Math.PI / 2 + axis * Math.PI / 2;
    return `${200 + Math.cos(angle) * value},${150 + Math.sin(angle) * value}`;
  };
  return <>
    <svg viewBox="0 0 400 310" role="img" aria-labelledby={id} className="mx-auto mt-4 w-full max-w-md">
      <title id={id}>Illustrative demo radar: structure 70, evidence 56, trade-offs 62, impact 72 out of 100. Not calculated from your answers.</title>
      {[25, 50, 75, 100].map(value => <polygon key={value} points={[0, 1, 2, 3].map(axis => point(axis, value)).join(" ")} fill="none" stroke="#d3dced" strokeWidth="1.5" />)}
      {[0, 1, 2, 3].map(axis => <line key={axis} x1="200" y1="150" x2={point(axis, 100).split(",")[0]} y2={point(axis, 100).split(",")[1]} stroke="#d3dced" />)}
      <polygon points={values.map((value, axis) => point(axis, value)).join(" ")} fill="#534db6" fillOpacity=".15" stroke="#534db6" strokeWidth="2.5" />
      {values.map((value, axis) => <circle key={axis} cx={point(axis, value).split(",")[0]} cy={point(axis, value).split(",")[1]} r="4" fill="#534db6" />)}
      <g fill="#495c84" fontSize="12" textAnchor="middle">
        <text x="200" y="22">Structure · 70</text><text x="347" y="154">Evidence · 56</text>
        <text x="200" y="281">Trade-offs · 62</text><text x="51" y="154">Impact · 72</text>
      </g>
      {[25, 50, 75, 100].map(value => <text key={value} x="207" y={150 - value + 4} fontSize="10" fill="#8494b0">{value}</text>)}
    </svg>
    <ul className="sr-only">{labels.map((label, i) => <li key={label}>{label}: {values[i]} out of 100, demo only</li>)}</ul>
  </>;
}
function QuestionReview({ answer, index }: { answer: Answer; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const id = useId();
  return <article className="report-question overflow-hidden rounded-3xl border border-[#d9ddff]">
    <h3>
      <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)} className="flex w-full items-center gap-4 bg-[#fafaff] px-5 py-6 text-left transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand sm:gap-6 sm:px-8">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-100 font-semibold text-brand">{index + 1}</span>
        <span className="min-w-0 flex-1"><span className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8295b5]">Practice question</span><span className="text-base font-semibold leading-7">{answer.question}</span></span>
        <span className="hidden rounded-xl bg-emerald-50 px-4 py-3 text-center text-emerald-700 sm:block"><span className="block text-[10px] font-bold uppercase tracking-wide">Demo score</span><span className="whitespace-nowrap text-lg font-bold">{sampleScores[index % sampleScores.length]} / 100</span></span>
        <span aria-hidden="true" className="report-no-print text-xl text-[#495c84]">{expanded ? "−" : "+"}</span>
      </button>
    </h3>
    <div id={id} hidden={!expanded} className="report-answer-content border-t border-[#d9ddff] p-5 sm:p-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-[#d9ddff] bg-[#f9f9ff] p-5">
          <h4 className="text-sm font-bold text-brand">YOUR TRANSCRIPT & RESPONSE</h4>
          <p className="mt-4 whitespace-pre-wrap wrap-break-word text-base leading-8 text-[#495c84]">{answer.text.trim() || "Audio answer saved. No transcript was supplied for this question."}</p>
          {answer.audio && <Recording blob={answer.audio} number={index + 1} />}
        </section>
        <section className="rounded-xl border border-teal-100 bg-[#f4faf9] p-5">
          <h4 className="text-sm font-bold text-cyan-700">SAMPLE ANSWER STRUCTURE</h4>
          <p className="mt-4 text-base leading-8 text-[#495c84]">Explain the situation and the outcome you wanted. Describe your responsibility, the options you considered, and why you chose your approach. Finish with a specific result and one lesson you would apply next time.</p>
          <p className="mt-4 text-xs leading-6 text-cyan-700">General coaching example, not an ideal answer generated for this question.</p>
        </section>
      </div>
      <h4 className="mb-4 mt-6 text-sm font-bold">SELF-REVIEW CHECKLIST</h4>
      <ul className="grid gap-4 text-sm text-[#495c84] lg:grid-cols-3">{sampleChecklist.map(item => <li key={item} className="flex gap-3"><span aria-hidden="true" className="text-brand">○</span>{item}</li>)}</ul>
      <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-800">Practice tip: use your own contribution and concrete evidence. Avoid describing only what “we” did without explaining your role.</p>
      <p className="mt-4 text-xs leading-6 text-[#8295b5]">Demo score: {sampleScores[index % sampleScores.length]}/100. No criteria have been automatically assessed.</p>
    </div>
  </article>;
}
export default function InterviewReportPage({ setup, answers, totalQuestions, elapsedSeconds, candidateName = "Candidate", onDownloadTranscript }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [retakeOpen, setRetakeOpen] = useState(false);
  const retakeDialog = useRef<HTMLDialogElement>(null);
  const minutes = Math.floor(Math.max(0, elapsedSeconds) / 60);
  const seconds = Math.max(0, elapsedSeconds) % 60;
  const transcriptCount = answers.filter(answer => answer.text.trim()).length;
  const name = candidateName.trim() || "Candidate";
  useEffect(() => { window.scrollTo(0, 0); heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (retakeOpen) retakeDialog.current?.showModal(); else retakeDialog.current?.close(); }, [retakeOpen]);
  return <div className="interview-report min-h-screen bg-white text-[#1e1b55]">
    <div className="report-no-print">
  <InterviewHeader candidateName={name} initials="C" />
</div>
    <main className="wrap py-10 sm:py-14">
      <div className="mb-9 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
        <strong>Demo report.</strong> Your answers and recordings are real. All scores, benchmarks, and example feedback below are illustrative and are not calculated from your responses.
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section>
          <p className="text-sm font-semibold text-cyan-700">Interview Feedback & Scorecard</p>
          <div className="mt-4 flex flex-wrap items-center gap-4"><h1 ref={heading} tabIndex={-1} className="text-4xl font-bold tracking-tight outline-none sm:text-5xl">{name}</h1><Mark>{setup.role}</Mark></div>
          <p className="mt-5 text-sm leading-7 text-[#495c84]">{answers.length} of {totalQuestions} answers saved · {transcriptCount} transcripts available · Session time {minutes}:{String(seconds).padStart(2, "0")}</p>
          <div className="report-no-print mt-5 flex flex-wrap gap-3">
            <button type="button" className={outlineButton} onClick={() => window.print()}><span aria-hidden="true">↓</span> Print / save PDF report</button>
            <button type="button" className={outlineButton} onClick={() => setRetakeOpen(true)}><span aria-hidden="true">↻</span> Retake mock interview</button>
            <button type="button" className={outlineButton} onClick={onDownloadTranscript}>Download transcript</button>
          </div>
          <p className="report-no-print mt-4 text-xs leading-6 text-[#8295b5]">Download recordings separately below. Leaving or refreshing clears this session.</p>
        </section>
        <aside className={card}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8295b5]">Interview performance · Demo</p>
          <div className="mt-5 flex items-center gap-4"><span className="text-5xl font-bold">{answers.length ? "65" : "—"}<span className="font-normal text-[#8295b5]">/100</span></span>{answers.length > 0 && <Mark tone="amber">Sample score</Mark>}</div>
          <p className="mt-5 text-sm text-[#495c84]">{answers.length ? "Illustrative target: 75+" : "No answers were saved."}</p>
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-[#495c84]">Candidate standing: <strong>Not evaluated</strong></p>
        </aside>
      </div>
      <section className="mt-10">
        <h2 className="text-2xl font-bold">Summary</h2>
        <p className="mt-2 text-[#495c84]">Review your responses and prepare for your next practice session.</p>
        <div className={`${card} mt-5 flex flex-col items-start gap-4 sm:flex-row`}><Mark>SESSION SUMMARY</Mark><p className="flex-1 text-base leading-8 text-[#495c84]">{answers.length ? `You saved ${answers.length} answer${answers.length === 1 ? "" : "s"} for your ${setup.role} practice interview. Read your transcripts and listen back to your recordings. Automated evaluation is not connected yet; the sections below demonstrate the planned report layout.` : "This interview ended before an answer was saved. Start another practice session when you are ready."}</p></div>
      </section>
      {answers.length > 0 && <>
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Performance at a glance</h2><p className="mt-2 text-[#495c84]">Illustrative scores for the report preview.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className={card}><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">Score vs target</h3><span className="text-xs font-semibold text-brand">│ Demo target 75+</span></div>
              <ScoreBar label="Overall interview · Demo" value={65} color="#1e1b55" /><ScoreBar label="Domain knowledge · Demo" value={70} color="#007e92" />
              <div aria-hidden="true" className="mt-4 flex justify-between text-xs text-[#8295b5]">{[0,25,50,75,100].map(value => <span key={value}>{value}</span>)}</div>
              <p className="mt-7 text-sm leading-7 text-[#495c84]">The example overall score is 10 points below the illustrative benchmark. This does not describe your performance.</p>
            </div>
            <div className={card}><h3 className="text-xl font-bold">Response score radar · Demo</h3><p className="mt-2 text-xs leading-6 text-[#8295b5]">Sample dimensions and scores · Scale 0–100</p><Radar /></div>
          </div>
        </section>
        <section aria-label="Example feedback" className="mt-6 grid gap-6 lg:grid-cols-2">
          {[
            { title: "What’s working", badge: "Example positives", tone: "green" as const, symbol: "✓", items: [ ["Clear answer structure", "A strong response connects context, action, and outcome."], ["Relevant practical examples", "Specific situations make reasoning easier to follow."], ["Awareness of constraints", "Useful examples explain practical limits and dependencies."] ] },
            { title: "What to improve", badge: "Example focus areas", tone: "violet" as const, symbol: "↗", items: [ ["Explain the strategic why", "Connect decisions to user needs and business outcomes."], ["Replace generalities with evidence", "Use specific actions, measurable results, and lessons."], ["Be concise and outcome-focused", "Prioritize the details needed to understand your decision."] ] },
          ].map(group => <div key={group.title} className={card}><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">{group.title}</h3><Mark tone={group.tone}>{group.badge}</Mark></div><p className="mt-3 text-xs text-[#8295b5]">Sample coaching content — not findings about your answers.</p><ul className="mt-5 space-y-5 border-t border-slate-100 pt-6">{group.items.map(([title, text]) => <li className="flex gap-3" key={title}><span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-indigo-50 text-brand">{group.symbol}</span><div><h4 className="font-semibold text-slate-700">{title}</h4><p className="mt-2 text-sm leading-7 text-[#495c84]">{text}</p></div></li>)}</ul></div>)}
        </section>
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Question-by-question review</h2><p className="mt-2 text-[#495c84]">Your actual responses, with a general self-review guide.</p></div><span className="text-sm text-[#8295b5]">{answers.length} answers saved</span></div>
          <div className="mt-6 space-y-5">{answers.map((answer, index) => <QuestionReview key={index} answer={answer} index={index} />)}</div>
        </section>
        <section className="mt-10 rounded-3xl bg-linear-to-r from-[#21135f] to-[#20335a] p-7 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-300">YOUR NEXT STEP</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">Turn practice into your next opportunity.</h2><p className="mt-3 text-sm leading-7 text-indigo-100">Job recommendations will appear here when matching is connected. No job matches or verified skills have been calculated yet.</p>
        </section>
        <section className="mt-10"><h2 className="text-2xl font-bold">Recommended interview topics</h2><p className="mt-2 text-[#495c84]">General practice suggestions for this demo.</p><div className={`${card} mt-6 grid gap-7 lg:grid-cols-3`}>{topics.map(topic => <div key={topic.title} className="border-slate-100 lg:border-r lg:pr-6 lg:last:border-r-0"><p className="text-xs font-semibold text-brand">{topic.label}</p><h3 className="mt-4 text-lg font-bold">{topic.title}</h3><p className="mt-3 text-sm leading-7 text-[#495c84]">{topic.text}</p></div>)}</div></section>
      </>}
      <footer className="mt-12 border-t border-slate-100 pt-7 text-xs leading-6 text-[#8295b5]">© {new Date().getFullYear()} WelHire. Practice. Improve. Get hired.<br />Demo report — scores and sample feedback are illustrative, not an assessment.</footer>
    </main>
    <dialog ref={retakeDialog} onCancel={() => setRetakeOpen(false)} aria-labelledby="retake-title" className="report-no-print fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-indigo-100 p-8 shadow-xl backdrop:bg-slate-950/40">
      <h2 id="retake-title" className="text-2xl font-bold">Start another interview?</h2><p className="my-5 text-sm leading-7 text-[#495c84]">Download your transcripts and recordings first. Going back to setup clears the answers from this session.</p><div className="flex flex-wrap gap-3"><button autoFocus type="button" onClick={() => setRetakeOpen(false)} className={outlineButton}>Keep reviewing</button><Link to="/interview/setup" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">Go to setup</Link></div>
    </dialog>
  </div>;
}
