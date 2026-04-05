---
Story ID: US-013
Epic: Inventory
Title: Automatic Storage Duration Calculation
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see how many days an item has been in storage,
So that I can identify items that have been sitting unsold for too long.

## MoSCoW Priority
- [x] Must Have

## Story Points: 2

## Acceptance Criteria
- [ ] Given an `IN_STOCK` item, when the storage duration is calculated, then it equals `floor((today - purchasedAt) / 86_400_000)` days
- [ ] Given a `SOLD` item, when the storage duration is calculated, then it equals `floor((soldAt - purchasedAt) / 86_400_000)` days
- [ ] Given a storage duration of 0, when displayed, then it shows "0 days" (same day purchase/sale is valid)
- [ ] Given the inventory list, when rendered, then each item shows its storage duration
- [ ] Given the item detail page, when rendered, then storage duration is also shown there

## Definition of Done
- [ ] `ItemManager.calculateStorageDays(item)` implemented as a pure static method
- [ ] Unit test: calculates correctly for both `IN_STOCK` and `SOLD` cases, including 0-day edge case
- [ ] Storage duration rendered in `ItemTable.tsx` and `ItemCard.tsx`

## Assumptions
- Duration is shown in whole days only — no hours or minutes
- Timezone is not relevant for day-level precision in v1

## Dependencies
- US-009 (item with `purchasedAt` exists)
- US-014 (sale with `soldAt` exists for SOLD items)

## Open Questions
- None

## Traceability
- Spec section 5.1: Lagerzeit
- Spec section 12: ItemManager.calculateStorageDays()
- Feature doc: 02_inventory.md
