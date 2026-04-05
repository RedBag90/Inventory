---
Story ID: US-027
Epic: Observability & Quality
Title: GitHub Actions CI/CD Pipeline
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want a CI pipeline that automatically runs type checks, linting, tests, and a dependency audit on every push and PR,
So that regressions are caught before code is merged to main.

## MoSCoW Priority
- [x] Should Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given a push to any branch, when CI runs, then it executes: `tsc --noEmit` → `eslint` → `vitest` → `npm audit --audit-level=high` in sequence
- [ ] Given any step fails, when CI runs, then subsequent steps are skipped and the PR is blocked from merging
- [ ] Given a new push to the same branch while CI is running, when it triggers, then the previous CI run is cancelled (`cancel-in-progress: true`)
- [ ] Given the `quality` job passes, when CI continues, then the `e2e` job runs Playwright tests
- [ ] Given the E2E job fails, when CI reports, then a Playwright HTML report is uploaded as an artifact
- [ ] Given `npm audit`, when it finds a high-severity vulnerability, then the job fails

## Definition of Done
- [ ] `.github/workflows/ci.yml` committed with `quality` and `e2e` jobs
- [ ] `concurrency` block set with `cancel-in-progress: true`
- [ ] Node 20 used with npm cache enabled
- [ ] `npm ci` used — not `npm install`
- [ ] All existing tests pass in CI before this story is closed

## Assumptions
- Vercel preview deployments are handled automatically by the Vercel GitHub App — no manual CI step needed

## Dependencies
- US-024, US-025 (tests must exist to run)
- US-026 (E2E tests must exist for the e2e job)

## Open Questions
- None

## Traceability
- Spec section 19: CI/CD Pipeline (GitHub Actions)
- Feature doc: 06_observability_quality.md
