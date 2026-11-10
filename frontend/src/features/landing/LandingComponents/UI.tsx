import type { ReactNode } from 'react';
import { FileText, ArrowUpRight, MessageCircle, Check, Video } from 'lucide-react';

export function Logo() {
  return <a href="/" aria-label="WelHire home" className="text-[30px] font-extrabold tracking-[-2px] text-black"><span className="text-[#272766]">W<span className="text-sky-500">e</span>l</span>Hire<span className="text-brand">.</span></a>;
}
export function SectionTitle({ title, accent, subtitle }: { title: string; accent?: string; subtitle: string }) {
  return <div className="mx-auto mb-12 max-w-4xl text-center"><h2 className="heading">{title} <span className="text-brand">{accent}</span></h2><p className="subheading">{subtitle}</p></div>;
}
export function IconBox({ children, tone = 'purple' }: { children: ReactNode; tone?: 'purple' | 'green' | 'blue' | 'pink' }) {
  const tones = { purple: 'bg-violet-100 text-violet-600', green: 'bg-emerald-100 text-emerald-600', blue: 'bg-sky-100 text-sky-600', pink: 'bg-pink-50 text-pink-500' };
  return <span className={`mb-6 inline-flex h-13 w-13 items-center justify-center rounded-2xl ${tones[tone]}`}>{children}</span>;
}
export function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  return <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`Sample score: ${score} percent`}><svg viewBox="0 0 120 120" className="-rotate-90"><circle cx="60" cy="60" r="49" stroke="#edf1f7" strokeWidth="11" fill="none"/><circle cx="60" cy="60" r="49" stroke="#10b981" strokeWidth="11" fill="none" strokeLinecap="round" pathLength="100" strokeDasharray={`${score} 100`}/></svg><span className="absolute inset-0 grid place-items-center text-2xl font-bold" style={{ fontSize: size * .23 }}>{score}%</span></div>;
}
export function SkillBars({ compact = false }: { compact?: boolean }) {
  const skills = compact ? [['Communication', 85, '#0ea5e9'], ['Problem Solving', 65, '#fbbf24'], ['System Design', 50, '#f43f5e']] as const : [['Communication', 85, '#0ea5e9'], ['Problem Solving', 78, '#7060fa'], ['Domain Knowledge', 80, '#3263ff'], ['Confidence', 88, '#10b981']] as const;
  return <div className="space-y-4">{skills.map(([label, value, color]) => <div key={label}><div className="mb-2 flex justify-between gap-3 text-sm text-muted"><span>{label}</span><strong>{value}%</strong></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }}/></div></div>)}</div>;
}
export function Character() {
  return <div className="character" aria-hidden="true"><svg viewBox="650 310 470 630" preserveAspectRatio="xMidYMax meet"><image href={`${import.meta.env.BASE_URL}assets/design-reference.png`} width="1848" height="940"/></svg></div>;
}
export function InterviewPreview() {
  return <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-[#e3e1ff] to-[#f2f6ff]" aria-label="Illustrative interview preview"><div className="text-center"><span className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full bg-white text-brand shadow-sm"><Video size={28}/></span><p className="text-sm font-semibold text-brand">AI interviewer</p></div><span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs text-muted">Practice at your pace</span></div>;
}
export function SmallBenefit({ kind, title, children }: { kind: 'resume' | 'feedback' | 'chat'; title: string; children: ReactNode }) {
  const Icon = kind === 'resume' ? FileText : kind === 'feedback' ? ArrowUpRight : MessageCircle;
  return <div className={`card shadow-[0_12px_40px_-20px_#aaa4ce] ${kind === 'feedback' ? 'bg-orange-50/50!' : kind === 'chat' ? 'bg-teal-50/70!' : 'bg-violet-50/60!'}`}><h3 className="mb-5 flex items-center gap-2 text-lg font-semibold"><Icon className="shrink-0 text-violet-500" size={20}/>{title}</h3>{children}</div>;
}
export function CheckLine({ children }: { children: ReactNode }) { return <div className="flex items-start gap-3 text-sm leading-relaxed text-slate-600"><Check size={19} className="mt-0.5 shrink-0 text-violet-500"/>{children}</div>; }
