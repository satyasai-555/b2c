import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Menu, X, Gift } from 'lucide-react';
import { Logo } from './UI';
export type Action = (title: string) => void;
export default function Header({ onAction }: { onAction: Action }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleAction = (action: string) => {
    if (action === 'Refer & earn') {
      navigate('/refer');
      setOpen(false);
      return;
    }
    onAction(action);
  };
  const links = [['Features', '#features'], ['How It Works', '#how-it-works'], ['Contact Us', '#contact']] as const;
  return <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md"><div className="wrap flex h-21 items-center justify-between gap-6"><Logo/><nav aria-label="Main navigation" className="hidden gap-8 text-sm text-slate-600 lg:flex">{links.map(([label, href]) => <a key={href} href={href} className="hover:text-brand">{label}</a>)}</nav><div className="hidden items-center gap-5 md:flex"><button onClick={() => handleAction('Refer & earn')} className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-brand"><Gift size={18}/>Refer & earn</button><button onClick={() => handleAction('Login / Sign Up')} className="secondary border-violet-200! text-brand!">Login / Sign Up</button></div><button className="rounded-lg p-2 lg:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>{open && <nav id="mobile-menu" aria-label="Mobile navigation" className="wrap flex flex-col gap-5 border-t border-line py-6 lg:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}<button className="text-left text-brand md:hidden" onClick={() => handleAction('Refer & earn')}>Refer & earn</button><button className="primary md:hidden" onClick={() => handleAction('Login / Sign Up')}>Login / Sign Up</button></nav>}</header>;
}
