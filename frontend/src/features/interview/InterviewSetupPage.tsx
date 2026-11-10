"use client";

import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Check,
  Clock3,
  FileText,
  Mic,
  Plus,
  Search,
  X,
} from "lucide-react";

import Footer from "../landing/LandingComponents/Footer";
import InterviewHeader from "../../components/layout/InterviewHeader";

type InterviewMode = "role" | "jd";

const ROLE = "UI Engineer";

const INITIAL_SKILLS = [
  "React",
  "JavaScript",
  "TypeScript",
  "Web performance",
  "Accessibility",
  "Testing",
  "Communication",
  "Problem solving",
];

const SUGGESTED_SKILLS = [
  "Next.js",
  "GraphQL",
  "System design",
  "Stakeholder management",
];

const MOCK_CREDITS = 2;

const inputClass =
  "w-full rounded-xl border border-[#dce3ef] bg-white px-4 py-3.5 " +
  "text-sm text-[#202052] outline-none transition " +
  "focus:border-brand focus:ring-4 focus:ring-brand/10";

export default function InterviewSetupPage() {
  const [mode, setMode] = useState<InterviewMode>("role");
  const [roleSkills, setRoleSkills] = useState(INITIAL_SKILLS);
  const [jdSkills, setJdSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [skillError, setSkillError] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const skillInputRef = useRef<HTMLInputElement>(null);

  const skills = mode === "role" ? roleSkills : jdSkills;
  const setSkills = mode === "role" ? setRoleSkills : setJdSkills;
  const navigate = useNavigate();

  const canContinue =
    skills.length > 0 &&
    MOCK_CREDITS > 0 &&
    (mode === "role" || jobDescription.trim().length > 0);

  function changeMode(nextMode: InterviewMode) {
    setMode(nextMode);
    setSkillInput("");
    setSkillError("");
    setNotice(null);
  }

  function addSkill(value: string) {
    const skill = value.trim().replace(/\s+/g, " ");

    if (!skill) {
      setSkillError("Enter a skill to add.");
      skillInputRef.current?.focus();
      return;
    }

    if (skill.length > 60) {
      setSkillError("Keep the skill name within 60 characters.");
      return;
    }

    if (
      skills.some(
        (existing) => existing.toLowerCase() === skill.toLowerCase(),
      )
    ) {
      setSkillError("This skill is already selected.");
      return;
    }

    if (skills.length >= 15) {
      setSkillError("You can select up to 15 skills.");
      return;
    }

    setSkills((current) => [...current, skill]);
    setSkillInput("");
    setSkillError("");
    setNotice(null);
    skillInputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    setSkills((current) => current.filter((item) => item !== skill));
    setSkillError("");
    setNotice(null);
  }

  function handleStart() {
  if (!canContinue) return;

  navigate("/interview/ready", {
    state: {
      setup: {
        mode,
        role: mode === "role" ? ROLE : "JD-based interview",
        skills: [...skills],
        jobDescription: mode === "jd" ? jobDescription.trim() : "",
      },
    },
  });
}

  // Replace with authenticated user data when login is integrated.
    const user = {
    displayName: "Candidate",
    initials: "C",
    };
  return (
    <div className="min-h-screen bg-white text-[#202052]">
      <InterviewHeader
  candidateName={user.displayName}
  initials={user.initials}
  credits={2}
  backTo="/"
/>

      <main className="mx-auto max-w-400 px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold tracking-[0.16em] text-brand">
            YOUR NEXT OPPORTUNITY STARTS HERE
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Set up your interview
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            Choose how you want to practise and the skills you want to
            focus on.
          </p>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
          <div className="min-w-0 space-y-6">
            <fieldset>
              <legend className="sr-only">Interview type</legend>

              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  {
                    value: "role" as const,
                    title: "Role-based",
                    description:
                      `Skills suggested for ${ROLE}. ` +
                      "The quickest way to start.",
                  },
                  {
                    value: "jd" as const,
                    title: "From a job description",
                    description:
                      "Paste a JD and choose the skills you want to practise.",
                  },
                ].map((option) => {
                  const selected = mode === option.value;

                  return (
                    <label
                      key={option.value}
                      className="relative block cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="interview-mode"
                        value={option.value}
                        checked={selected}
                        onChange={() => changeMode(option.value)}
                        className="peer sr-only"
                      />

                      <div
                        className={[
                          "relative h-full overflow-hidden rounded-2xl border",
                          "bg-white p-6 transition sm:min-h-40",
                          "peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20",
                          selected
                            ? "border-brand shadow-sm"
                            : "border-[#dce3ef] shadow-sm hover:border-violet-300",
                        ].join(" ")}
                      >
                        {selected && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-1 bg-brand"
                          />
                        )}

                        <div className="mb-3 flex items-start justify-between gap-4">
                          <span className="text-xl font-bold tracking-tight">
                            {option.title}
                          </span>

                          <span
                            aria-hidden="true"
                            className={[
                              "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                              selected
                                ? "bg-brand text-white"
                                : "bg-gray-200",
                            ].join(" ")}
                          >
                            {selected && <Check size={15} />}
                          </span>
                        </div>

                        <p className="text-sm leading-7 text-slate-600">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {mode === "jd" && (
              <section className="rounded-2xl border border-[#dce3ef] bg-white p-6 sm:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-brand">
                    <FileText size={20} />
                  </span>

                  <h2 className="text-xl font-bold">Job description</h2>
                </div>

                <label
                  htmlFor="job-description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Paste your target job description
                </label>

                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value);
                    setNotice(null);
                  }}
                  rows={7}
                  maxLength={20000}
                  placeholder="Include the role, responsibilities and required skills…"
                  className={`${inputClass} resize-y leading-7`}
                />

                <p className="mt-3 text-xs leading-6 text-muted">
                  Add the relevant skills below to configure this practice
                  session.
                </p>
              </section>
            )}

            <section
              aria-labelledby="skills-heading"
              className="rounded-2xl border border-[#dce3ef] bg-white p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2
                    id="skills-heading"
                    className="text-xl font-bold tracking-tight sm:text-2xl"
                  >
                    {mode === "role"
                      ? `Suggested skills for ${ROLE}`
                      : "Skills for your job description"}
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Remove any you don’t want tested, or add your own.
                  </p>
                </div>

                <span
                  aria-live="polite"
                  className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-brand"
                >
                  {skills.length} skills configured
                </span>
              </div>

              <ul
                aria-label="Selected skills"
                className="my-7 flex min-h-24 flex-wrap content-start gap-3"
              >
                {skills.map((skill) => (
                  <li
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-brand"
                  >
                    {skill}

                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() => removeSkill(skill)}
                      className="rounded-full p-0.5 text-brand/70 transition hover:bg-violet-200 hover:text-brand"
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}

                {skills.length === 0 && (
                  <li className="w-full rounded-xl border border-dashed border-[#dce3ef] p-5 text-sm text-muted">
                    Add at least one skill to configure your interview.
                  </li>
                )}
              </ul>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  addSkill(skillInput);
                }}
              >
                <label htmlFor="new-skill" className="sr-only">
                  Add a skill or domain competency
                </label>

                <div className="flex gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      aria-hidden="true"
                      size={20}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      ref={skillInputRef}
                      id="new-skill"
                      value={skillInput}
                      onChange={(event) => {
                        setSkillInput(event.target.value);
                        setSkillError("");
                      }}
                      maxLength={60}
                      aria-invalid={Boolean(skillError)}
                      aria-describedby={
                        skillError ? "skill-error" : undefined
                      }
                      placeholder="Add a skill or domain competency…"
                      className={`${inputClass} bg-slate-50 pl-12`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-slate-100 px-5 text-sm font-bold transition hover:bg-violet-100 hover:text-brand"
                  >
                    Add
                  </button>
                </div>

                {skillError && (
                  <p
                    id="skill-error"
                    role="alert"
                    className="mt-3 text-sm text-red-600"
                  >
                    {skillError}
                  </p>
                )}
              </form>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <span className="mr-1 text-xs font-semibold tracking-wide text-slate-600">
                  Also consider:
                </span>

                {SUGGESTED_SKILLS.filter(
                  (suggestion) =>
                    !skills.some(
                      (skill) =>
                        skill.toLowerCase() === suggestion.toLowerCase(),
                    ),
                ).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-violet-100 hover:text-brand"
                  >
                    <Plus size={13} className="text-cyan-700" />
                    {skill}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside
            aria-labelledby="session-heading"
            className="rounded-2xl border border-[#dce3ef] bg-white p-6 sm:p-7 lg:sticky lg:top-6"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold tracking-wide text-cyan-700">
                  INTERVIEW SESSION
                </p>

                <h2
                  id="session-heading"
                  className="text-2xl font-bold tracking-tight"
                >
                  {mode === "role"
                    ? `${ROLE} interview`
                    : "JD-based interview"}
                </h2>
              </div>

              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gray-100">
                <Mic size={21} />
              </span>
            </div>

            <dl className="space-y-3">
              {[
                {
                  label: "Based on",
                  value:
                    mode === "role" ? "Target role" : "Job description",
                },
                {
                  label: "Skills",
                  value: `${skills.length} selected`,
                },
                {
                  label: "Answer by",
                  value: "Voice or text",
                },
                {
                  label: "Length",
                  value: "About 15 min",
                  icon: <Clock3 size={17} className="text-cyan-700" />,
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3.5 text-sm"
                >
                  <dt className="text-slate-600">{label}</dt>

                  <dd className="flex items-center gap-1.5 text-right font-semibold">
                    {icon}
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="my-6 rounded-xl bg-indigo-50 p-4">
              <p className="text-sm text-cyan-950">
                Uses 1 credit · {MOCK_CREDITS - 1} left after
              </p>
            </div>

            <button
              type="button"
              disabled={!canContinue}
              onClick={handleStart}
              className="flex min-h-14 w-full items-center justify-center rounded-xl bg-brand px-5 py-4 text-base font-bold text-white transition hover:bg-[#443da1] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Start Interview
            </button>

            <p className="mt-3 text-center text-xs leading-6 text-slate-500">
              Check your microphone and choose how to answer before the
              interview begins.
            </p>

            {!canContinue && (
              <p className="mt-3 text-center text-xs leading-6 text-amber-700">
                {mode === "jd" && !jobDescription.trim()
                  ? "Paste a job description and select at least one skill."
                  : "Select at least one skill to continue."}
              </p>
            )}

            {notice && (
              <p
                role="status"
                className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-brand"
              >
                {notice}
              </p>
            )}
          </aside>
        </div>
      </main>

      <Footer
        onAction={(title) => {
          setNotice(`${title} is not available in this preview.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}