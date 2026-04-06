---
Story ID: US-032
Epic: Enhanced Reporting
Title: Time Scale Toggle — Quarterly / Monthly
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to toggle all dashboard charts between quarterly and monthly granularity with a single control,
So that I can zoom in on monthly detail or zoom out to quarterly trends without reconfiguring each chart individually.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the dashboard, when the user selects "Monthly", then all x-axes show month labels (Jan, Feb, …) grouped by year
- [ ] Given the dashboard, when the user selects "Quarterly", then all x-axes show quarter labels (Qtr 1, Qtr 2, …) grouped by year
- [ ] Given the toggle is changed, when data is re-aggregated, then all 7 panels update simultaneously without page reload
- [ ] Given the toggle state, when a URL is shared, then the toggle position is encoded in the URL (e.g. `?granularity=monthly`)
- [ ] Given monthly view, when a month has no sales, then the bar still renders at zero height (no gap in x-axis)

## Definition of Done
- [ ] `granularity` filter added to reporting URL state alongside existing filters
- [ ] `useReportingFilters()` hook exposes `granularity: 'monthly' | 'quarterly'`
- [ ] All repository functions accept `granularity` and adjust `GROUP BY` accordingly
- [ ] Toggle renders as a segmented control in the global filter bar
- [ ] All `reportingKeys` include granularity to ensure correct cache separation

## Data Contract
```ts
type Granularity = 'monthly' | 'quarterly';

// Data point shape for all time-series charts
type TimePeriod = {
  label: string;     // "Jan 2026" | "Q1 2026"
  year:  number;
  month?: number;    // only in monthly granularity
  quarter?: number;  // only in quarterly granularity
};
```

## Dependencies
- US-021 (URL filter state infrastructure)
- US-031 (dashboard layout)

## Open Questions
- None
