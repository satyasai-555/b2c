"use client";

import { ArrowLeft, Gift } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "../../features/landing/LandingComponents/UI";

type InterviewHeaderProps = {
  candidateName?: string;
  initials?: string;
  credits?: number;
  backTo?: string;
  onBack?: () => void;
  onRefer?: () => void;
  jobsTo?: string;
};

export default function InterviewHeader({
  candidateName = "Candidate",
  initials = "C",
  credits = 2,
  backTo,
  onBack,
  onRefer,
  jobsTo,
}: InterviewHeaderProps) {
  const backClass =
    "inline-flex items-center gap-2 whitespace-nowrap text-base font-semibold text-brand transition hover:opacity-75";

  return (
    <header className="border-b border-[#edf0f7] bg-white">
      <div className="mx-auto flex min-h-24 max-w-480 flex-wrap items-center gap-x-6 gap-y-4 px-5 py-5 sm:px-8 2xl:px-10">
        {/* Logo and optional back action */}
        <div className="flex shrink-0 items-center gap-6">
          <Logo />

          {(onBack || backTo) && (
            <div className="border-l border-indigo-100 pl-6">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className={backClass}
                >
                  <ArrowLeft size={21} aria-hidden="true" />
                  Back
                </button>
              ) : (
                <Link to={backTo!} className={backClass}>
                  <ArrowLeft size={21} aria-hidden="true" />
                  Back
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-[#4b5c76] xl:order-0 xl:w-auto xl:flex-1 2xl:gap-x-10 2xl:text-lg"
        >
          <Link to="/#features" className="transition hover:text-brand">
            Features
          </Link>

          <Link
            to="/#how-it-works"
            className="transition hover:text-brand"
          >
            How It Works
          </Link>

          <Link to="/#contact" className="transition hover:text-brand">
            Contact Us
          </Link>

          {jobsTo ? (
            <Link to={jobsTo} className="transition hover:text-brand">
              Jobs for you
            </Link>
          ) : (
            <span title="Job recommendations are coming soon">
              Jobs for you
            </span>
          )}
        </nav>

        {/* Credits, referral and candidate */}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3 sm:gap-5">
          <span
            title="Demo credit balance"
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-[#eaf8ff] px-4 py-2 text-base font-bold text-[#0066d9] 2xl:text-xl"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-[#42c8ed]"
            />
            {credits} {credits === 1 ? "credit" : "credits"}
          </span>

          <button
            type="button"
            onClick={onRefer}
            disabled={!onRefer}
            title={onRefer ? "Refer & earn" : "Referrals are coming soon"}
            className="inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-base font-semibold text-brand transition enabled:hover:bg-indigo-100 disabled:cursor-default"
          >
            <Gift size={22} aria-hidden="true" />
            Refer & earn
          </button>

          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-[#1e1b55]">
              {candidateName}
            </span>

            <span
              aria-label={`${candidateName} profile`}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f1efff] text-lg font-semibold text-brand"
            >
              {initials}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}