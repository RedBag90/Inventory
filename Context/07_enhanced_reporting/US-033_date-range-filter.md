---
Story ID: US-033
Epic: Enhanced Reporting
Title: Date Range Filter with Date Pickers
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to set a custom date range (from / to) for the entire dashboard,
So that I can focus on a specific period of business activity without being limited to preset month/quarter/year views.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the filter bar, when the user opens the "from" date picker, then they can select any date
- [ ] Given the filter bar, when the user opens the "to" date picker, then dates before the "from" date are disabled
- [ ] Given a date range is set, when all panels render, then only sales with `soldAt` within [from, to) are included
- [ ] Given the date range, when the URL is shared, then `?from=YYYY-MM-DD&to=YYYY-MM-DD` preserves the selection
- [ ] Given no date range is set, when the page loads, then it defaults to the user's earliest sale through today
- [ ] Given the date range changes, when the toggle is in quarterly mode, then incomplete quarters at the boundary are shown with partial data (not omitted)

## Definition of Done
- [ ] Two date inputs rendered in the global filter bar with `min`/`max` constraints
- [ ] `from` and `to` added to URL state and `useReportingFilters()`
- [ ] All server-side reporting queries use the date range as boundaries
- [ ] Default: `from` = earliest `soldAt` in DB for user; `to` = today
- [ ] Date picker uses native `<input type="date">` for v1 (no external library dependency)

## Dependencies
- US-021 (URL filter state)
- US-031 (dashboard layout)

## Open Questions
- Should "from" default to the first item ever purchased, or first item ever sold?
  → Recommendation: first `soldAt` date, as all charts are sales-based
