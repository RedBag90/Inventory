---
Story ID: US-020
Epic: Reporting
Title: Revenue / Cost / Profit Time Series Chart
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see a chart showing revenue, costs, and profit over time,
So that I can spot trends and identify my best and worst performing periods at a glance.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the reporting page, when it loads, then a line or bar chart renders showing revenue, costs, and profit per month for the selected year
- [ ] Given the chart, when it renders, then it has three distinct data series: revenue (blue), costs (red), profit (green)
- [ ] Given a month with no sales, when the chart renders, then that month shows 0 for all series — not a gap or missing data point
- [ ] Given the year filter, when the user changes the year, then the chart updates to show data for the new year
- [ ] Given fewer than 2 months of data, when the chart renders, then it still renders without error
- [ ] Given the chart, when rendered on a server component, then it does NOT cause a hydration error (Recharts requires `'use client'`)

## Definition of Done
- [ ] `RevenueChart.tsx` marked `'use client'` — Recharts is client-only
- [ ] Chart data derived from monthly report queries — no separate endpoint
- [ ] Three series rendered: revenue, costs, profit with distinct colours
- [ ] Empty months rendered as 0 (not skipped)
- [ ] Responsive container used — chart scales to viewport width
- [ ] Integration test: chart renders without error with 0, 1, and 12 months of data

## Assumptions
- Chart granularity is monthly — not weekly or daily in v1
- Year selection is the controlling filter — chart always shows all 12 months of the selected year

## Dependencies
- US-017 (monthly report data provides chart input)

## Open Questions
- None

## Traceability
- Spec section 5.3: Zeitreihe (Umsatz/Kosten/Gewinn)
- Spec section 4: Charts — Recharts
- Feature doc: 04_reporting.md
