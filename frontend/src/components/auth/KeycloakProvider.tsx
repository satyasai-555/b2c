import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  initKeycloak,
  keycloak,
  keycloakEnabled,
  login,
  logout
} from "../../services/keycloak";

import { setAccessTokenProvider } from "../../services/candidateApi";

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  token?: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  authenticated: false,
  login,
  logout
});

export function KeycloakProvider({
                                   children
                                 }: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [, refresh] = useState(0);

  useEffect(() => {

    if (!keycloakEnabled) {
      setAccessTokenProvider(() => undefined);
      setReady(true);
      return;
    }

    setAccessTokenProvider(() => keycloak.token);

    void initKeycloak()
        .catch(() => {
          console.error("Keycloak initialization failed");
        })
        .finally(() => setReady(true));

    const timer = window.setInterval(() => {

      if (!keycloak.authenticated) return;

      void keycloak.updateToken(30)
          .then(() => refresh((x) => x + 1))
          .catch(() => undefined);

    }, 20000);

    return () => window.clearInterval(timer);

  }, []);

  return (
      <AuthContext.Provider
          value={{
            ready,
            authenticated:
                keycloakEnabled &&
                Boolean(keycloak.authenticated),
            token: keycloakEnabled
                ? keycloak.token
                : undefined,
            login: async () => {
              if (!keycloakEnabled) {
                throw new Error("Keycloak is disabled");
              }

              await login();
            },
            logout: async () => {
              if (keycloakEnabled) {
                await logout();
              }
            }
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export const useKeycloak = () => useContext(AuthContext);