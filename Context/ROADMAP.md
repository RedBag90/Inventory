# Development Roadmap — Reseller Inventory & Profit Tracker

**Version:** 1.2  
**Last Updated:** April 2026  
**Total Stories:** 42  
**Total Story Points:** 124  

---

## Story Index

| ID | Title | Epic | Points | Priority | Status |
|---|---|---|---|---|---|
| [US-001](./01_infrastructure/US-001_docker-postgres-setup.md) | Docker Compose PostgreSQL Local Setup | Infrastructure | 2 | Must Have | 🔲 Todo |
| [US-002](./01_infrastructure/US-002_prisma-schema-migration.md) | Prisma Schema, Migrations & Singleton Client | Infrastructure | 3 | Must Have | 🔲 Todo |
| [US-003](./01_infrastructure/US-003_env-validation.md) | Zod-Validated Environment Variables | Infrastructure | 2 | Must Have | 🔲 Todo |
| [US-004](./01_infrastructure/US-004_tanstack-query-setup.md) | TanStack Query Provider & DevTools Setup | Infrastructure | 2 | Must Have | 🔲 Todo |
| [US-005](./02_auth/US-005_user-registration.md) | User Registration via Clerk | Auth | 2 | Must Have | 🔲 Todo |
| [US-006](./02_auth/US-006_user-signin.md) | User Sign-In via Clerk | Auth | 2 | Must Have | 🔲 Todo |
| [US-007](./02_auth/US-007_route-protection.md) | Dashboard Route Protection via Clerk Middleware | Auth | 3 | Must Have | 🔲 Todo |
| [US-008](./02_auth/US-008_user-db-sync.md) | User DB Sync on First Login via Clerk Webhook | Auth | 3 | Must Have | 🔲 Todo |
| [US-028](./02_auth/US-028_dashboard-nav-shell.md) | Dashboard Navigation Shell | Auth | 2 | Must Have | 🔲 Todo |
| [US-029](./02_auth/US-029_user-sign-out.md) | User Sign-Out | Auth | 1 | Must Have | 🔲 Todo |
| [US-009](./03_inventory/US-009_create-item.md) | Create Inventory Item | Inventory | 5 | Must Have | 🔲 Todo |
| [US-010](./03_inventory/US-010_add-costs-to-item.md) | Add Costs to an Inventory Item | Inventory | 3 | Must Have | 🔲 Todo |
| [US-011](./03_inventory/US-011_view-inventory-list.md) | View Inventory List with Status Filter | Inventory | 5 | Must Have | 🔲 Todo |
| [US-012](./03_inventory/US-012_view-item-detail.md) | View Item Detail Page | Inventory | 3 | Must Have | 🔲 Todo |
| [US-013](./03_inventory/US-013_storage-duration.md) | Automatic Storage Duration Calculation | Inventory | 2 | Must Have | 🔲 Todo |
| [US-030](./03_inventory/US-030_edit-inventory-item.md) | Edit Inventory Item Metadata | Inventory | 3 | Should Have | 🔲 Todo |
| [US-014](./04_sales/US-014_record-sale.md) | Record a Sale Against an Inventory Item | Sales | 5 | Must Have | 🔲 Todo |
| [US-015](./04_sales/US-015_sale-confirmation-profit-preview.md) | Sale Confirmation Step with Profit Preview | Sales | 3 | Must Have | 🔲 Todo |
| [US-016](./04_sales/US-016_profit-display.md) | Display Profit on Sold Items | Sales | 2 | Must Have | 🔲 Todo |
| [US-017](./05_reporting/US-017_monthly-report.md) | Monthly Revenue, Cost & Profit Report | Reporting | 5 | Must Have | 🔲 Todo |
| [US-018](./05_reporting/US-018_quarterly-report.md) | Quarterly Revenue, Cost & Profit Report | Reporting | 3 | Must Have | 🔲 Todo |
| [US-019](./05_reporting/US-019_cumulative-report.md) | Cumulative All-Time Report with Avg Storage Duration | Reporting | 3 | Must Have | 🔲 Todo |
| [US-020](./05_reporting/US-020_time-series-chart.md) | Revenue / Cost / Profit Time Series Chart | Reporting | 5 | Must Have | 🔲 Todo |
| [US-021](./05_reporting/US-021_url-filter-state.md) | URL-Driven Filter State for Reporting Dashboard | Reporting | 2 | Must Have | 🔲 Todo |
| [US-022](./06_observability/US-022_sentry-integration.md) | Sentry Error Monitoring Integration | Observability | 3 | Should Have | 🔲 Todo |
| [US-023](./06_observability/US-023_error-boundaries.md) | Feature-Level Error Boundaries | Observability | 3 | Should Have | 🔲 Todo |
| [US-024](./06_observability/US-024_unit-tests.md) | Unit Tests — SaleManager, ItemManager, Utils | Observability | 3 | Must Have | 🔲 Todo |
| [US-025](./06_observability/US-025_integration-tests.md) | Integration Tests — Core Feature Flows (RTL + MSW) | Observability | 5 | Must Have | 🔲 Todo |
| [US-026](./06_observability/US-026_e2e-tests.md) | Playwright E2E Tests — Critical User Journeys | Observability | 5 | Should Have | 🔲 Todo |
| [US-027](./06_observability/US-027_ci-cd-pipeline.md) | GitHub Actions CI/CD Pipeline | Observability | 3 | Should Have | 🔲 Todo |
| [US-031](./07_enhanced_reporting/US-031_enhanced-reporting-layout.md) | Enhanced Reporting Dashboard Layout (7-Panel) | Enhanced Reporting | 5 | Must Have | 🔲 Todo |
| [US-032](./07_enhanced_reporting/US-032_time-scale-toggle.md) | Time Scale Toggle — Quarterly / Monthly | Enhanced Reporting | 3 | Must Have | 🔲 Todo |
| [US-033](./07_enhanced_reporting/US-033_date-range-filter.md) | Date Range Filter with Date Pickers | Enhanced Reporting | 3 | Must Have | 🔲 Todo |
| [US-034](./07_enhanced_reporting/US-034_item-category-filter.md) | Item / Category Multi-Select Filter | Enhanced Reporting | 5 | Should Have | 🔲 Todo |
| [US-035](./07_enhanced_reporting/US-035_benefit-velocity-chart.md) | Benefit Velocity Chart — Revenue per Period by Item | Enhanced Reporting | 5 | Must Have | 🔲 Todo |
| [US-036](./07_enhanced_reporting/US-036_cost-distribution-chart.md) | Cost Distribution Chart — Costs per Period by Item | Enhanced Reporting | 3 | Must Have | 🔲 Todo |
| [US-037](./07_enhanced_reporting/US-037_roi-comparison-chart.md) | ROI Comparison Chart — Revenue vs Costs per Period | Enhanced Reporting | 3 | Must Have | 🔲 Todo |
| [US-038](./07_enhanced_reporting/US-038_gained-value-analysis.md) | Gained Value Analysis — Cumulative Revenue by Item | Enhanced Reporting | 3 | Must Have | 🔲 Todo |
| [US-039](./07_enhanced_reporting/US-039_cumulative-cost-analysis.md) | Cumulative Cost Analysis — Accumulating Costs by Item | Enhanced Reporting | 3 | Must Have | 🔲 Todo |
| [US-040](./07_enhanced_reporting/US-040_cash-flow-chart.md) | Cash Flow Chart — Positive and Negative per Period | Enhanced Reporting | 5 | Must Have | 🔲 Todo |
| [US-041](./07_enhanced_reporting/US-041_break-even-analysis.md) | Break-Even Analysis — Cumulative Revenue vs. Costs | Enhanced Reporting | 5 | Must Have | 🔲 Todo |
| [US-042](./07_enhanced_reporting/US-042_dashboard-navigation.md) | Dashboard Sub-Page Navigation Panel | Enhanced Reporting | 2 | Should Have | 🔲 Todo |

