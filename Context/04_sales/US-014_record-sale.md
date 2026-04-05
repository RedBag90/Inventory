---
Story ID: US-014
Epic: Sales
Title: Record a Sale Against an Inventory Item
Version: v1.0 | Last Modified: April 2026 | Changed By: —
Change Log:
| Version | Date | Changed By | Summary |
|---|---|---|---|
| v1.0 | April 2026 | — | Initial draft |
---

## User Story
As a reseller,
I want to record when I sell an inventory item,
So that the item is marked as sold and my profit is visible.

## MoSCoW Priority
- [x] Must Have

## Story Points: 5

## Acceptance Criteria
- [ ] Given an `IN_STOCK` item, when the user opens the sale form, then fields for sale price, platform, outbound shipping cost, and sale date are shown
- [ ] Given the form, when submitted with a valid sale price > 0, then a `Sale` record is created linked to the item and the item status changes to `SOLD`
- [ ] Given the form, when submitted with a sale price of 0 or negative, then a validation error is shown and no DB write occurs
- [ ] Given a successful sale, when the inventory list reloads, then `inventoryKeys.all` and `salesKeys.all` are both invalidated
- [ ] Given a `SOLD` item, when the user attempts to record another sale, then the form is not accessible (item is not selectable)
- [ ] Given `shippingCostOut` left empty, when the form is submitted, then it defaults to 0
- [ ] Given a DB failure mid-transaction, when the sale form is submitted, then neither the `Sale` record nor the `Item` status change is persisted (atomic rollback — the item remains `IN_STOCK`)

## Definition of Done
- [ ] `RecordSaleSchema` (Zod) validates all sale fields
- [ ] `SaleRepository.createSale()` Server Action implemented, auth-checked, updates item status atomically
- [ ] `useRecordSale()` mutation hook invalidates both `salesKeys.all` and `inventoryKeys.all` on success
- [ ] `SaleForm.tsx` uses React Hook Form + `zodResolver`
- [ ] DB transaction ensures `Sale` create and `Item` status update are atomic
- [ ] Integration test: recording a sale updates item status and both caches

## Assumptions
- Sale date defaults to today but can be set to any past date
- Platform selection uses the same enum as item purchase platform

## Dependencies
- US-009 (item must exist and be `IN_STOCK`)
- US-002 (Prisma `Sale` model exists)

## Open Questions
- Should selling below purchase price require explicit confirmation? → Flagged for US-015

## Traceability
- Spec section 5.2: Verkaufserfassung
- Feature doc: 03_sales.md
