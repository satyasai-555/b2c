"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import Header from "./LandingComponents/Header";
import Hero from "./LandingComponents/Hero";
import { Features, PracticeStudio } from "./LandingComponents/Features";
import Preparation from "./LandingComponents/Preparation";
import Progress from "./LandingComponents/Progress";
import FAQ from "./LandingComponents/FAQ";
import Footer from "./LandingComponents/Footer";

export default function LandingPage() {
  const [action, setAction] = useState<string | null>(null);
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!action) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [action]);

  const handleAction = (nextAction: string) => {
    if (nextAction === "Analyze My CV") {
      navigate("/cv-analysis");
      return;
    }
    if (nextAction === "Refer & earn") {
      navigate("/refer");
      return;
    }
    setAction(nextAction);
  };

  return <>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-4">Skip to content</a>
    <Header onAction={handleAction} />
    <main id="main"><Hero onAction={handleAction} /><Features /><PracticeStudio /><Preparation /><Progress /><FAQ /></main>
    <Footer onAction={handleAction} />
    <dialog ref={dialog} onCancel={() => setAction(null)} onClick={(event) => { if (event.target === event.currentTarget) setAction(null); }} aria-labelledby="action-title" aria-describedby="action-description" className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-line bg-white p-8 text-ink shadow-2xl backdrop:bg-slate-950/35">
      <div className="flex items-start justify-between gap-4"><h2 id="action-title" className="text-xl font-bold">{action}</h2><button aria-label="Close dialog" onClick={() => setAction(null)} className="rounded-lg p-1 text-muted"><X size={20} /></button></div>
      <p id="action-description" className="my-6 text-sm leading-7 text-muted">This feature is coming soon. You are viewing a preview of the WelHire landing page.</p>
      <button className="primary w-full" onClick={() => setAction(null)}>Continue exploring</button>
    </dialog>
  </>;
}
