---
Story ID: US-030
Epic: Inventory
Title: Edit Inventory Item Metadata
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to edit an inventory item's name, description, platform, and purchase details after creation,
So that I can correct mistakes without deleting and re-creating the item.

## MoSCoW Priority
- [x] Should Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given an `IN_STOCK` item on the detail page, when the user opens the edit form, then all editable fields (name, description, platform, purchase price, purchase date) are pre-filled with current values
- [ ] Given the edit form, when submitted with valid values, then the item is updated in the DB and the detail page reflects the new values
- [ ] Given the edit form, when submitted with an empty name, then a validation error is shown and no DB write occurs
- [ ] Given the edit form, when submitted with a non-positive purchase price, then a validation error is shown
- [ ] Given a `SOLD` item, when the user views the detail page, then the edit control is not shown — sold items are read-only
- [ ] Given a successful edit, when the page reloads, then `inventoryKeys.detail(id)` and `inventoryKeys.list` caches are both invalidated

## Definition of Done
- [ ] `EditItemSchema` (Zod) covers all editable metadata fields with the same rules as `CreateItemSchema`
- [ ] `ItemRepository.updateItemMetadata(id, data)` Server Action implemented, auth-checked, ownership-verified
- [ ] `useEditItem(id)` mutation hook with `onSuccess` cache invalidation on both detail and list keys
- [ ] `ItemEditForm.tsx` uses React Hook Form + `zodResolver`, pre-populated via `defaultValues`
- [ ] Edit form only rendered for `IN_STOCK` items — conditionally hidden for `SOLD`
- [ ] Integration test: editing an item updates the cached detail and list

## Assumptions
- Only metadata fields are editable here; cost fields (`shippingCostIn`, `repairCost`, `additionalCosts`) are managed via US-010
- `purchasedAt` can be changed to any past date — future dates are rejected
- Editing triggers the same `inventoryKeys` cache invalidation as creation

## Dependencies
- US-009 (item must exist before it can be edited)
- US-012 (edit control is accessible from the item detail page)
- US-004 (TanStack Query available for cache invalidation)

## Open Questions
- Should editing the purchase price on an `IN_STOCK` item that has partial costs already logged trigger a profit re-preview? → Out of scope for this story; no sale has been recorded yet so no profit exists to preview

## Traceability
- Spec section 5.1: Lagerverwaltung — item data management
- Feature doc: 02_inventory.md
