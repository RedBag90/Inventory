---
Story ID: US-018
Epic: Reporting
Title: Quarterly Revenue, Cost & Profit Report
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see my aggregated revenue, costs, and profit for any given quarter,
So that I can assess my performance over a three-month period.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the reporting page, when the user selects a quarter (Q1–Q4) and year, then the report shows revenue, costs, profit, and items sold for that quarter
- [ ] Given Q1 selected, when the report loads, then it covers January, February, and March of the selected year
- [ ] Given Q2 selected, when the report loads, then it covers April, May, and June
- [ ] Given a quarter with no sales, when the report loads, then all values show €0.00 — not an error
- [ ] Given the filter selection, when a quarter is chosen, then the URL updates to `?view=quarterly&year=YYYY&quarter=N`
- [ ] Given the URL `?view=quarterly&year=2026&quarter=2`, when shared, then the same report loads for any user who clicks the link

## Definition of Done
- [ ] `ReportingRepository.getQuarterlyReport(year, quarter)` Server Action implemented, auth-checked
- [ ] Quarter-to-month mapping: Q1=1–3, Q2=4–6, Q3=7–9, Q4=10–12
- [ ] `useQuarterlyReport(year, quarter)` hook with `staleTime: 5 * 60_000`
- [ ] `reportingKeys.quarterly(year, quarter)` used as query key
- [ ] Filter state managed via `useSearchParams`
- [ ] Integration test: Q2 report aggregates only April–June sales

## Assumptions
- Quarter boundaries are calendar-based (not fiscal year)
- Implementation reuses `getMonthlyReport` internally by summing 3 months, OR is a single optimised query — either is acceptable

## Dependencies
- US-017 (monthly report infrastructure already in place)

## Open Questions
- None

## Traceability
- Spec section 5.3: Reporting & Auswertungen — Quartal
- Feature doc: 04_reporting.md
