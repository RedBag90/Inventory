# Feature: Sales

**Module:** `features/sales/`  
**Priority:** Must Have  
**Depends On:** Auth, Inventory  
**Blocks:** Reporting  

---

## Purpose

Records the sale of an inventory item and computes the resulting profit. Profit is a derived value — it is always calculated at runtime from persisted cost fields and never stored in the database. This prevents stale or incorrect profit data.

---

## Responsibilities

| Responsibility | Description |
|---|---|
| Record sale | Capture sale price, platform, outbound shipping cost, and sale date |
| Link to item | A sale is always 1:1 with an inventory item — one item, one sale |
| Trigger status change | Recording a sale transitions the item from `IN_STOCK` → `SOLD` |
| Profit calculation | Computed at runtime by `SaleManager.calculateProfit()` — never persisted |
| Sale confirmation | User reviews computed profit before committing the sale |

---

## Profit Formula

```
Profit = Sale Price
       − Purchase Price
       − Shipping Cost (inbound)
       − Repair Cost
       − Shipping Cost (outbound)
       − Σ(Additional Costs)
```

All values are read from the DB at query time. The result is computed in `SaleManager` and passed to the UI — it is never written to any database column.

---

## Key Files

| File | Role |
|---|---|
| `features/sales/services/SaleRepository.ts` | All Prisma queries for sales — `'use server'`, auth-checked |
| `features/sales/services/SaleManager.ts` | Business logic: `calculateProfit()`, `validateSalePrice()` |
| `features/sales/hooks/useSales.ts` | TanStack Query hook — fetches sales list |
| `features/sales/hooks/useRecordSale.ts` | Mutation hook — records sale, invalidates sales + inventory cache |
| `features/sales/hooks/salesKeys.ts` | Typed TanStack Query key factory — no inline strings |
| `features/sales/types/sales.types.ts` | Zod schemas + inferred TS types |
| `features/sales/components/SaleForm.tsx` | Form to record a sale — React Hook Form + Zod |
| `features/sales/components/SaleConfirmation.tsx` | Profit preview shown before committing sale |
| `features/sales/index.ts` | Public API — only import from here |

---

## Data Model

```prisma
model Sale {
  id              String   @id @default(cuid())
  salePrice       Decimal  @db.Decimal(10, 2)
  salePlatform    Platform
  shippingCostOut Decimal  @db.Decimal(10, 2) @default(0)
  soldAt          DateTime
  createdAt       DateTime @default(now())
  itemId          String   @unique        // 1:1 with Item
  item            Item     @relation(...)

  @@index([soldAt])
}
```

The `Sale` record has a unique constraint on `itemId` — an item can only be sold once.

---

## State Management

| State | Tool | Reason |
|---|---|---|
| Sales list (server) | TanStack Query `useSales()` | `staleTime: 60_000` (1 min) |
| Form state | React Hook Form | Local, scoped to form lifecycle |
| Confirmation step | Local `useState` | Ephemeral UI state, not shared |

### Cache Invalidation on Sale

When a sale is successfully recorded, **two** caches must be invalidated:

```
useRecordSale.onSuccess:
  → invalidate salesKeys.all        (sales list is stale)
  → invalidate inventoryKeys.all    (item status changed to SOLD)
```

---

## Business Rules

1. A sale price must be greater than 0
2. A sale price equal to the purchase price is allowed but flagged as a warning (no profit)
3. An item can only have one sale — attempting to record a second sale against the same item is an error
4. `shippingCostOut` defaults to 0 if not provided
5. `soldAt` defaults to today but can be set to any past date
6. Profit calculation happens in `SaleManager` — never in a component or repository

---

## SaleManager Interface (planned)

```typescript
class SaleManager {
  static calculateProfit(item: ItemWithRelations): number | null
  // Returns null if item.sale is null (item not yet sold)

  static validateSalePrice(salePrice: number, purchasePrice: number): boolean
  // Returns false if salePrice <= 0
}
```

---

## Out of Scope (v1)

- Editing or deleting a recorded sale
- Partial sales (selling an item across multiple transactions)
- Platform fee deduction (e.g. eBay seller fees) — add as AdditionalCost manually
- Automatic platform fee calculation
