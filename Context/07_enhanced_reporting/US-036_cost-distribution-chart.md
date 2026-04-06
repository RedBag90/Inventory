---
Story ID: US-036
Epic: Enhanced Reporting
Title: Cost Distribution Chart — Costs per Period by Item
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see my total costs broken down by item per time period in a stacked bar chart,
So that I can identify cost-heavy periods and which items drive cost spikes.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the dashboard, when the Cost Distribution panel renders, then it shows a stacked bar chart with costs per item per period
- [ ] Given the chart, when each segment is rendered, then costs include: purchasePrice + shippingCostIn + repairCost + shippingCostOut + additionalCosts
- [ ] Given a budget ceiling line, when the chart renders, then a red horizontal reference line marks the user's average cost per period
- [ ] Given the chart, when a period has no costs (no items purchased in that period), then a zero-height bar is shown rather than a gap
- [ ] Given the item filter, when items are deselected, then their cost segments disappear
- [ ] Given a tooltip on hover, when the user hovers a segment, then it shows item name, period, cost breakdown

## Note on Cost Attribution
Costs are attributed to the period in which the item was **sold** (same as `soldAt`) to keep cost and revenue charts comparable. Purchase-date attribution is a v2 consideration.

## Chart Specification
- Type: Stacked `BarChart` (Recharts)
- X-axis: time periods (per granularity)
- Y-axis: Total costs in €
- Series: one per item, same color palette as US-035
- Reference line: average cost per period (solid red horizontal line)

## Definition of Done
- [ ] `getCostDistributionData(filters)` server action returns `{ period, items: [{itemId, name, costs}] }[]`
- [ ] `useCostDistribution(filters)` TanStack Query hook
- [ ] `CostDistributionChart.tsx` renders stacked bars + budget reference line
- [ ] Same color palette as `BenefitVelocityChart` for visual consistency

## Dependencies
- US-031, US-032, US-033, US-034
- US-035 (shares color palette and data shape)

## Open Questions
- None
