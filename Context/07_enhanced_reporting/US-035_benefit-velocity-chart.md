---
Story ID: US-035
Epic: Enhanced Reporting
Title: Benefit Velocity Chart — Revenue per Period by Item
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see my revenue broken down by individual item per time period in a stacked bar chart,
So that I can identify which items drive the most revenue and how the mix changes over time.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the dashboard, when the Benefit Velocity panel renders, then it shows a stacked bar chart with one bar per time period
- [ ] Given the chart, when each bar is rendered, then each segment represents one sold item, color-coded by item
- [ ] Given a profit threshold line, when the chart renders, then a red dashed horizontal line marks the average total cost per period (cost-neutral threshold: revenue above this line = net profit)
- [ ] Given the threshold line, when the user hovers over it, then a tooltip reads: "Above this line: program covers its own costs"
- [ ] Given the time scale toggle, when switched to monthly, then all bars and the x-axis update to months
- [ ] Given the item filter, when items are deselected, then their segments disappear and bars shrink accordingly
- [ ] Given the chart tooltip, when the user hovers a bar segment, then it shows item name, period, revenue amount

## Chart Specification
- Type: Stacked `BarChart` (Recharts)
- X-axis: time periods (per granularity)
- Y-axis: Revenue in €
- Series: one per sold item, color from shared palette
- Reference line: average costs per period (dashed, red, labeled)
- Legend: item names, shown below chart (scrollable if >8 items)

## Definition of Done
- [ ] `getBenefitVelocityData(filters)` server action returns `{ period, items: [{itemId, name, revenue}] }[]`
- [ ] `useBenefitVelocity(filters)` TanStack Query hook
- [ ] `BenefitVelocityChart.tsx` renders stacked bars + reference line
- [ ] Reference line value computed as: total costs for period ÷ number of periods
- [ ] Colors sourced from `reportingColors.ts` shared palette

## Dependencies
- US-031 (layout)
- US-032 (time scale)
- US-033 (date range)
- US-034 (item filter)

## Open Questions
- None
