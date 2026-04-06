---
Story ID: US-038
Epic: Enhanced Reporting
Title: Gained Value Analysis — Cumulative Revenue by Item
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see my cumulative revenue growing over time, broken down by item in a stacked chart,
So that I can understand the compounding effect of successful sales and which items contributed most to total lifetime revenue.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the dashboard, when the Gained Value panel renders, then it shows a stacked bar chart where each bar represents accumulated revenue up to that period
- [ ] Given the cumulative calculation, when a new period is reached, then each item's bar height equals the sum of all its previous sales revenue plus the current period
- [ ] Given the chart, when no item filter is applied, then all sold items contribute cumulatively
- [ ] Given the chart grows monotonically, when no sales occur in a period, then bar heights remain at the previous period's level (not zero)
- [ ] Given the tooltip, when the user hovers a period, then it shows total cumulative revenue and a breakdown per item

## Chart Specification
- Type: Stacked `BarChart` (Recharts) — values are running totals, not period deltas
- X-axis: time periods (per granularity)
- Y-axis: Cumulative Revenue in €
- Series: one per item, same palette as US-035

## Cumulative Calculation
Performed server-side:
```
cumulativeRevenue[item][period] = Σ revenue[item][t] for t ≤ period
```

## Definition of Done
- [ ] `getGainedValueData(filters)` server action returns cumulative totals per item per period
- [ ] `useGainedValue(filters)` TanStack Query hook
- [ ] `GainedValueChart.tsx` renders stacked cumulative bars
- [ ] Bars are monotonically non-decreasing (carries forward last known value per item)

## Dependencies
- US-031, US-032, US-033, US-034

## Open Questions
- None
