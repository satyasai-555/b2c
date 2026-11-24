import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
const issuer = process.env.KEYCLOAK_ISSUER_URL;
if (!issuer) console.warn("KEYCLOAK_ISSUER_URL is not configured");
const jwksUrl = process.env.KEYCLOAK_JWKS_URL || (issuer ? `${issuer.replace(/\/$/, "")}/protocol/openid-connect/certs` : undefined);
const jwks = jwksUrl ? createRemoteJWKSet(new URL(jwksUrl)) : null;
const audience = process.env.KEYCLOAK_AUDIENCE || process.env.KEYCLOAK_CLIENT_ID;
export type KeycloakUser = JWTPayload & { email: string; name?: string; preferred_username?: string };
export const isCompactJwt = (header: string | undefined) => {
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice(7).trim();
  return token.split(".").length === 3;
};
export async function verifyKeycloakToken(header: string | undefined) {
  if (!jwks || !isCompactJwt(header)) throw new Error("Not a Keycloak token");
  const compactToken = header!.slice(7).trim();
  const options = { ...(issuer ? { issuer } : {}), ...(audience ? { audience } : {}) };
  const { payload } = await jwtVerify(compactToken, jwks, options);
  if (typeof payload.email !== "string") throw new Error("Token does not contain an email");
  return payload as KeycloakUser;
}
