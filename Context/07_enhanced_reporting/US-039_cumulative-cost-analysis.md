---
Story ID: US-039
Epic: Enhanced Reporting
Title: Cumulative Cost Analysis — Accumulating Costs by Item
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see my total costs accumulating over time broken down by item,
So that I can understand the total capital deployed and how quickly I've been spending vs. recouping through sales.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the dashboard, when the Cumulative Cost panel renders, then it shows a stacked bar chart where each bar represents total accumulated costs up to that period
- [ ] Given the cumulative calculation, when costs are computed, then they include all cost components: purchasePrice + shippingCostIn + repairCost + shippingCostOut + additionalCosts
- [ ] Given the cost attribution, when a period is rendered, then costs are attributed to the period when the item was sold (consistent with US-036)
- [ ] Given a heavy investment phase followed by fewer purchases, when the chart renders, then the growth rate visibly flattens in later periods
- [ ] Given the tooltip on hover, when the user hovers a bar, then it shows cumulative costs and per-item breakdown

## Chart Specification
- Type: Stacked `BarChart` (Recharts) — cumulative values
- X-axis: time periods (per granularity)
- Y-axis: Accumulated Costs in €
- Series: one per item, same palette as US-035/036

## Definition of Done
- [ ] `getCumulativeCostData(filters)` server action returns running totals per item per period
- [ ] `useCumulativeCost(filters)` TanStack Query hook
- [ ] `CumulativeCostChart.tsx` renders stacked cumulative bars
- [ ] Bars are monotonically non-decreasing

## Dependencies
- US-031, US-032, US-033, US-034
- US-038 (shares cumulative calculation pattern)

## Open Questions
- None
