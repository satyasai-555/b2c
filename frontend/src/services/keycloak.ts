import Keycloak from "keycloak-js";

export const keycloakEnabled =
    import.meta.env.VITE_KEYCLOAK_ENABLED !== "false";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? "welhire",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "welhire-web",
});

let initialized: Promise<boolean> | undefined;
export function initKeycloak() {
  initialized ??= keycloak.init({ onLoad: "check-sso", pkceMethod: "S256", checkLoginIframe: false });
  return initialized;
}
export async function login() { await initKeycloak(); return keycloak.login(); }
export async function logout() { await keycloak.logout({ redirectUri: window.location.origin }); }
