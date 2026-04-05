---
Story ID: US-022
Epic: Observability & Quality
Title: Sentry Error Monitoring Integration
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want all unhandled errors automatically reported to Sentry,
So that I can identify and fix production issues without waiting for user reports.

## MoSCoW Priority
- [x] Should Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given an unhandled error in any Server Action, when it throws, then the error appears in the Sentry dashboard with stack trace
- [ ] Given an unhandled error in any Client Component, when it throws, then it is captured via React 19 root error hooks and reported to Sentry
- [ ] Given a production build, when an error is captured, then the error message is NOT shown in the UI (generic fallback only)
- [ ] Given a development build, when an error is captured, then the error message IS shown in the UI for debugging
- [ ] Given `SENTRY_DSN` is absent from env, when the app starts, then Sentry is silently disabled — the app still boots

## Definition of Done
- [ ] `@sentry/nextjs` installed and configured via `sentry.client.config.ts` and `sentry.server.config.ts`
- [ ] React 19 `onUncaughtError`, `onCaughtError`, `onRecoverableError` hooks wired to `Sentry.reactErrorHandler()`
- [ ] `SENTRY_DSN` in `EnvSchema` as optional field (already covered in US-003)
- [ ] Source maps uploaded to Sentry in CI build
- [ ] Test: trigger a deliberate error in development and verify it appears in Sentry

## Assumptions
- Sentry is disabled in test environments to prevent noise
- `SENTRY_DSN` is only required for staging and production Vercel environments

## Dependencies
- US-003 (env schema includes optional `SENTRY_DSN`)
- US-023 (error boundaries call Sentry capture)

## Open Questions
- None

## Traceability
- Spec section 4: Fehlermonitoring — Sentry
- Spec section 15: Error Handling — React 19 Root-Level Error Reporting
- Feature doc: 06_observability_quality.md
