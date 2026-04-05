---
Story ID: US-012
Epic: Inventory
Title: View Item Detail Page
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to view the full details of a single inventory item,
So that I can see all its costs, storage duration, and sale information in one place.

## MoSCoW Priority
- [x] Must Have

## Story Points: 3

## Acceptance Criteria
- [ ] Given the inventory list, when the user clicks an item, then they are navigated to `/dashboard/inventory/[id]`
- [ ] Given the detail page, when it loads, then it shows: name, description, platform, purchase price, purchase date, all costs (shipping, repair, additional), status, and storage duration
- [ ] Given a `SOLD` item, when the detail page loads, then it also shows: sale price, sale platform, sale date, outbound shipping cost, and computed profit
- [ ] Given an `IN_STOCK` item, when the detail page loads, then storage duration shows days since purchase date until today
- [ ] Given a `SOLD` item, when the detail page loads, then storage duration shows days from purchase to sale date
- [ ] Given a request for an item ID that does not exist in the DB, when the page loads, then a 404 is returned
- [ ] Given a request for an item that belongs to another user, when it loads, then a 404 is returned — not a 403 (ownership errors must not reveal item existence)

## Definition of Done
- [ ] `ItemRepository.getItemById(id)` Server Action with `userId` ownership check
- [ ] `app/(dashboard)/inventory/[id]/page.tsx` renders `<ItemDetailPage />` from feature
- [ ] `ItemManager.calculateStorageDays()` used for storage duration display
- [ ] Profit displayed using `SaleManager.calculateProfit()` for sold items
- [ ] 404 returned (not 403) when item not found or ownership mismatch
- [ ] `staleTime: 60_000` on detail query

## Assumptions
- Item detail is read-only for sold items — costs cannot be edited after sale
- Profit is computed on the client from data returned by the query

## Dependencies
- US-009, US-010 (item and costs exist)
- US-014 (sale data shown on detail for SOLD items)

## Open Questions
- None

## Traceability
- Spec section 5.1: Lagerzeit, Item-Status
- Feature doc: 02_inventory.md
