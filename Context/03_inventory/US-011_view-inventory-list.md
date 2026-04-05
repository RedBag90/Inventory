---
Story ID: US-011
Epic: Inventory
Title: View Inventory List with Status Filter
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to see all my inventory items in a list and filter by status,
So that I can quickly find what is still in stock versus what has already been sold.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given an authenticated user, when they navigate to `/dashboard/inventory`, then all their items are displayed (sorted by `purchasedAt` descending)
- [ ] Given the list, when no filter is applied, then both `IN_STOCK` and `SOLD` items are shown
- [ ] Given the filter control, when the user selects `IN_STOCK`, then only unsold items are shown and the URL updates to `?status=IN_STOCK`
- [ ] Given the filter control, when the user selects `SOLD`, then only sold items are shown and the URL updates to `?status=SOLD`
- [ ] Given a filtered URL, when shared or bookmarked, then the same filter is applied on load
- [ ] Given an empty inventory, when the page loads, then an empty state message is shown (not a blank page)
- [ ] Given more than 0 items, when the list renders, then each item shows: name, platform, purchase price, status, and purchase date

## Definition of Done
- [ ] `ItemRepository.getItems(filters)` Server Action implemented with `userId` scoping and `status` filter
- [ ] `useItems(filters)` hook reads filter from URL via `useSearchParams`
- [ ] `ItemTable.tsx` renders list with status badge and sorting
- [ ] Empty state component implemented
- [ ] Filter state is URL-based — not Zustand
- [ ] `staleTime: 60_000` set on `useItems` query
- [ ] Integration test: filter changes update the displayed list

## Assumptions
- Pagination is not required in v1 — all items load at once
- Sorting is fixed (purchase date descending) — no user-configurable sort in v1

## Dependencies
- US-009 (items must exist to display)
- US-004 (TanStack Query available)

## Open Questions
- What is the expected maximum number of items before pagination becomes necessary? → flag for v2

## Traceability
- Spec section 5.1: Item-Status: IN_STOCK / SOLD
- Feature doc: 02_inventory.md
