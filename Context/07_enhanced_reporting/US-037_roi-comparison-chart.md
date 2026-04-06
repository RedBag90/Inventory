---
Story ID: US-037
Epic: Enhanced Reporting
Title: ROI Comparison Chart — Revenue vs Costs per Period
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see revenue and total costs as grouped bars for each time period,
So that I can immediately spot periods where costs outpace revenue (net loss) vs. periods of strong ROI.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the dashboard, when the ROI panel renders, then each time period shows two adjacent bars: Revenue (green) and Costs (red)
- [ ] Given the chart, when Revenue bar is taller than Costs bar, then the user can visually identify positive ROI for that period
- [ ] Given the chart, when a period has only costs but no revenue (item purchased but not yet sold), then the Costs bar renders and Revenue bar is zero
- [ ] Given the date pickers in this panel, when the user adjusts the date range, then this panel's data updates (shared with global filter)
- [ ] Given a tooltip on hover, when the user hovers a bar, then it shows the period, Revenue, Costs, and calculated ROI % (`(revenue - costs) / costs * 100`)

## Chart Specification
- Type: Grouped `BarChart` (Recharts)
- X-axis: time periods (per granularity)
- Y-axis: € amounts
- Bar 1: Revenue — fill `#22c55e` (green)
- Bar 2: Total Costs — fill `#ef4444` (red)
- Tooltip: period, revenue, costs, ROI %

## Definition of Done
- [ ] `getRoiData(filters)` server action returns `{ period, revenue, costs }[]`
- [ ] `useRoiData(filters)` TanStack Query hook
- [ ] `RoiChart.tsx` renders grouped bars with correct colors
- [ ] ROI % computed client-side in the tooltip formatter

## Dependencies
- US-031, US-032, US-033, US-034

## Open Questions
- None