---

## Sprint Plan

Stories are grouped into 5 sprints ordered by dependency. Each sprint delivers a shippable slice.

---

### Sprint 1 — Foundation (9 points)
> Goal: App boots, DB is connected, env is safe, query layer is ready.

| ID | Title | Points |
|---|---|---|
| US-001 | Docker Compose PostgreSQL Local Setup | 2 |
| US-003 | Zod-Validated Environment Variables | 2 |
| US-002 | Prisma Schema, Migrations & Singleton Client | 3 |
| US-004 | TanStack Query Provider & DevTools Setup | 2 |

**Exit criteria:** `docker compose up` + `prisma migrate dev` succeeds. App starts without missing env errors.

---

### Sprint 2 — Auth (13 points)
> Goal: Users can register, sign in, navigate the dashboard, and be isolated from each other's data.

| ID | Title | Points |
|---|---|---|
| US-007 | Dashboard Route Protection via Clerk Middleware | 3 |
| US-005 | User Registration via Clerk | 2 |
| US-006 | User Sign-In via Clerk | 2 |
| US-008 | User DB Sync on First Login via Clerk Webhook | 3 |
| US-028 | Dashboard Navigation Shell | 2 |
| US-029 | User Sign-Out | 1 |

**Exit criteria:** Unauthenticated users are redirected. New users get a DB record on first login. Authenticated users can navigate between sections and sign out.

