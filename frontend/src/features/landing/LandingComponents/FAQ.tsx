import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { SectionTitle } from './UI';
// Draft copy: obtain product/legal approval before launch, especially pricing and privacy.
const questions = [
  ['Is WelHire free to use?','The landing-page offer includes a free basic CV score. Full feature access and any paid plans will be confirmed when the service launches.'],
  ['How does the AI feedback work?','AI feedback is designed to highlight strengths, areas for improvement and suggestions based on your practice responses. The report shown here is an illustration.'],
  ['Do I need to login for CV analysis?','The basic CV score is intended to work without login, as shown in this design. Account requirements for detailed reports will be confirmed before launch.'],
  ['Can I edit and download my enhanced CV?','The planned CV enhancer includes AI suggestions, editable templates and PDF download. These features are not connected in this landing-page preview.'],
  ['What is a role-based interview?','A role-based interview lets you practise questions tailored to a target role and its key skills.'],
  ['How do interview credits work?','Interview credit allowances, usage rules and pricing are still to be confirmed.'],
  ['What is a JD-based interview?','A JD-based interview uses a job description to tailor practice questions to the skills and responsibilities of that opportunity.'],
  ['Will my data be shared with employers?','Please review the approved privacy policy when it becomes available before uploading personal information. Data-sharing terms are not defined in this preview.'],
  ['Can I practise for different roles?','The design supports practice for roles such as Data Analyst, Software Engineer and Product Manager. The final role catalogue will be confirmed at launch.'],
  ['What should I prepare before an interview?','Have your CV and target role or job description ready, and choose a quiet place with a stable internet connection.'],
];
export default function FAQ(){
  const [expanded,setExpanded]=useState(false);
  return <section id="faq" className="section border-y border-line bg-slate-50/60"><div className="wrap"><SectionTitle title="FAQs" subtitle="Find answers to common questions about our AI interview practice platform."/><div className="grid items-start gap-4 md:grid-cols-2">{questions.slice(0,expanded?10:8).map(([question,answer])=><details key={question} className="group rounded-2xl border border-line bg-white"><summary className="flex min-h-18 items-center gap-3 px-5 py-5 text-sm font-semibold"><span className="text-muted" aria-hidden="true">›</span>{question}<Plus className="faq-plus ml-auto shrink-0 text-muted transition-transform" size={17}/></summary><p className="px-9 pb-6 text-sm leading-7 text-muted">{answer}</p></details>)}</div><div className="mt-10 text-center"><button aria-expanded={expanded} onClick={()=>setExpanded(!expanded)} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand">{expanded?'Show fewer questions':'Show more questions'}<ChevronDown size={18} className={expanded?'rotate-180':''}/></button></div></div></section>;
}
