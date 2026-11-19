import { useEffect, useState } from "react";
import { Download, FileText, Pencil, Sparkles, Upload, Video } from "lucide-react";
import Header from "../landing/LandingComponents/Header";

const interviews = [
  ["JavaScript fundamentals", "12 Sep 2026", "66", "Average"],
  ["React interview practice", "18 Sep 2026", "82", "Excellent"],
  ["Frontend systems design", "24 Sep 2026", "30", "Poor"],
  ["Behavioral storytelling", "09 Oct 2026", "78", "Good"],
  ["CSS architecture review", "02 Oct 2026", "91", "Excellent"],
] as const;

const payments = [
  ["3 interview credits", "Today · UPI · Ref [TXN ID]", "Successful", "receipt"],
  ["1 interview credit", "08 Oct 2026 · UPI · Ref [TXN ID]", "Successful", "receipt"],
  ["1 interview credit", "01 Oct 2026 · UPI · Ref [TXN ID]", "Successful", "receipt"],
  ["1 interview credit", "01 Oct 2026 · UPI · [FAILURE REASON] · Not charged", "Failed", "details"],
  ["3 interview credits", "08 Sep 2026 · UPI · Ref [TXN ID]", "Successful", "receipt"],
] as const;

type StoredUser = { name: string; initials: string; email: string };

