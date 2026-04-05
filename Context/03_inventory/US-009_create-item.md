---
Story ID: US-009
Epic: Inventory
Title: Create Inventory Item
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to add a newly purchased item to my inventory,
So that I have a record of what I own, what it cost, and when I bought it.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given an authenticated user on the inventory page, when they open the create form, then fields for name, purchase price, platform, date, description (optional) are shown
- [ ] Given the form, when submitted with a valid name and positive purchase price, then the item is saved to the DB and appears in the inventory list
- [ ] Given the form, when submitted with an empty name, then a validation error is shown and no DB write occurs
- [ ] Given the form, when submitted with a non-positive purchase price, then a validation error is shown
- [ ] Given a successful save, when the list reloads, then `inventoryKeys.all` cache is invalidated and the new item appears at the top (sorted by `purchasedAt` desc)
- [ ] Given the form, when any field is invalid, then errors are shown inline — not as an alert/toast

## Definition of Done
- [ ] `CreateItemSchema` (Zod) covers all fields with correct validation rules
- [ ] `ItemRepository.createItem()` Server Action implemented and auth-checked
- [ ] `useCreateItem()` mutation hook implemented with `onSuccess` cache invalidation
- [ ] `ItemForm.tsx` uses React Hook Form + `zodResolver`
- [ ] Unit test: `CreateItemSchema` rejects invalid inputs
- [ ] Integration test: form submission creates item and updates list

## Assumptions
- `purchasedAt` defaults to today but can be overridden
- Platform is selected from a fixed enum dropdown

## Dependencies
- US-002 (Prisma `Item` model exists)
- US-007, US-008 (user must be authenticated with a DB record)
- US-004 (TanStack Query available for cache invalidation)

## Open Questions
- None

## Traceability
- Spec section 5.1: Lagerverwaltung
- Feature doc: 02_inventory.md
