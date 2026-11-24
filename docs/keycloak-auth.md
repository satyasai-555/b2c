# Keycloak B2C authentication

## Local startup

1. Install dependencies in `frontend` and `node-services` (`npm install`). If PowerShell blocks `npm.ps1`, use `npm.cmd install`.
2. Start Keycloak: `docker compose up keycloak`.
3. Copy `frontend/.env.example` to `frontend/.env` and `node-services/.env.example` to `node-services/.env`.
4. Run the API on port 9002 and the React app on port 5173.
5. Open `http://localhost:8080`, sign in with `admin / change-me-local-only`, and configure SMTP before testing email OTP.

The realm import creates `welhire-web` (public browser client) and `welhire-api` (bearer-only API audience). The web client uses Authorization Code + PKCE. The API validates the access token signature against Keycloak's JWKS and checks issuer, audience, and the email claim. Do not use the development admin password outside local development.

## OTP / passwordless production setup

Keycloak does not send an OTP merely because an API endpoint is called. Configure a Keycloak authentication flow (or install a maintained passwordless-email authenticator) that sends the code and completes the browser login. In the standard flow, users authenticate on the Keycloak-hosted page; the application never receives or stores the OTP. Configure SMTP, email verification, rate limits, brute-force protection, redirect URIs, HTTPS origins, and MFA policy in the realm.

## Deployment requirements

Set `KEYCLOAK_ISSUER_URL` to the externally reachable realm URL, not the Docker service name, in any API that validates tokens. Use the same public issuer in the browser and API, HTTPS everywhere, a persistent Keycloak database (PostgreSQL recommended), a secrets manager, and exact production redirect/web-origin allowlists. Keep access tokens in memory and let the Keycloak adapter refresh them; do not put tokens in localStorage.
