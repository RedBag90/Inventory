---
Story ID: US-040
Epic: Enhanced Reporting
Title: Cash Flow Chart — Positive and Negative per Period
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see net cash flow per period as a diverging bar chart (positive above zero, negative below zero),
So that I can immediately identify investment-heavy periods (cash out) vs. profitable return periods (cash in).

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given the dashboard, when the Cash Flow panel renders, then bars above the zero baseline represent periods where revenue > costs (net positive cash flow)
- [ ] Given a period with net negative cash flow, when the chart renders, then the bar extends below the zero baseline
- [ ] Given the chart, when bars are colored, then positive bars are green and negative bars are red
- [ ] Given the stacked breakdown, when multiple items are sold in a period, then each item's net contribution (revenue − costs) is shown as a stacked segment within the bar (positive or negative direction)
- [ ] Given a zero-crossing, when a bar straddles the baseline (some items positive, some negative net), then positive segments stack above and negative segments stack below
- [ ] Given the tooltip on hover, when the user hovers a bar, then it shows gross revenue, total costs, net cash flow, and per-item breakdown

## Cash Flow Definition
```
cashFlow[period] = Σ (salePrice - totalCosts) for all items sold in period
                = revenue[period] - costs[period]
```

## Chart Specification
- Type: Diverging stacked `BarChart` (Recharts with negative values)
- X-axis: time periods (per granularity)
- Y-axis: Net Cash Flow in € (positive above, negative below zero)
- Series: one per item, positive segments green-toned, negative segments red-toned per item
- Zero reference line: solid gray line at y=0

## Definition of Done
- [ ] `getCashFlowData(filters)` server action returns `{ period, items: [{itemId, name, netCashFlow}] }[]`
- [ ] Negative values rendered as downward bars in Recharts (values passed as-is, chart handles direction)
- [ ] `useCashFlow(filters)` TanStack Query hook
- [ ] `CashFlowChart.tsx` renders diverging bars with zero baseline
- [ ] Color logic: positive net = green tones, negative net = red tones (same item may flip color by period)

## Dependencies
- US-031, US-032, US-033, US-034

## Open Questions
- Recharts stacked bar with mixed positive/negative values requires careful data shaping — may need separate positive/negative series per item
