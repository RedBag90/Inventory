---
Story ID: US-017
Epic: Reporting
Title: Monthly Revenue, Cost & Profit Report
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see my total revenue, costs, and profit for any given month,
So that I can track my financial performance on a monthly basis.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the reporting page, when the user selects a month and year, then the report shows total revenue, total costs, profit, and number of items sold for that period
- [ ] Given a month with no sales, when the report loads, then all values show €0.00 and items sold shows 0 — not an error
- [ ] Given the report, when revenue and costs are calculated, then only items with `soldAt` within the selected month are included
- [ ] Given the profit value, when displayed, then it equals `revenue − totalCosts` and matches the sum of individual item profits
- [ ] Given the filter selection, when a month is chosen, then the URL updates to `?view=monthly&year=YYYY&month=M`
- [ ] Given the URL `?view=monthly&year=2026&month=4`, when the page loads, then the April 2026 report is shown immediately

## Definition of Done
- [ ] `ReportingRepository.getMonthlyReport(year, month)` Server Action implemented, auth-checked
- [ ] Profit computed from raw fields — never read from a DB column
- [ ] `useMonthlyReport(year, month)` hook with `staleTime: 5 * 60_000`
- [ ] `reportingKeys.monthly(year, month)` used as query key
- [ ] Filter state managed via `useSearchParams` — not Zustand
- [ ] `KPICard.tsx` renders each metric (revenue, costs, profit, items sold)
- [ ] Integration test: report returns correct aggregated values for a known data set

## Assumptions
- Month boundaries are calculated in UTC to avoid timezone edge cases in v1
- Items are included based on `Sale.soldAt`, not `Item.purchasedAt`

## Dependencies
- US-014 (sales data must exist)
- US-002 (DB indexes on `soldAt` and `userId, purchasedAt`)
- US-004 (TanStack Query available)

## Open Questions
- None

## Traceability
- Spec section 5.3: Reporting & Auswertungen
- Spec section 13: Reporting-Queries
- Feature doc: 04_reporting.md
