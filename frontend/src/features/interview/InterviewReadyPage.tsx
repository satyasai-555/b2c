"use client";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  BriefcaseBusiness,
  Check,
  Clock3,
  Keyboard,
  Lightbulb,
  MessageCircle,
  Mic,
  ShieldCheck,
  Sparkles,
  VolumeX,
  Wifi,
} from "lucide-react";

import { useMicrophoneTest } from "../../hooks/useMicrophoneTest";
import InterviewHeader from "../../components/layout/InterviewHeader";


type InterviewSetup = {
  mode: "role" | "jd";
  role: string;
  skills: string[];
  jobDescription: string;
};

function isInterviewSetup(value: unknown): value is InterviewSetup {
  if (!value || typeof value !== "object") return false;

  const setup = value as Partial<InterviewSetup>;

  return (
    (setup.mode === "role" || setup.mode === "jd") &&
    typeof setup.role === "string" &&
    setup.role.trim().length > 0 &&
    Array.isArray(setup.skills) &&
    setup.skills.length > 0 &&
    setup.skills.length <= 15 &&
    setup.skills.every(
      (skill) => typeof skill === "string" && skill.trim().length > 0,
    ) &&
    typeof setup.jobDescription === "string" &&
    (setup.mode !== "jd" || setup.jobDescription.trim().length > 0)
  );
}

const panelClass = "rounded-2xl border border-[#dce3ef] bg-white";
const user = { displayName: "Candidate", initials: "C" };

