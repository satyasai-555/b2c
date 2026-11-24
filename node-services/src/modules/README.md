# Node services modules

The service is organized around the candidate journey so API integrations can be added without changing the frontend contract:

- `auth/` — OTP request, verification, and session creation.
- `auth/auth.service.ts` — OTP business methods.
- `candidates/` — candidate routes and guest creation, profile updates, CV upload/parsing, and aggregation.
- `candidates/candidate.service.ts` — candidate business methods.
- `candidates/candidate.routes.ts` — candidate-flow API route registration.
- `cv/` — reserved for the real CV parser adapter and parsed-result services.
- `interviews/` — reserved for interview sessions and analysis adapters.

Shared domain types and the database adapter live in `../shared`. The current database is in-memory by design; it can be replaced when the database URL is available.
