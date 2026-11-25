type SkeletonProps = { className?: string };

export function Skeleton({ className = "" }: SkeletonProps) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

export function ProfileSkeleton() {
  return <div className="space-y-6" role="status" aria-label="Loading profile">
    <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 sm:p-6"><div className="flex items-center gap-4 border-b border-[#edf1f7] pb-5"><Skeleton className="h-20 w-20 rounded-full" /><div className="flex-1 space-y-3"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-24" /></div></div><div className="grid gap-5 pt-5 sm:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-32" /></div>)}</div><Skeleton className="mt-5 h-10 w-full" /></section>
    <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 sm:p-6"><Skeleton className="h-6 w-24" /><Skeleton className="mt-5 h-24 w-full" /></section>
    <section className="rounded-2xl border border-[#dce4f3] bg-white p-5 sm:p-6"><Skeleton className="h-6 w-40" /><Skeleton className="mt-5 h-64 w-full" /></section>
  </div>;
}