export default function InterviewReadyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { setup?: unknown } | null;
  const setup = isInterviewSetup(state?.setup) ? state.setup : null;

  const [answerMode, setAnswerMode] = useState<"text" | "voice">("text");
  const microphone = useMicrophoneTest();

  const testing = microphone.status === "testing";
  const requesting = microphone.status === "requesting";

  if (!setup) {
    return (
      <main className="wrap py-16">
        <h1 className="heading">Configure your interview first</h1>

        <p className="subheading">
          Choose your interview type and skills before continuing.
        </p>

        <Link to="/interview/setup" className="primary mt-6">
          Go to interview setup
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#202052]">
      <InterviewHeader
  candidateName={user.displayName}
  initials={user.initials}
  backTo="/interview/setup"
/>

      <main className="wrap py-10 sm:py-12">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A moment to get ready.
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
              Settle in and choose how you’d like to answer.
              Your practice interview is next.
            </p>
          </div>

          <span className="rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-muted">
            Not started
          </span>
        </div>

        <section
          aria-label="Interview summary"
          className={`${panelClass} mb-6 grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4`}
        >
          {[
            {
              icon: BriefcaseBusiness,
              title: setup.role,
              description: "Your interview",
            },
            {
              icon: MessageCircle,
              title: "5 questions",
              description: "One at a time",
            },
            {
              icon: Clock3,
              title: "~10–15 minutes",
              description: "Estimated duration",
            },
            {
              icon: Sparkles,
              title: `${setup.skills.length} skills`,
              description: "Selected for practice",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={description} className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-brand">
                <Icon size={23} />
              </span>

              <div>
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-xs text-muted">{description}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className={`${panelClass} p-6 sm:p-8`}>
            <h2 className="text-xl font-bold">How would you like to answer?</h2>

            <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
              <legend className="sr-only">Answer mode</legend>

              {[
                {
                  value: "text" as const,
                  label: "Text answers",
                  description: "Type your responses",
                  icon: Keyboard,
                },
                {
                  value: "voice" as const,
                  label: "Voice answers",
                  description: "Speak your responses",
                  icon: Mic,
                },
              ].map(({ value, label, description, icon: Icon }) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="answer-mode"
                    checked={answerMode === value}
                    onChange={() => {
                      microphone.stop();
                      setAnswerMode(value);
                    }}
                    className="peer sr-only"
                  />

                  <span
                    className={[
                      "flex h-full items-center gap-3 rounded-xl border p-4",
                      "peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20",
                      answerMode === value
                        ? "border-brand bg-violet-50"
                        : "border-[#dce3ef] bg-white",
                    ].join(" ")}
                  >
                    <Icon size={22} className="shrink-0 text-brand" />

                    <span>
                      <span className="block text-sm font-semibold">
                        {label}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {description}
                      </span>
                    </span>

                    {answerMode === value && (
                      <Check size={18} className="ml-auto text-brand" />
                    )}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="my-7 border-t border-[#edf0f7]" />

            <h2 className="text-xl font-bold">Test microphone</h2>

            <p className="mt-2 text-sm leading-7 text-muted">
              Testing asks for microphone permission. Test audio is not
              recorded or submitted as an interview answer.
            </p>

            <div className="mb-3 mt-6 flex flex-wrap justify-between gap-2">
              <label
                htmlFor="microphone-device"
                className="text-sm font-semibold"
              >
                Microphone
              </label>

              <span className="text-xs text-muted">
                Optional for text answers
              </span>
            </div>

            <select
              id="microphone-device"
              value={microphone.deviceId}
              disabled={requesting}
              onChange={(event) =>
                microphone.selectDevice(event.target.value)
              }
              className="w-full rounded-xl border border-[#dce3ef] bg-white px-4 py-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            >
              <option value="">System default microphone</option>

              {microphone.devices
                .filter((device) => device.deviceId !== "default")
                .map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${index + 1}`}
                  </option>
                ))}
            </select>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  if (testing || requesting) {
                    microphone.stop();
                  } else {
                    void microphone.start();
                  }
                }}
                className="shrink-0 rounded-xl border border-[#dce3ef] px-5 py-4 text-sm font-bold transition hover:border-brand hover:bg-violet-50"
              >
                {requesting
                  ? "Cancel test"
                  : testing
                    ? "Stop testing"
                    : "Test microphone"}
              </button>

              <div className="min-w-0 flex-1">
                <div
                  role="meter"
                  aria-label="Microphone input level"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={microphone.level}
                  className="flex gap-1"
                >
                  {Array.from({ length: 24 }, (_, index) => (
                    <span
                      key={index}
                      className={`h-2 min-w-0 flex-1 rounded-full ${
                        testing &&
                        microphone.level > (index / 24) * 100
                          ? "bg-emerald-500"
                          : "bg-[#e2e8f3]"
                      }`}
                    />
                  ))}
                </div>

                <p
                  role="status"
                  className="mt-3 text-xs leading-6 text-muted"
                >
                  {requesting
                    ? "Allow microphone access in your browser."
                    : testing
                      ? "Speak to check your input level."
                      : microphone.signalDetected
                        ? "Audio input detected during your test."
                        : "Your microphone is off."}
                </p>
              </div>
            </div>

            {microphone.error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {microphone.error}
              </p>
            )}

            <p className="mt-6 text-xs leading-6 text-muted">
              Available microphones appear after permission is granted.
              Changing the device stops the current test.
            </p>
          </section>

          <aside className={`${panelClass} p-6 sm:p-8`}>
            <h2 className="mb-6 text-xl font-bold">Before you begin</h2>

            <div className="space-y-6">
              {[
                {
                  icon: VolumeX,
                  title: "Find a quiet spot",
                  text: "Choose somewhere comfortable, with fewer distractions.",
                },
                {
                  icon: Wifi,
                  title: "Keep your connection steady",
                  text: "Allow about 15 minutes without interruptions.",
                },
                {
                  icon: Lightbulb,
                  title: "Think of a project to share",
                  text: "Be ready to explain your choices and the impact of your work.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon
                    size={21}
                    className="mt-0.5 shrink-0 text-brand"
                  />

                  <div>
                    <h3 className="text-sm font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-start gap-3 border-t border-[#edf0f7] pt-6">
              <ShieldCheck size={22} className="shrink-0 text-cyan-600" />

              <div>
                <h3 className="text-sm font-bold">Your privacy matters</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Nothing is being recorded on this screen. The microphone
                  test only measures your input level locally.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section
          className={`${panelClass} mt-6 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-600">
              <Clock3 size={23} />
            </span>

            <div>
              <h2 className="text-sm font-bold sm:text-base">
                Your timer and answer recording have not started.
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                {answerMode === "text"
                  ? "You’ve selected text answers. Microphone access is optional."
                  : "You’ve selected voice answers. Recording begins only when you click Record answer on the next screen."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              microphone.stop();
              navigate("/interview/session", {
                state: { setup, answerMode, deviceId: microphone.deviceId },
              });
            }}
            className="min-h-14 shrink-0 rounded-xl bg-brand px-7 py-4 text-sm font-bold text-white hover:opacity-90"
          >
            Start Interview
          </button>
        </section>
      </main>

      <footer className="wrap flex flex-wrap justify-between gap-3 border-t border-[#edf0f7] py-7 text-xs text-muted">
        <span>© {new Date().getFullYear()} WelHire. All rights reserved.</span>
        <Link to="/" className="hover:text-brand">
          Back to home
        </Link>
      </footer>
    </div>
  );
}