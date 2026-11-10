"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { isSessionInput, type SessionInput } from "./voice-types";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";
import { useLocalTranscription } from "../../hooks/useLocalTranscription";
import { Clock3, LogOut, X } from "lucide-react";
import InterviewReportPage from "../report/InterviewReportPage";
import InterviewHeader from "../../components/layout/InterviewHeader";

const panel = "rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm";
const button = "rounded-xl bg-[#534db6] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40";
const secondary = "rounded-xl border border-indigo-200 px-5 py-3 font-semibold text-[#262665] disabled:opacity-40";
type Answer = { question: string; text: string; audio: Blob | null };
function AudioReview({ blob, index }: { blob: Blob; index: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(blob); setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
  return <div className="my-4 space-y-3">
    <audio aria-label={`Answer ${index} recording`} controls src={url} className="w-full" />
    <a className="text-sm font-semibold text-brand underline" href={url} download={`answer-${index}.${extension}`}>Download recording</a>
  </div>;
}
export default function InterviewSessionPage() {
  const location = useLocation();
  const input: unknown = location.state;
  if (!isSessionInput(input)) return <main className="wrap py-16">
    <h1 className="text-3xl font-bold">Prepare your interview first</h1>
    <Link className="primary mt-6" to="/interview/setup">Go to setup</Link>
  </main>;
  return <Session key={location.key} input={input} />;
}
function Session({ input }: { input: SessionInput }) {
  const { setup, deviceId } = input;
  const [mode, setMode] = useState(input.answerMode);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const recorder = useVoiceRecorder(deviceId);
  const transcription = useLocalTranscription();
  const dialog = useRef<HTMLDialogElement>(null);
  const alive = useRef(true);
  const attempt = useRef(0);
  const lock = useRef(false);
  const mountedAt = useRef<number | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const active = recorder.status !== "idle";
  const blocked = active || transcription.busy;
  const questions = [
    `Tell me about a project relevant to a ${setup.role} role. What was your contribution and its outcome?`,
    `How have you applied ${setup.skills[0]} to solve a practical problem?`,
    `Describe a difficult trade-off you made. How did you decide what to prioritize?`,
    `Tell me about feedback from a teammate or stakeholder. How did you respond?`,
    `How would you measure whether your work was successful, and what would you improve?`,
  ];
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; attempt.current++; };
  }, []);
  useEffect(() => {
    if (complete) return;
    mountedAt.current ??= performance.now();
    const timer = setInterval(() => setElapsed(Math.floor((performance.now() - mountedAt.current!) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [complete]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    if (confirmEnd) dialog.current?.showModal(); else dialog.current?.close();
  }, [confirmEnd]);
  async function transcribe() {
    if (!recorder.blob || lock.current) return;
    lock.current = true;
    const request = ++attempt.current;
    setError("");
    try {
      const result = await transcription.transcribe(recorder.blob);
      if (!alive.current || request !== attempt.current) return;
      setText(result);
      if (!result) setError("No words were recognized. Retry, re-record, or type your answer.");
    } catch (cause) {
      if (alive.current && request === attempt.current) setError(cause instanceof Error ? cause.message : "Transcription failed.");
    } finally { if (request === attempt.current) lock.current = false; }
  }
  function cancelTranscription() {
    attempt.current++; lock.current = false; transcription.cancel(); setError("");
  }
  function saveAnswer(finish: boolean) {
    if (blocked) return;
    const hasAnswer = !!text.trim() || !!recorder.blob;
    if (hasAnswer) setAnswers(previous => [...previous, { question: questions[index], text: text.trim(), audio: recorder.blob }]);
    recorder.reset(); setText(""); setError("");
    if (finish || index === questions.length - 1) { setComplete(true); transcription.cancel(); }
    else setIndex(previous => previous + 1);
    setConfirmEnd(false);
  }
  function downloadTranscript() {
    const content = answers.map((a, i) => `${i + 1}. ${a.question}\n\n${a.text || "[Audio only: transcript not supplied]"}`).join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([`${setup.role}\nPractice interview — no AI assessment\n\n${content}`], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "interview-transcript.txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  if (complete) {
  return (
    <InterviewReportPage
      setup={setup}
      answers={answers}
      totalQuestions={questions.length}
      elapsedSeconds={elapsed}
      onDownloadTranscript={downloadTranscript}
    />
  );
}
  return <div className="min-h-screen bg-[#f8faff] text-[#202052]">
    <InterviewHeader
  candidateName="Candidate"
  initials="C"
  onBack={blocked ? undefined : () => setConfirmEnd(true)}
/>
    <main className="wrap py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-brand">Interview practice</p>
          <h1 className="mt-2 text-3xl font-bold">{complete ? "Your answers are ready to review" : setup.role}</h1></div>
        <span className="rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm">Session time {time}</span>
      </div>
      {complete ? <section className={panel}>
        <h2 className="text-xl font-bold">{answers.length} of 5 answers saved for this session</h2>
        <p className="my-3 text-sm leading-7 text-slate-600">Download your answers before leaving. Recordings and transcripts are held in memory only. AI assessment and scores are not connected yet.</p>
        <button className={button} onClick={downloadTranscript}>Download transcript</button>
        <div className="mt-6 space-y-4">{answers.map((answer, i) => <details className="rounded-xl border border-indigo-100 p-5" key={i} open={i === 0}>
          <summary className="cursor-pointer font-semibold">{i + 1}. {answer.question}</summary>
          <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">{answer.text || "Audio answer — no transcript supplied."}</p>
          {answer.audio && <AudioReview blob={answer.audio} index={i + 1} />}
        </details>)}</div>
        <Link className="mt-8 inline-block font-semibold text-brand underline" to="/interview/setup">Set up another interview (clears these answers)</Link>
      </section> : <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
        <aside className={panel}>
          <h2 className="text-xl font-bold">Your interview</h2>
          <p className="mt-4 font-semibold">{setup.role}</p><p className="mt-2 text-sm text-slate-500">5 practice questions · English voice transcription</p>
          <div className="mt-6 flex flex-wrap gap-2">{setup.skills.map(skill => <span className="rounded-full bg-violet-50 px-3 py-1 text-xs" key={skill}>{skill}</span>)}</div>
          <p className="mt-6 text-sm leading-7 text-slate-600">Use real examples. Explain your contribution, your reasoning, and the result.</p>
        </aside>
        <section className={`${panel} min-w-0`}>
          <div className="mb-6 rounded-xl bg-linear-to-br from-sky-100 to-indigo-100 px-6 py-8 text-center">
            <div aria-hidden="true" className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-[#242567] text-3xl text-sky-300">✦</div>
            <h2 className="text-xl font-bold">Take your time. Tell your story.</h2>
            <p className="mt-2 text-sm">Practice questions · Local AI transcription</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs">Question {index + 1} of 5</span>
          <h2 className="my-5 text-xl font-bold leading-8">{questions[index]}</h2>
          <fieldset disabled={blocked} className="mb-5 flex gap-5 disabled:opacity-50">
            <legend className="sr-only">Answer mode</legend>
            {(["text", "voice"] as const).map(value => <label className="flex items-center gap-2 text-sm" key={value}>
              <input type="radio" name="answer-mode" checked={mode === value} onChange={() => setMode(value)} />{value === "voice" ? "Voice answer" : "Text answer"}
            </label>)}
          </fieldset>
          {mode === "voice" && <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 p-5">
            <p className="mb-4 text-sm leading-6">Record in English, then transcribe. Audio stays on this device. First transcription downloads the model. The recording window is 3 minutes, including pauses.</p>
            <div className="flex flex-wrap gap-3">
              {recorder.status === "idle" && <button className={button} disabled={transcription.busy} onClick={() => { setError(""); void recorder.start(); }}>{recorder.blob ? "Replace recording" : "Record answer"}</button>}
              {recorder.status === "requesting" && <button className={secondary} onClick={recorder.reset}>Cancel microphone request</button>}
              {(recorder.status === "recording" || recorder.status === "paused") && <>
                <button className={secondary} onClick={recorder.togglePause}>{recorder.status === "paused" ? "Resume recording" : "Pause recording"}</button>
                <button className={button} onClick={recorder.stop}>Stop recording</button>
              </>}
            </div>
            <p role="status" className="mt-3 text-sm font-semibold">{recorder.status === "recording" ? "● Recording your answer" : recorder.status === "paused" ? "Recording paused" : recorder.status === "requesting" ? "Waiting for microphone permission…" : recorder.status === "stopping" ? "Saving audio…" : "Microphone off"}</p>
          </div>}
          {recorder.error && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{recorder.error}</p>}
          {recorder.blob && <>
            <AudioReview blob={recorder.blob} index={index + 1} />
            <button className={secondary} disabled={blocked} onClick={() => void transcribe()}>Transcribe recording{text.trim() ? " (replaces text below)" : ""}</button>
          </>}
          {transcription.busy && <div role="status" className="my-4 rounded-xl bg-violet-50 p-4 text-sm">
            <p>{transcription.message}</p><button className="mt-3 font-semibold underline" onClick={cancelTranscription}>Cancel transcription</button>
          </div>}
          {error && <p role="alert" className="my-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} Your audio remains available. You can type below.</p>}
          <label className="mb-2 mt-6 block text-sm font-semibold" htmlFor="answer">Your answer / editable transcript</label>
          <textarea id="answer" rows={7} maxLength={12000} value={text} disabled={transcription.busy} onChange={event => setText(event.target.value)} className="w-full rounded-xl border border-indigo-200 p-4 text-base leading-7 outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50" placeholder="Type your answer or transcribe a recording…" />
          <p className="mt-2 text-xs leading-6 text-slate-500">Review names, technical terms, and numbers. AI transcription can make mistakes. Replacing audio does not delete your edited text.</p>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button
  type="button"
  disabled={blocked}
  onClick={() => setConfirmEnd(true)}
  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-[#4169ff] bg-[#f5faff] px-6 py-3 text-lg font-semibold text-[#202b78] transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
>
  <LogOut size={22} strokeWidth={1.8} aria-hidden="true" />
  End interview
</button>
            <button className={button} disabled={blocked || (!text.trim() && !recorder.blob)} onClick={() => saveAnswer(false)}>{index === 4 ? "Finish and review" : "Save and next question"}</button>
          </div>
          {active && <p className="mt-3 text-xs text-slate-500">Stop recording before continuing or ending the interview.</p>}
        </section>
        <aside className={panel}>
          <h2 className="font-bold">Question progress · {index + 1}/5</h2>
          <div className="my-4 flex gap-2" aria-label={`${answers.length} answers saved`}>{questions.map((_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i < index ? "bg-emerald-500" : i === index ? "bg-indigo-500" : "bg-slate-100"}`} />)}</div>
          <p className="text-sm leading-7 text-slate-600">These are practice prompts, not AI-generated questions. No scores or skill assessments are calculated in this version.</p>
          <div className="mt-6 rounded-xl bg-sky-50 p-4 text-sm leading-7">Your recordings are not uploaded. Download audio and transcripts before refreshing or leaving.</div>
        </aside>
      </div>}
      <dialog
  ref={dialog}
  onCancel={() => setConfirmEnd(false)}
  aria-labelledby="end-title"
  aria-describedby="end-description"
  className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-180 overflow-y-auto rounded-3xl border border-[#dce3ef] bg-white p-6 text-[#202b78] shadow-2xl backdrop:bg-slate-950/40 sm:p-10"
>
  <div className="flex items-start justify-between">
    <span className="grid size-18 place-items-center rounded-[20px] border border-[#c9e2ff] bg-[#eaf5ff] text-[#4169ff]">
      <LogOut size={34} strokeWidth={1.7} aria-hidden="true" />
    </span>

    <button
      type="button"
      onClick={() => setConfirmEnd(false)}
      aria-label="Close end interview confirmation"
      className="rounded-lg p-2 text-[#4569b4] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <X size={24} aria-hidden="true" />
    </button>
  </div>

  <h2
    id="end-title"
    className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl"
  >
    End interview?
  </h2>

  <p
    id="end-description"
    className="mt-3 text-base leading-7 text-[#4569b4] sm:text-xl"
  >
    Ending now will stop this interview session.
  </p>

  <section
    aria-label="Current interview"
    className="mt-8 rounded-xl border border-[#c9ddff] bg-[#f5faff] p-5"
  >
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold sm:text-xl">
          {setup.role}
        </h3>

        <p className="mt-1 text-sm text-[#4569b4] sm:text-base">
          Question {index + 1} of {questions.length}
        </p>
      </div>

      <span className="inline-flex items-center gap-2 font-semibold">
        <Clock3
          size={20}
          className="text-[#4569b4]"
          aria-hidden="true"
        />
        {time}
      </span>
    </div>

    <div className="my-5 border-t border-[#c9ddff]" />

    <p className="text-sm leading-7 text-[#4569b4] sm:text-lg">
      Your saved responses and current answer will be available for
      review. Unanswered questions will be omitted.
    </p>
  </section>

  <div className="mt-8 grid gap-4 sm:grid-cols-[1.35fr_1fr]">
    <button
      type="button"
      autoFocus
      onClick={() => setConfirmEnd(false)}
      className="min-h-15.5 rounded-2xl bg-brand px-5 py-4 text-base font-bold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-lg"
    >
      Continue interview
    </button>

    <button
      type="button"
      onClick={() => saveAnswer(true)}
      className="inline-flex min-h-15.5 items-center justify-center gap-3 rounded-2xl border border-[#4169ff] bg-white px-5 py-4 text-base font-bold transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-lg"
    >
      <LogOut size={23} strokeWidth={1.8} aria-hidden="true" />
      End interview
    </button>
  </div>
</dialog>
    </main>
  </div>;
}
