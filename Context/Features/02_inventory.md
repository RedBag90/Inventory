# Feature: Inventory

**Module:** `features/inventory/`  
**Priority:** Must Have  
**Depends On:** Auth, Infrastructure & Platform  
**Blocks:** Sales, Reporting  

---

## Purpose

Manages the full lifecycle of a resell item from the moment it is purchased until it is sold. Every item belongs to exactly one user. Items track all costs associated with acquisition so profit can be calculated accurately when a sale is recorded.

---

## Responsibilities

| Responsibility | Description |
|---|---|
| Create item | Capture name, purchase price, platform, date, and optional description |
| Attach costs | Record shipping (inbound), repair costs, and arbitrary additional costs per item |
| View inventory | List all items for the current user, filterable by status |
| View item detail | Full item view including all costs, status, and storage duration |
| Storage duration | Automatically calculated — purchase date to sale date (or today if unsold) |
| Status management | Items start as `IN_STOCK` and transition to `SOLD` when a sale is recorded |

---

## Item Status Lifecycle

```
Created → IN_STOCK ──(sale recorded)──→ SOLD
```

Status transitions are one-way in v1. `SOLD` items cannot be reverted. Extended statuses (`IN_REPAIR`, `RESERVED`) are explicitly out of scope for v1.

---

## Cost Model per Item

All costs are stored individually. Profit is never stored — it is computed at runtime from these fields.

| Cost Field | Type | Notes |
|---|---|---|
| `purchasePrice` | `Decimal(10,2)` | Required. The base acquisition cost. |
| `shippingCostIn` | `Decimal(10,2)` | Optional. Shipping paid when purchasing. Default 0. |
| `repairCost` | `Decimal(10,2)` | Optional. Repair or refurbishment costs. Default 0. |
| `AdditionalCost[]` | `Decimal(10,2)` | Optional. Any extra cost with a custom label. Unlimited. |

---

## Key Files

| File | Role |
|---|---|
| `features/inventory/services/ItemRepository.ts` | All Prisma queries for items — `'use server'`, auth-checked |
| `features/inventory/services/ItemManager.ts` | Business logic: `calculateStorageDays()`, `validateStatusTransition()` |
| `features/inventory/hooks/useItems.ts` | TanStack Query hook — fetches item list |
| `features/inventory/hooks/useCreateItem.ts` | Mutation hook — creates item, invalidates list |
| `features/inventory/hooks/useUpdateItem.ts` | Mutation hook — updates item, invalidates detail |
| `features/inventory/hooks/inventoryKeys.ts` | Typed TanStack Query key factory — no inline strings |
| `features/inventory/types/inventory.types.ts` | Zod schemas + inferred TS types |
| `features/inventory/components/ItemForm.tsx` | Create/edit form — React Hook Form + Zod |
| `features/inventory/components/ItemTable.tsx` | Inventory list — status filter, sorting |
| `features/inventory/components/ItemCard.tsx` | Single item display card |
| `features/inventory/index.ts` | Public API — only import from here |

---

## Data Model

```prisma
model Item {
  id               String           @id @default(cuid())
  name             String
  description      String?
  purchasePrice    Decimal          @db.Decimal(10, 2)
  purchasePlatform Platform
  purchasedAt      DateTime
  shippingCostIn   Decimal          @db.Decimal(10, 2) @default(0)
  repairCost       Decimal          @db.Decimal(10, 2) @default(0)
  status           ItemStatus       @default(IN_STOCK)
  userId           String
  user             User             @relation(...)
  sale             Sale?
  costs            AdditionalCost[]

  @@index([userId, status])
  @@index([userId, purchasedAt])
}

model AdditionalCost {
  id      String  @id @default(cuid())
  label   String
  amount  Decimal @db.Decimal(10, 2)
  itemId  String
  item    Item    @relation(...)
}

enum Platform {
  KLEINANZEIGEN | EBAY | FACEBOOK | OTHER
}

enum ItemStatus {
  IN_STOCK | SOLD
}
```

`Decimal` is used over `Float` everywhere to avoid floating-point rounding errors in financial calculations.

---

## State Management

| State | Tool | Reason |
|---|---|---|
| Item list (server) | TanStack Query `useItems()` | Cached, deduplicated, auto-revalidated |
| Item detail (server) | TanStack Query `useItems(id)` | `staleTime: 60_000` (1 min) |
| Status filter | URL state (`useSearchParams`) | Bookmarkable, shareable |
| Form state | React Hook Form | Local, no global state needed |

---

## Business Rules

1. `purchasePrice` must be a positive number — validated by Zod at form level
2. Additional costs may have any non-empty label and a non-negative amount
3. Storage duration is computed as: `Math.floor((endDate - purchasedAt) / 86_400_000)` days
4. `endDate` is `sale.soldAt` if sold, otherwise `new Date()` (today)
5. A user may only read and modify their own items — enforced in every Repository query

---

## Out of Scope (v1)

- Photo attachments per item
- Bulk import / CSV upload
- Item duplication
- `IN_REPAIR` and `RESERVED` status stages
