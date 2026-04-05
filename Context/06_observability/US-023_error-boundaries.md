---
Story ID: US-023
Epic: Observability & Quality
Title: Feature-Level Error Boundaries
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want a broken feature to show a retry option without crashing the entire app,
So that I can recover from errors without losing my session or navigating away.

## MoSCoW Priority
- [x] Should Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given a runtime error in the inventory feature, when it throws, then only the inventory section shows an error fallback — sales and reporting are unaffected
- [ ] Given a runtime error in the reporting feature, when it throws, then only the reporting section shows the fallback
- [ ] Given the error fallback, when rendered, then it contains a "Try again" button
- [ ] Given the "Try again" button, when clicked, then `queryClient.invalidateQueries()` is called for that feature's keys and the component re-renders
- [ ] Given a production environment, when the fallback renders, then no raw error message or stack trace is visible to the user
- [ ] Given a development environment, when the fallback renders, then the error message IS visible for debugging

## Definition of Done
- [ ] `AppErrorBoundary.tsx` implemented using `react-error-boundary` + Sentry capture
- [ ] Each dashboard page route (`inventory`, `sales`, `reporting`) wrapped in its own `AppErrorBoundary`
- [ ] `onReset` prop wired to the correct feature's `invalidateQueries` call per route
- [ ] `ErrorFallback` component shows dev-only error details via `process.env.NODE_ENV` check
- [ ] No single root-level error boundary — one per feature

## Assumptions
- `react-error-boundary` package is used — not a custom class component

## Dependencies
- US-022 (Sentry captures errors reported by boundaries)
- US-004 (QueryClient available to pass to `onReset`)

## Open Questions
- None

## Traceability
- Spec section 15: Feature-Level Error Boundaries
- Feature doc: 06_observability_quality.md
