import { useEffect, useState } from "react";

export type CandidateSessionUser = { email: string; name: string; initials: string; candidateId?: string; token?: string };
const USER_KEY = "welhire-demo-user";

export function nameFromEmail(email: string) {
  const localPart = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return localPart?.split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || email;
}

export function initialsFromName(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "C";
}

function readUser(): CandidateSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(USER_KEY) || "null") as Partial<CandidateSessionUser> | null;
    if (!value?.email) return null;
    const name = nameFromEmail(value.email);
    return { ...value, name, initials: initialsFromName(name) } as CandidateSessionUser;
  } catch { return null; }
}

export function useCandidateSession() {
  const [user, setUser] = useState<CandidateSessionUser | null>(() => readUser());
  useEffect(() => {
    const sync = () => setUser(readUser());
    window.addEventListener("storage", sync);
    window.addEventListener("welhire-auth-changed", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("welhire-auth-changed", sync); };
  }, []);
  const saveUser = (nextUser: CandidateSessionUser) => {
    const name = nameFromEmail(nextUser.email);
    const normalized = { ...nextUser, name, initials: initialsFromName(name) };
    window.localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    setUser(normalized);
    window.dispatchEvent(new Event("welhire-auth-changed"));
  };
  const signIn = (email: string) => {
    const name = nameFromEmail(email);
    const initials = initialsFromName(name);
    const nextUser = { email, name, initials };
    saveUser(nextUser);
    return nextUser;
  };
  const logout = () => {
    window.localStorage.clear();
    setUser(null);
    window.dispatchEvent(new Event("welhire-auth-changed"));
  };
  return { user, isAuthenticated: Boolean(user), saveUser, signIn, logout };
}