---

### Sprint 3 — Inventory (21 points)
> Goal: Users can manage their full inventory lifecycle including editing items.

| ID | Title | Points |
|---|---|---|
| US-009 | Create Inventory Item | 5 |
| US-011 | View Inventory List with Status Filter | 5 |
| US-010 | Add Costs to an Inventory Item | 3 |
| US-012 | View Item Detail Page | 3 |
| US-013 | Automatic Storage Duration Calculation | 2 |
| US-030 | Edit Inventory Item Metadata | 3 |

**Exit criteria:** User can create items, add/remove costs, edit item metadata, view list with filter, and see item detail with storage duration.

---

### Sprint 4 — Sales & Reporting (23 points)
> Goal: Users can record sales and see financial performance.

| ID | Title | Points |
|---|---|---|
| US-015 | Sale Confirmation Step with Profit Preview | 3 |
| US-014 | Record a Sale Against an Inventory Item | 5 |
| US-016 | Display Profit on Sold Items | 2 |
| US-021 | URL-Driven Filter State for Reporting Dashboard | 2 |
| US-017 | Monthly Revenue, Cost & Profit Report | 5 |
| US-018 | Quarterly Revenue, Cost & Profit Report | 3 |
| US-019 | Cumulative All-Time Report with Avg Storage Duration | 3 |

**Exit criteria:** User can sell items with profit preview and view monthly/quarterly/cumulative reports.

---

### Sprint 5 — Charts, Quality & CI (21 points)
> Goal: App is observable, tested, and deployable with confidence.

| ID | Title | Points |
|---|---|---|
| US-020 | Revenue / Cost / Profit Time Series Chart | 5 |
| US-024 | Unit Tests — Business Logic | 3 |
| US-025 | Integration Tests — Core Feature Flows | 5 |
| US-022 | Sentry Error Monitoring Integration | 3 |
| US-023 | Feature-Level Error Boundaries | 3 |
| US-026 | Playwright E2E Tests | 5 |
| US-027 | GitHub Actions CI/CD Pipeline | 3 |

**Exit criteria:** All tests pass in CI. Sentry receives events. Vercel preview deploys on every PR.

---

## Dependency Graph

```
US-001 ──→ US-002 ──→ US-005 ──→ US-008
US-003 ──→ US-002       │
US-003 ──→ US-007 ──────┤
US-004 ─────────────────┘
                        ↓
               US-028 ──→ US-029  (nav shell + sign-out)
                        ↓
               US-009 ──→ US-010
               US-009 ──→ US-011
               US-009 ──→ US-012 ──→ US-016
               US-009 ──→ US-012 ──→ US-030 (edit item)
               US-009 ──→ US-013
                        ↓
               US-015 ──→ US-014 ──→ US-016
                        ↓
               US-021 ──→ US-017 ──→ US-020
                          US-017 ──→ US-018
                          US-017 ──→ US-019
                        ↓
               US-024 (unit tests — parallel with features)
               US-025 (integration — after features)
               US-022 ──→ US-023
               US-026 (after US-005, US-009, US-014, US-017)
               US-027 (after US-024, US-025, US-026)
```

---

## MoSCoW Summary

| Priority | Count | Points |
|---|---|---|
| Must Have | 31 | 94 |
| Should Have | 11 | 30 |
| **Total** | **42** | **124** |

All Must Have stories must pass before the first production deployment.  
Should Have stories must pass before the app is opened to additional users.
