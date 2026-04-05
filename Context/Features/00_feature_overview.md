# Feature Overview — Reseller Inventory & Profit Tracker

**Derived from:** spec_reseller_tracker_v2.md  
**Last Updated:** April 2026  
**Status:** Draft

---

## Module Map

| # | Module | Folder | Priority | Depends On |
|---|---|---|---|---|
| 1 | [Auth](./01_auth.md) | `features/auth/` | Must Have | Infrastructure |
| 2 | [Inventory](./02_inventory.md) | `features/inventory/` | Must Have | Auth |
| 3 | [Sales](./03_sales.md) | `features/sales/` | Must Have | Inventory |
| 4 | [Reporting](./04_reporting.md) | `features/reporting/` | Must Have | Sales, Inventory |
| 5 | [Infrastructure & Platform](./05_infrastructure.md) | `shared/`, `prisma/` | Must Have | — |
| 6 | [Observability & Quality](./06_observability_quality.md) | cross-cutting | Should Have | All modules |

---

## Dependency Order (Implementation Sequence)

```
Infrastructure & Platform
        ↓
      Auth
        ↓
   Inventory ──────────→ Sales
        ↓                   ↓
         └──────────────────┘
                  ↓
            Reporting
                  ↓
      Observability & Quality (cross-cutting)
```

---

## Scope Boundaries

### In Scope (v1)
- Single-user and multi-user inventory management
- Full item lifecycle: purchase → optional costs → sale
- Runtime profit calculation (never persisted)
- Monthly, quarterly, and cumulative reporting
- Auth via Clerk with per-user data isolation

### Explicitly Out of Scope (v1)
| Feature | Planned For |
|---|---|
| Photos per item | Later version |
| Extended item status stages (IN_REPAIR, RESERVED) | Later |
| Mobile app | Phase 2 |
| Kleinanzeigen / eBay API integration | Phase 2 |
| CSV / PDF export | Future module |
