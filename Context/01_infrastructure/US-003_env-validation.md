---
Story ID: US-003
Epic: Infrastructure & Platform
Title: Zod-Validated Environment Variables
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want all environment variables validated against a Zod schema at startup,
So that the app fails fast with a clear error message rather than silently breaking at runtime when a variable is missing or malformed.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given a missing `DATABASE_URL`, when the app starts, then it throws a descriptive Zod validation error and does not boot
- [ ] Given a missing `CLERK_SECRET_KEY`, when the app starts, then it throws and does not boot
- [ ] Given all required variables are present and valid, when the app starts, then `env` is exported as a fully-typed object
- [ ] Given any file in the codebase, when it needs an env variable, then it imports from `@/shared/config/env` — never from `process.env` directly
- [ ] Given `SENTRY_DSN` is absent, when the app starts, then it boots successfully (field is optional)

## Definition of Done
- [ ] `src/shared/config/env.ts` implemented with `EnvSchema` and exported `env` constant
- [ ] All 7 variables covered: `DATABASE_URL`, `DIRECT_DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `SENTRY_DSN` (optional), `NODE_ENV`
- [ ] `.env.example` lists all variables with placeholder values
- [ ] No direct `process.env` usage anywhere except in `env.ts`

## Assumptions
- `DIRECT_DATABASE_URL` is required even in local dev (both point to Docker)

## Dependencies
- None — this is standalone config infrastructure

## Open Questions
- None

## Traceability
- Spec section 16: Environment variables
- Spec section 21 (deployment checklist): env validation item
- Feature doc: 05_infrastructure.md
