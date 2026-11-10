import { useRef } from "react";

export default function OtpInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");
  const update = (index: number, next: string) => {
    const clean = next.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = clean;
    onChange(nextDigits.join(""));
    if (clean && index < 5) refs.current[index + 1]?.focus();
  };
  return <div className="flex gap-2 sm:gap-3" role="group" aria-label="6-digit verification code">{digits.map((digit, index) => <input key={index} ref={(element) => { refs.current[index] = element; }} value={digit} inputMode="numeric" maxLength={1} aria-label={`Verification digit ${index + 1}`} onChange={(event) => update(index, event.target.value)} onKeyDown={(event) => { if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus(); }} className="h-12 w-12 flex-none rounded-xl border border-slate-300 bg-slate-50 text-center text-xl font-bold text-[#1d1d55] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 sm:h-14 sm:w-14" />)}</div>;
}
