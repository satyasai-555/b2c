import { useEffect, useState } from "react";

export type CandidateSessionUser = { email: string; name: string; initials: string; candidateId?: string; token?: string };
const USER_KEY = "welhire-demo-user";

function readUser(): CandidateSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(USER_KEY) || "null") as Partial<CandidateSessionUser> | null;
    return value?.email && value.name && value.initials ? value as CandidateSessionUser : null;
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
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    window.dispatchEvent(new Event("welhire-auth-changed"));
  };
  const signIn = (email: string) => {
    const localPart = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    const name = localPart.split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || email;
    const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
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
