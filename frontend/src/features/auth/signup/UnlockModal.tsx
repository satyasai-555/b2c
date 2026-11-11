import { useState } from "react";
import OtpInput from "../signin/OtpInput";

function VerifiedDocument() {
  return (
    <div className="relative mx-0 mt-6 h-40 w-56 rounded-2xl bg-slate-100 p-4 shadow-inner sm:h-44 sm:w-64">
      <div className="flex items-start gap-3">
        <span className="grid h-[37px] w-[37px] place-items-center rounded-lg bg-[#171b59] text-[13px] text-white">
          ▤
        </span>
        <div className="space-y-2 pt-1">
          <i className="block h-2.5 w-28 rounded bg-slate-300" />
          <i className="block h-2.5 w-20 rounded bg-slate-300" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <i className="block h-2.5 w-full rounded bg-slate-300" />
        <i className="block h-2.5 w-full rounded bg-slate-300" />
        <i className="block h-2.5 w-4/5 rounded bg-slate-300" />
      </div>
      <span className="absolute bottom-4 left-4 rounded bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
        ✓ Verified
      </span>
      <span className="relative absolute -right-4 top-16 grid h-14 w-14 place-items-center rounded-2xl bg-[#5754bd] text-transparent shadow-xl shadow-indigo-300">
        <img
          src="/images/Lock%20icon.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 m-auto block h-6 w-5 object-contain brightness-0 invert"
        />
      </span>
    </div>
  );
}

function SecurityFooter() {
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-slate-100 pt-5 text-xs text-slate-500 sm:text-sm">
      <span>Zero spam guarantee</span>
      <span className="text-slate-300">•</span>
      <span>♙ 256-bit encryption</span>
    </div>
  );
}

export default function UnlockModal({
  onClose,
  onUnlocked,
}: {
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const ready = email.trim().length > 4 && consent;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4">
      <section className="unlock-modal relative w-full max-w-[900px] rounded-[1.5rem] bg-white p-5 shadow-2xl sm:p-7">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-2xl text-slate-600"
        >
          ×
        </button>
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-[#5054ba]">
              <img src="/images/Multi%20sparks.svg" alt="" aria-hidden="true" className="mr-1.5 mt-0 h-[13px] w-[13px] object-contain" />
               INSTANT FREE UNLOCK
            </span>
            <h2 className="mt-5 max-w-sm text-4xl font-extrabold leading-tight text-[#1d1d55]">
              {step === "email"
                ? "Log in to unlock your full report"
                : "Enter verification code"}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {step === "email" ? (
                "We'll email you a 6-digit code. No password needed."
              ) : (
                <>
                  We sent a 6-digit verification code to <b>{email}</b>.
                </>
              )}
            </p>
            <VerifiedDocument />
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <p>◈ &nbsp; Access your detailed CV analysis</p>
              <p>☆ &nbsp; See skill gap insights</p>
              <p>♙ &nbsp; Compare with other candidates</p>
              <p>▣ &nbsp; Unlock interview practice questions</p>
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-100 p-5 sm:p-6">
            {step === "email" ? (
              <>
                <label className="block text-sm font-bold text-slate-700">
                  EMAIL
                </label>
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <label className="mt-4 flex cursor-pointer gap-3 rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-5 w-5 accent-indigo-600"
                  />
                  I allow WelHire and its partner companies to view my profile
                  and contact me about job opportunities. (Required)
                </label>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => setStep("otp")}
                  className="mt-4 w-full rounded-xl bg-[#5754bd] px-4 py-3.5 font-bold text-white disabled:bg-[#aaaade]"
                >
                  Send code <span className="float-right">→</span>
                </button>
                <p className="mt-3 text-center text-sm text-slate-500">
                  {ready
                    ? "A verification code will be sent to your email."
                    : "Enter your email and accept consent to continue."}
                </p>
                <SecurityFooter />
              </>
            ) : (
              <>
                <label className="block text-sm font-bold text-slate-600">
                  ENTER 6-DIGIT CODE
                </label>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We sent a 6-digit verification code to <b>{email}</b>.{" "}
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="font-semibold text-[#5054ba]"
                  >
                    Change email
                  </button>
                </p>
                <div className="mt-5">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>
                <button
                  type="button"
                  disabled={otp.length !== 6}
                  onClick={onUnlocked}
                  className="mt-5 w-full rounded-xl bg-[#5754bd] px-4 py-3.5 font-bold text-white disabled:bg-[#aaaade]"
                >
                  Verify &amp; unlock report{" "}
                  <span className="float-right">→</span>
                </button>
                <p className="mt-3 text-center text-sm text-slate-500">
                  For this demo, enter any OTP and continue.
                </p>
                <SecurityFooter />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
