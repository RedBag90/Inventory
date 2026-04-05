---
Story ID: US-025
Epic: Observability & Quality
Title: Integration Tests for Core Feature Flows (RTL + MSW)
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a developer,
I want integration tests that verify complete feature flows from the user's perspective,
So that I can detect regressions in component-hook-service interactions before they reach production.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the inventory list flow, when tested, then: rendering shows items, status filter updates the list, empty state appears when no items exist
- [ ] Given the create item flow, when tested, then: form validation rejects invalid input, valid submission creates the item and it appears in the list
- [ ] Given the record sale flow, when tested, then: sale form submits, confirmation step shows computed profit, confirming records the sale and updates item status
- [ ] Given the monthly report flow, when tested, then: data loads and KPI cards render correct values for a mocked data set
- [ ] Given all integration tests, when run, then no real network requests are made (all intercepted by MSW)
- [ ] Given the full integration test suite, when run, then overall coverage is ≥ 70%

## Definition of Done
- [ ] MSW handlers set up for all Server Action responses used in integration tests
- [ ] Tests use `@testing-library/user-event` for interactions — not `fireEvent`
- [ ] Tests query by role, label, or text — never by class name or test ID
- [ ] Test files co-located with feature components (e.g. `ItemForm.test.tsx` next to `ItemForm.tsx`)
- [ ] All tests pass in CI (US-027)

## Assumptions
- MSW mocks are shared between integration tests and browser dev mode where possible
- No real DB or Clerk session is used in integration tests

## Dependencies
- US-009 through US-021 (features must be implemented to be tested)
- US-004 (TanStack Query must be wrapped in tests via a test utility)

## Open Questions
- None

## Traceability
- Spec section 18: Integration Tests (RTL + MSW) — 60% of test effort
- Feature doc: 06_observability_quality.md
