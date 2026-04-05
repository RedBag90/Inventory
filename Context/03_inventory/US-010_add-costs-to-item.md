---
Story ID: US-010
Epic: Inventory
Title: Add Costs to an Inventory Item
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to record all costs associated with a purchased item (shipping, repairs, extras),
So that my profit calculation reflects the true cost of acquisition.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given an item detail page, when the user enters a shipping cost (inbound), then it is saved to `shippingCostIn` on the `Item` record
- [ ] Given an item detail page, when the user enters a repair cost, then it is saved to `repairCost` on the `Item` record
- [ ] Given an item detail page, when the user adds an additional cost with a label and amount, then an `AdditionalCost` row is created linked to the item
- [ ] Given multiple additional costs on one item, when displayed, then all are listed with their labels and amounts
- [ ] Given a cost of 0, when saved, then it is accepted (0 is valid — field is optional)
- [ ] Given a negative cost amount, when the user submits, then a validation error is shown
- [ ] Given an existing additional cost entry, when the user deletes it, then it is removed from the DB, the list updates immediately, and any profit preview recalculates correctly

## Definition of Done
- [ ] `UpdateItemSchema` (Zod) covers `shippingCostIn`, `repairCost`, and `additionalCosts[]`
- [ ] `ItemRepository.updateItem()` Server Action implemented and auth-checked
- [ ] `AdditionalCost` creation handled in the same Server Action or a dedicated one
- [ ] `useUpdateItem()` mutation hook implemented with cache invalidation on `inventoryKeys.detail(id)`
- [ ] Integration test: adding a cost updates the item and reflects in profit calculation

## Assumptions
- Shipping and repair costs are edited on the item detail page, not at creation time
- Additional costs can be added at any point while the item is `IN_STOCK`
- Editing or removing existing additional costs is in scope for this story

## Dependencies
- US-009 (item must exist before costs can be added)
- US-012 (item detail page hosts the cost editing UI)

## Open Questions
- None

## Traceability
- Spec section 5.1: Kosten pro Item
- Feature doc: 02_inventory.md — Cost Model table
