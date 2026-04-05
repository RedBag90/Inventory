---
Story ID: US-019
Epic: Reporting
Title: Cumulative All-Time Report with Average Storage Duration
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see my all-time totals for revenue, costs, profit, and average storage duration,
So that I have a complete picture of my reselling performance to date.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the reporting page with "cumulative" view selected, when it loads, then it shows all-time: total revenue, total costs, total profit, total items sold, and average storage duration in days
- [ ] Given a user with no sales, when the cumulative report loads, then all values show 0 — not an error
- [ ] Given the average storage duration, when calculated, then it equals the mean of `calculateStorageDays()` across all sold items
- [ ] Given the cumulative report, when a new sale is recorded, then the report reflects the updated totals after cache invalidation
- [ ] Given the URL `?view=cumulative`, when the page loads, then the cumulative report is shown

## Definition of Done
- [ ] `ReportingRepository.getCumulativeReport()` Server Action implemented, auth-checked
- [ ] `avgStorageDays` computed using `ItemManager.calculateStorageDays()` logic
- [ ] `reportingKeys.cumulative()` used as query key
- [ ] `staleTime: 5 * 60_000` on the query
- [ ] `KPICard.tsx` used for each metric display
- [ ] Cache invalidated when a new sale is recorded (via `useRecordSale.onSuccess`)

## Assumptions
- Average storage duration only includes `SOLD` items — `IN_STOCK` items are excluded
- All-time means since the user's account was created — no date filter

## Dependencies
- US-017 (reporting infrastructure in place)
- US-013 (storage duration logic in `ItemManager`)

## Open Questions
- None

## Traceability
- Spec section 5.3: Kumuliert — Kosten, Umsatz, Gewinn
- Feature doc: 04_reporting.md — Cumulative Report
