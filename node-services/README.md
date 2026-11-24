# WelHire node services

This Node service owns candidate creation, CV metadata, answers, interview records, and OTP authentication. It currently uses an in-memory repository so the API contract can be integrated before the database and Keycloak values are available.

Run with `npm install`, copy `.env.example` to `.env`, then run `npm run dev`. The default URL is `http://localhost:9002`.

Flow: create guest candidate, upload CV metadata, save answers, request OTP, verify OTP, then start and complete interviews. The verified response returns a session token and candidate. Candidate routes currently accept `x-candidate-id`; replace this with Keycloak middleware later without changing route payloads.

The repository interface is the database seam. Add a PostgreSQL/Prisma adapter implementing `CandidateRepository` when `DATABASE_URL` is supplied. In non-production mode OTP responses include `devCode` for local testing only.
