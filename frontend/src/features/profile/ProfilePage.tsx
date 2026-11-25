import { useEffect, useState } from "react";
import { Code2, Download, FileText, Pencil, Sparkles, Target, Upload, Video, Zap } from "lucide-react";
import Header from "../landing/LandingComponents/Header";
import { nameFromEmail, useCandidateSession } from "../../hooks/useCandidateSession";
import { useCvAnalysis } from "../cv/CvAnalysisContext";
import { candidateApi, type CandidateAggregate } from "../../services/candidateApi";
import { ProfileSkeleton } from "../../components/ui/Skeleton";

export default function ProfilePage() {
  const { user: storedUser } = useCandidateSession();
  const { profile, file, parsedDetails, analysis } = useCvAnalysis();
  const [aggregate, setAggregate] = useState<CandidateAggregate | null>(null);
  const [loading, setLoading] = useState(Boolean(storedUser?.candidateId));
  useEffect(() => {
    if (!storedUser?.candidateId) return;
    setLoading(true);
    candidateApi.getCandidate(storedUser.candidateId).then(setAggregate).catch(() => setAggregate(null)).finally(() => setLoading(false));
  }, [storedUser?.candidateId]);
  const apiCandidate = aggregate?.candidate;
  const apiCv = aggregate?.cvs?.[aggregate.cvs.length - 1] as { fileName?: string } | undefined;
  void apiCv;
  const interviews = (aggregate?.interviews ?? []).map((item, index) => {
    const record = item as { id?: string; role?: string; startedAt?: string; score?: number | null };
    const score = typeof record.score === "number" ? record.score : null;
    const label = score === null ? "Pending" : score < 50 ? "Poor" : score < 70 ? "Average" : score < 85 ? "Good" : "Excellent";
    return { id: record.id || `${record.role || "interview"}-${index}`, title: record.role || "Interview practice", date: record.startedAt ? new Date(record.startedAt).toLocaleDateString() : "Date unavailable", score: score === null ? "—" : String(score), label };
  });
  const parsedCount = parsedDetails?.skills.length ?? 0;
  const skillStats = [{ Icon: Target, label: "Total Skills", value: parsedCount }, { Icon: Code2, label: "Hard Skills", value: Math.max(1, Math.round(parsedCount * .42)) }, { Icon: Sparkles, label: "Soft Skills", value: Math.max(1, Math.round(parsedCount * .33)) }, { Icon: Zap, label: "Behavioral Skills", value: Math.max(1, parsedCount - Math.round(parsedCount * .42) - Math.round(parsedCount * .33)) }];
  const profileName = apiCandidate?.email ? nameFromEmail(apiCandidate.email) : storedUser?.email ? nameFromEmail(storedUser.email) : profile.name || "Guest";
  const profileInitials = storedUser?.initials || profile.initials || profileName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const user = { name: profileName, initials: apiCandidate?.initials || profileInitials, email: apiCandidate?.email || storedUser?.email || profile.email || "" };
  const role = apiCandidate?.role || profile.role || "Not provided";
  const experience = apiCandidate?.experience || profile.experience || "Not provided";
  const location = apiCandidate?.location || profile.location || "Not provided";
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
            {loading && <ProfileSkeleton />}
            {!loading && <>
            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#edf1f7] pb-5">
                <div className="flex items-center gap-4">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-indigo-50 text-2xl font-bold text-[#5754bd]">{user.initials}</span>
                  <div><h2 className="font-bold">{user.name}</h2><p className="text-sm">{role}</p><p className="text-xs text-[#7182a7]">⌖ {location}</p></div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-semibold text-[#5054ba]"><Pencil size={13} /> Edit profile</button>
              </div>
              <div className="grid gap-5 pt-5 text-xs sm:grid-cols-3">
                <div><p className="text-[#7182a7]">Current role</p><b>{role}</b></div><div><p className="text-[#7182a7]">Experience</p><b>{experience}</b></div><div><p className="text-[#7182a7]">Location</p><b>{location}</b></div>
                <div><p className="text-[#7182a7]">Email address</p>{user.email ? <p className="max-w-full truncate font-semibold" title={user.email}>{user.email}</p> : <button className="text-[#5054ba]">+ Add email</button>}</div><div><p className="text-[#7182a7]">Phone number</p><button className="text-[#5054ba]">+ Add phone</button></div><div><p className="text-[#7182a7]">Portfolio</p><button className="text-[#5054ba]">+ Add link</button></div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-lg bg-[#f8faff] px-3 py-2 text-xs text-[#8295b5]"><span>☷ &nbsp; A short introduction helps tell your career story.</span><button className="font-semibold text-[#5054ba]">Add bio</button></div>
            </section>

            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between"><h2 className="font-bold">My CV</h2><span className="text-xs text-[#8295b5]">Your next opportunity starts here</span></div>
              <div className="mt-4 rounded-lg border border-[#e6ebf5] bg-[#fbfcff] p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-[#5054ba]"><FileText size={17}/></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{file?.name || "No CV uploaded"}</p><p className="text-xs text-[#8295b5]">Keep your experience and achievements up to date.</p><div className="mt-3 flex flex-wrap gap-2"><button className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-white px-2 py-1 text-xs font-semibold"><Upload size={12}/> Replace CV</button><button className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-white px-2 py-1 text-xs font-semibold"><Download size={12}/> Download</button><button className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-white px-2 py-1 text-xs font-semibold"><Video size={12}/> View CV</button></div></div><span className="ml-auto rounded-full bg-indigo-50 px-2 py-1 text-[10px] text-[#5754bd]">{file ? "Uploaded" : "Not uploaded"}</span></div></div>
            </section>

            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf1f7] pb-5"><div><h2 className="font-bold">Skills Analysis</h2><p className="mt-1 text-xs text-[#7182a7]">Your skill strengths and proficiency levels from CV analysis and interview practice.</p></div><button className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-[#5054ba]">View All Skills <span>→</span></button></div>
              <div className="grid items-center gap-6 py-8 md:grid-cols-[150px_minmax(220px,1fr)_180px]">
                <div className="text-center md:text-left"><p className="text-xs text-[#7182a7]">Overall Skill Score</p><p className="mt-2 text-4xl font-bold">{analysis.score}<span className="text-lg font-normal text-[#8295b5]">/100</span></p><span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-600">{analysis.score >= 70 ? "Strong" : analysis.score >= 50 ? "Medium" : "Needs work"}</span></div>
                <div className="mx-auto w-full max-w-[260px]" aria-label="Skills radar chart"><svg viewBox="0 0 260 220" className="w-full"><polygon points="130,20 230,190 30,190" fill="#eef0ff" stroke="#6970ed" strokeWidth="2"/><polygon points="130,48 200,170 60,170" fill="#cfd2ff" stroke="#6467ef" strokeWidth="2"/><line x1="130" y1="20" x2="130" y2="190" stroke="#d6d9ee"/><line x1="30" y1="190" x2="230" y2="190" stroke="#d6d9ee"/><text x="130" y="13" textAnchor="middle" fontSize="11" fill="#334">Hard Skills {Math.min(100, analysis.score + 8)}</text><text x="230" y="210" textAnchor="end" fontSize="11" fill="#334">Soft Skills {Math.max(0, analysis.score - 4)}</text><text x="30" y="210" fontSize="11" fill="#334">Behavioral {Math.min(100, analysis.score + 2)}</text></svg></div>
                <div className="space-y-3 text-sm"><p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-indigo-600"/>Hard Skills <b className="float-right">{Math.min(100, analysis.score + 8)}%</b></p><p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-500"/>Soft Skills <b className="float-right">{Math.max(0, analysis.score - 4)}%</b></p><p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-emerald-500"/>Behavioral Skills <b className="float-right">{Math.min(100, analysis.score + 2)}%</b></p></div>
              </div>
              <div className="grid gap-3 border-t border-[#edf1f7] pt-4 sm:grid-cols-4">{skillStats.map(({ Icon, label, value }) => <div key={label} className="rounded-xl bg-[#f8faff] p-3"><Icon size={16} className="text-brand"/><p className="mt-2 text-[10px] text-[#7182a7]">{label}</p><b className="text-xl">{value}</b></div>)}</div>
            </section>

            <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 shadow-sm sm:p-6"><h2 className="font-bold">Interview history</h2><p className="mt-1 text-xs text-[#8295b5]">Revisit your feedback and decide what to practice next.</p>{interviews.length ? <div className="mt-4 divide-y divide-[#edf1f7] border-y border-[#edf1f7]">{interviews.map(({ id, title, date, score, label }) => <div key={id} className="flex items-center gap-3 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-slate-50 text-[#7182a7]"><FileText size={14}/></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{title}</p><p className="text-[10px] text-[#8295b5]">{date}</p></div><div className="text-right"><b className="text-sm">{score}{score !== "—" && <span className="text-[10px] font-normal text-[#8295b5]">/100</span>}</b><p className="text-[9px] text-[#7182a7]">{label}</p></div><button className="rounded-lg border border-indigo-100 px-3 py-2 text-[10px] font-semibold">View report</button></div>)}</div> : <p className="mt-4 rounded-lg bg-slate-50 p-4 text-xs text-[#7182a7]">No interview history is available yet.</p>}</section>
            {/* <section className="overflow-hidden rounded-2xl border border-[#dce4f3] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#edf1f7] p-5 sm:p-6"><div><h2 className="font-bold">Payment history</h2><p className="mt-1 text-xs text-[#8295b5]">Your credit purchases, receipts and payment status.</p></div><button className="inline-flex items-center gap-2 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-semibold"><Zap size={14} className="text-[#5754bd]"/> Buy credits</button></div><div className="divide-y divide-[#edf1f7]">{payments.map(([title, details, status, action], index) => <div key={`${title}-${details}`} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${status === "Failed" ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-[#52627a]"}`}><Receipt size={20}/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{title}</p>{index === 4 && <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-600">MOST POPULAR</span>}</div><p className="truncate text-xs text-[#7182a7]">{details}</p></div><div className="text-right"><b className="block">₹[PRICE]</b><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status === "Failed" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>{status}</span></div><button className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg border border-indigo-100 px-3 py-2 text-xs font-semibold">{action === "receipt" ? <><Download size={13}/> Receipt</> : "Details"}</button></div>)}</div><div className="flex items-center justify-between border-t border-[#edf1f7] px-5 py-4 text-xs text-[#7182a7] sm:px-6"><span>Showing <b className="text-[#192457]">1–5</b> of <b className="text-[#192457]">18</b> transactions</span><span>‹ Previous &nbsp; <b className="rounded bg-[#5754bd] px-2 py-1 text-white">1</b> &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; <button>Next ›</button></span></div><p className="border-t border-[#edf1f7] px-5 py-4 text-xs text-[#7182a7] sm:px-6"><Info size={14} className="mr-2 inline text-[#5754bd]"/>Failed payments are never charged. If money was debited, it’s refunded within [X] working days. <button className="font-semibold text-[#5054ba]">Contact support</button></p></section> */}
            </>}
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
