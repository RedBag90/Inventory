---
Story ID: US-041
Epic: Enhanced Reporting
Title: Break-Even Analysis — Cumulative Revenue vs. Costs Line Chart
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see a line chart showing cumulative revenue vs. cumulative costs over time,
So that I can visually identify my break-even point — the moment when total revenue first exceeds total costs.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the dashboard, when the Break-Even panel renders, then it shows three lines: Accumulated Revenue (green), Accumulated Costs (red), and a Break-Even reference line (gray, at y = Accumulated Costs)
- [ ] Given the intersection of Revenue and Costs lines, when it occurs, then a vertical marker or annotation marks the break-even date/period
- [ ] Given the annotation, when rendered, then it shows the label "Break-Even" with the period label (e.g. "Q3 2026" or "Aug 2026")
- [ ] Given no break-even has been reached yet, when all data points show costs > revenue, then no intersection marker is shown, but a projected intersection is shown as a dashed extension (nice-to-have for v2)
- [ ] Given the tooltip, when the user hovers a point on the chart, then it shows the period, accumulated revenue, accumulated costs, and running net profit (revenue − costs)
- [ ] Given the x-axis, when the time scale toggle changes, then the line chart re-aggregates to monthly or quarterly periods

## Chart Specification
- Type: `LineChart` (Recharts) with 3 series
- X-axis: time periods (year labels only for clarity, not every quarter)
- Y-axis: Accumulated € values
- Line 1: Accumulated Revenue — `#22c55e` (green), stroke 2px
- Line 2: Accumulated Costs — `#ef4444` (red), stroke 2px
- Line 3: Break-Even line — static flat line at y = final accumulated costs (gray, dashed)
  → Alternative: the break-even line is the running "cost curve" itself; the intersection is where revenue line crosses it
- Intersection marker: `ReferenceLine` at the break-even period (vertical, labeled)

## Break-Even Calculation
```
For each period t:
  accRevenue[t] = Σ revenue[s] for s ≤ t
  accCosts[t]   = Σ costs[s]   for s ≤ t
  breakEven     = first t where accRevenue[t] >= accCosts[t]
```

## Definition of Done
- [ ] `getBreakEvenData(filters)` server action returns `{ period, accRevenue, accCosts }[]` + `breakEvenPeriod?: string`
- [ ] Break-even period computed server-side and returned alongside data
- [ ] `useBreakEven(filters)` TanStack Query hook
- [ ] `BreakEvenChart.tsx` renders two lines + vertical reference line at break-even period
- [ ] If break-even not yet reached, vertical marker is omitted

## Dependencies
- US-031, US-032, US-033, US-034
- US-038 (cumulative revenue), US-039 (cumulative costs) — can share data

## Open Questions
- Should a "projected break-even" line be shown when break-even hasn't been reached? → v2
