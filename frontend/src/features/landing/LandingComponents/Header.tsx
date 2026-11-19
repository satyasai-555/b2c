import { useEffect, useState } from "react";
import { Gift, Menu, X } from "lucide-react";
import { useNavigate } from "react-router";
import { Logo } from "./UI";
import UnlockModal from "../../auth/signup/UnlockModal";

export type Action = (title: string) => void;
type StoredUser = { email: string; name: string; initials: string };

export default function Header({ onAction }: { onAction: Action }) {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const stored = window.localStorage.getItem("welhire-demo-user");
    if (!stored) return;
    try { setUser(JSON.parse(stored) as StoredUser); } catch { window.localStorage.removeItem("welhire-demo-user"); }
  }, []);
  const handleLogin = () => { setOpen(false); setLoginOpen(true); };
  const handleUnlocked = (email: string) => {
    const localPart = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    const name = localPart.split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "WelHire user";
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
    const nextUser = { email, name, initials };
    window.localStorage.setItem("welhire-demo-user", JSON.stringify(nextUser));
    setUser(nextUser); setLoginOpen(false);
  };
  const handleLogout = () => { window.localStorage.clear(); setUser(null); setOpen(false); navigate("/"); };
  const handleAction = (action: string) => { if (action === "Refer & earn") { setOpen(false); navigate("/refer"); } else if (action === "Login / Sign Up") handleLogin(); else onAction(action); };
  const links = [["Features", "#features"], ["How It Works", "#how-it-works"], ["Contact Us", "#contact"]] as const;
  const profileMenu = user ? <details className="relative"><summary className="flex cursor-pointer list-none items-center gap-3" aria-label={`Signed in as ${user.name}`}><span className="max-w-[100px] truncate font-semibold text-[#1d1d55]" title={user.name}>{user.name}</span><span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-brand">{user.initials}</span></summary><div className="absolute right-0 top-12 flex min-w-36 flex-col gap-1 rounded-lg border border-line bg-white p-1 shadow-lg"><button type="button" onClick={() => navigate("/profile")} className="rounded px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-brand">View profile</button><button type="button" onClick={handleLogout} className="rounded px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-brand">Log out</button></div></details> : <button onClick={handleLogin} className="secondary border-violet-200! text-brand!">Login / Sign Up</button>;
  return <>
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md"><div className="wrap flex h-21 items-center justify-between gap-6"><Logo/><nav aria-label="Main navigation" className="hidden gap-8 text-sm text-slate-600 lg:flex">{links.map(([label, href]) => <a key={href} href={href} className="hover:text-brand">{label}</a>)}</nav><div className="hidden items-center gap-5 md:flex"><button onClick={() => handleAction("Refer & earn")} className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-brand"><Gift size={18}/>Refer &amp; earn</button>{profileMenu}</div><button className="rounded-lg p-2 lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>{open && <nav id="mobile-menu" aria-label="Mobile navigation" className="wrap flex flex-col gap-5 border-t border-line py-6 lg:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}<button className="text-left text-brand" onClick={() => handleAction("Refer & earn")}>Refer &amp; earn</button>{user ? <div className="flex items-center gap-3"><span className="max-w-[100px] truncate font-semibold text-[#1d1d55]" title={user.name}>{user.name}</span><button type="button" onClick={() => navigate("/profile")} className="text-sm font-semibold text-brand">Profile</button><button type="button" onClick={handleLogout} className="text-sm font-semibold text-brand">Log out</button></div> : <button className="primary" onClick={handleLogin}>Login / Sign Up</button>}</nav>}</header>
    {loginOpen && <UnlockModal onClose={() => setLoginOpen(false)} onUnlocked={handleUnlocked} />}
  </>;
}
