import { createContext, useContext, useEffect, useState } from "react";
import { initKeycloak, keycloak, login, logout } from "../../services/keycloak";
import { setAccessTokenProvider } from "../../services/candidateApi";

type AuthContextValue = { ready: boolean; authenticated: boolean; token?: string; login: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue>({ ready: false, authenticated: false, login, logout });
export function KeycloakProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [, refresh] = useState(0);
  useEffect(() => { setAccessTokenProvider(() => keycloak.token); void initKeycloak().finally(() => setReady(true)); const timer = window.setInterval(() => { void keycloak.updateToken(30).then(() => refresh((x) => x + 1)).catch(() => undefined); }, 20000); return () => window.clearInterval(timer); }, []);
  return <AuthContext.Provider value={{ ready, authenticated: Boolean(keycloak.authenticated), token: keycloak.token, login, logout }}>{children}</AuthContext.Provider>;
}
export const useKeycloak = () => useContext(AuthContext);
