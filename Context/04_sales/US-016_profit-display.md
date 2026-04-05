---
Story ID: US-016
Epic: Sales
Title: Display Profit on Sold Items
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see the profit for each sold item in my inventory,
So that I always know how much I made on any given item.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given a `SOLD` item in the inventory list, when rendered, then the computed profit is shown alongside the item
- [ ] Given a `SOLD` item on the detail page, when rendered, then a full cost breakdown and profit are shown
- [ ] Given a profit of 0, when displayed, then it shows "€0.00" — not blank
- [ ] Given a negative profit (loss), when displayed, then it is shown in red with a clear negative sign
- [ ] Given an `IN_STOCK` item, when displayed, then no profit field is shown (profit is null until sold)
- [ ] Given any profit value, when displayed, then it is formatted as a currency string (€ with 2 decimal places)

## Definition of Done
- [ ] `SaleManager.calculateProfit()` called in `ItemCard.tsx` and item detail component
- [ ] `formatCurrency()` from `shared/lib/utils.ts` used for all monetary display
- [ ] Profit is never read from a DB column — always computed at render time
- [ ] Visual distinction between positive (green), zero (neutral), and negative (red) profit

## Assumptions
- Profit is computed client-side from data already loaded by `useItems()` / `useItems(id)`
- No separate API call is needed to get the profit value

## Dependencies
- US-014 (sale record must exist for SOLD items)
- US-012 (item detail page renders the breakdown)

## Open Questions
- None

## Traceability
- Spec section 5.2: Automatische Gewinnberechnung
- Spec section 12: SaleManager
- Feature doc: 03_sales.md