export default function ProfilePage() {
  void payments;
  const [user, setUser] = useState<StoredUser>({
    name: "Candidate",
    initials: "C",
    email: "",
  });
  useEffect(() => {
    const storedUser = window.localStorage.getItem("welhire-demo-user");
    if (!storedUser) return;
    try {
      const parsed = JSON.parse(storedUser) as Partial<StoredUser>;
      setUser({
        name: parsed.name || "Candidate",
        initials: parsed.initials || "C",
        email: parsed.email || "",
      });
    } catch {
      window.localStorage.removeItem("welhire-demo-user");
    }
  }, []);
  return (
    <div className="min-h-screen bg-[#fbfcff] text-[#192457]">
      <Header onAction={() => {}} />
      <main className="mx-auto max-w-[1360px] px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profile overview</h1>
          <p className="mt-2 text-sm text-[#7182a7]">Your career profile, practice and progress. All in one place.</p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_330px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#edf1f7] pb-5">
                <div className="flex items-center gap-4">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-indigo-50 text-2xl font-bold text-[#5754bd]">{user.initials}</span>
                  <div><h2 className="font-bold">{user.name}</h2><p className="text-sm">Frontend Engineer</p><p className="text-xs text-[#7182a7]">⌖ Pune, India</p></div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-semibold text-[#5054ba]"><Pencil size={13} /> Edit profile</button>
              </div>
              <div className="grid gap-5 pt-5 text-xs sm:grid-cols-3">
                <div><p className="text-[#7182a7]">Current role</p><b>Frontend Engineer</b></div><div><p className="text-[#7182a7]">Experience</p><b>1–3 yrs</b></div><div><p className="text-[#7182a7]">Location</p><b>Pune, India</b></div>
                <div><p className="text-[#7182a7]">Email address</p>{user.email ? <p className="max-w-full truncate font-semibold" title={user.email}>{user.email}</p> : <button className="text-[#5054ba]">+ Add email</button>}</div><div><p className="text-[#7182a7]">Phone number</p><button className="text-[#5054ba]">+ Add phone</button></div><div><p className="text-[#7182a7]">Portfolio</p><button className="text-[#5054ba]">+ Add link</button></div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-lg bg-[#f8faff] px-3 py-2 text-xs text-[#8295b5]"><span>☷ &nbsp; A short introduction helps tell your career story.</span><button className="font-semibold text-[#5054ba]">Add bio</button></div>
            </section>

            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between"><h2 className="font-bold">My CV</h2><span className="text-xs text-[#8295b5]">Your next opportunity starts here</span></div>
              <div className="mt-4 rounded-lg border border-[#e6ebf5] bg-[#fbfcff] p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-[#5054ba]"><FileText size={17}/></span><div className="min-w-0"><p className="truncate text-sm font-semibold">Priya_Nair_CV.pdf</p><p className="text-xs text-[#8295b5]">Keep your experience and achievements up to date.</p><div className="mt-3 flex flex-wrap gap-2"><button className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-white px-2 py-1 text-xs font-semibold"><Upload size={12}/> Replace CV</button><button className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-white px-2 py-1 text-xs font-semibold"><Download size={12}/> Download</button><button className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-white px-2 py-1 text-xs font-semibold"><Video size={12}/> View CV</button></div></div><span className="ml-auto rounded-full bg-indigo-50 px-2 py-1 text-[10px] text-[#5754bd]">Uploaded</span></div></div>
            </section>

            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm sm:p-6"><h2 className="font-bold">Interview history</h2><p className="mt-1 text-xs text-[#8295b5]">Revisit your feedback and decide what to practice next.</p><div className="mt-4 divide-y divide-[#edf1f7] border-y border-[#edf1f7]">{interviews.map(([title, date, score, label]) => <div key={title} className="flex items-center gap-3 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-slate-50 text-[#7182a7]"><FileText size={14}/></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{title}</p><p className="text-[10px] text-[#8295b5]">{date}</p></div><div className="text-right"><b className="text-sm">{score}<span className="text-[10px] font-normal text-[#8295b5]">/100</span></b><p className="text-[9px] text-[#7182a7]">{label}</p></div><button className="rounded-lg border border-indigo-100 px-3 py-2 text-[10px] font-semibold">View report</button></div>)}</div><div className="mt-4 flex items-center justify-between text-[10px] text-[#7182a7]"><span>Showing 1–5 of 18 transactions</span><span>‹ Previous &nbsp; <b className="rounded bg-[#5754bd] px-2 py-1 text-white">1</b> &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; Next ›</span></div></section>
            {/* <section className="overflow-hidden rounded-2xl border border-[#dce4f3] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#edf1f7] p-5 sm:p-6"><div><h2 className="font-bold">Payment history</h2><p className="mt-1 text-xs text-[#8295b5]">Your credit purchases, receipts and payment status.</p></div><button className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-semibold"><Zap size={14} className="text-[#5754bd]"/> Buy credits</button></div><div className="divide-y divide-[#edf1f7]">{payments.map(([title, details, status, action], index) => <div key={`${title}-${details}`} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${status === "Failed" ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-[#52627a]"}`}><Receipt size={20}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{title}</p>{index === 4 && <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-600">MOST POPULAR</span>}</div><p className="truncate text-xs text-[#7182a7]">{details}</p></div><div className="text-right"><b className="block">₹[PRICE]</b><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status === "Failed" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>{status}</span></div><button className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-semibold">{action === "receipt" ? <><Download size={13}/> Receipt</> : "Details"}</button></div>)}</div><div className="flex items-center justify-between border-t border-[#edf1f7] px-5 py-4 text-xs text-[#7182a7] sm:px-6"><span>Showing <b className="text-[#192457]">1–5</b> of <b className="text-[#192457]">18</b> transactions</span><span>‹ Previous &nbsp; <b className="rounded bg-[#5754bd] px-2 py-1 text-white">1</b> &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; <button>Next ›</button></span></div><p className="border-t border-[#edf1f7] px-5 py-4 text-xs text-[#7182a7] sm:px-6"><Info size={14} className="mr-2 inline text-[#5754bd]"/>Failed payments are never charged. If money was debited, it’s refunded within [X] working days. <button className="font-semibold text-[#5054ba]">Contact support</button></p></section> */}
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">Your profile is taking shape</h2><Sparkles size={16} className="text-[#5754bd]"/></div><p className="mt-5 text-4xl font-bold">70% <span className="text-xs font-normal text-[#8295b5]">profile complete</span></p><div className="mt-3 h-1.5 rounded-full bg-indigo-50"><div className="h-full w-[70%] rounded-full bg-cyan-400"/></div><p className="mt-3 text-xs text-[#8295b5]">A few more details can make your career story clearer.</p><button className="mt-5 w-full rounded-lg bg-[#5754bd] px-3 py-2 text-xs font-semibold text-white"><Sparkles size={12} className="mr-1 inline"/> Enrich profile with AI</button></section>
            {/* <section className="rounded-2xl bg-[#292568] p-5 text-white shadow-sm"><div className="flex justify-between text-[10px] font-semibold"><span>INTERVIEW CREDITS</span><Zap size={15} className="text-cyan-300"/></div><p className="mt-5 text-4xl font-bold text-amber-300">0 <span className="text-xs font-normal text-white">credits left</span></p><p className="mt-3 text-xs text-indigo-100">You’ve used all your credits. Top up to keep practicing with AI interviews.</p><button className="mt-4 w-full rounded-lg bg-[#5754bd] py-2 text-xs font-semibold">→ &nbsp; Buy Credits</button><div className="mt-5 border-t border-white/10 pt-4 text-[10px] text-indigo-100"><button className="font-semibold">🎁 &nbsp; Refer a friend</button><p>Earn more interview credits</p></div></section> */}
          </aside>
        </div>
      </main>
    </div>
  );
}
