---
Story ID: US-026
Epic: Observability & Quality
Title: Playwright E2E Tests for Critical User Journeys
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want automated end-to-end tests covering the four critical user journeys,
So that I have high confidence that the happy paths work correctly before every release.

## MoSCoW Priority
- [x] Should Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given E2E scenario 1 (registration), when a new user registers, then the dashboard loads with an empty inventory list
- [ ] Given E2E scenario 2 (create item), when the user fills the create item form and submits, then the new item appears in the inventory list
- [ ] Given E2E scenario 3 (record sale), when the user records a sale on an `IN_STOCK` item, then the item shows `SOLD` status and the correct profit value
- [ ] Given E2E scenario 4 (reporting filter), when the user changes the month filter on the reporting page, then the URL updates and the data refreshes
- [ ] Given all E2E tests, when run in CI, then they execute against a real browser (Chromium minimum)
- [ ] Given a failing E2E test, when CI runs, then a Playwright HTML report is uploaded as a build artifact

## Definition of Done
- [ ] 4 Playwright test files, one per scenario
- [ ] Tests run against the app booted with a seeded test DB (not production)
- [ ] Playwright configured for Chromium; Firefox and WebKit optional
- [ ] Test report uploaded on failure via `actions/upload-artifact@v4`
- [ ] E2E job in CI depends on the `quality` job passing first (US-027)

## Assumptions
- E2E tests run against a local or CI-seeded DB — not the production Supabase instance
- Clerk auth in E2E is handled via test credentials or Clerk's testing mode

## Dependencies
- US-005, US-006 (auth flows must work)
- US-009, US-014, US-017 (core features must be implemented)
- US-027 (CI pipeline runs E2E as a downstream job)

## Open Questions
- How is Clerk auth handled in E2E tests? → Research Clerk testing tokens / bypass mode

## Traceability
- Spec section 18: Kritische E2E-Szenarien (Playwright)
- Feature doc: 06_observability_quality.md
