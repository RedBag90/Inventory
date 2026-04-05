# Feature: Observability & Quality

**Module:** Cross-cutting (no single feature folder)  
**Priority:** Should Have  
**Depends On:** All features  
**Blocks:** Nothing  

---

## Purpose

Ensures the app is observable in production and verifiably correct across all environments. Covers error monitoring, automated testing at every layer, and a CI/CD pipeline that prevents regressions from reaching production.

---

## Responsibilities

| Responsibility | Description |
|---|---|
| Error monitoring | Sentry captures all unhandled errors, React errors, and server exceptions |
| Error boundaries | Feature-level boundaries — not a single global one — for graceful recovery |
| Unit testing | Pure business logic (SaleManager, utils) tested in isolation |
| Integration testing | Feature flows tested with real component trees + MSW network mocks |
| E2E testing | Critical user journeys validated in a real browser via Playwright |
| CI pipeline | Every PR runs type-check → lint → unit/integration tests → dependency audit → E2E |
| Preview deployments | Every PR gets a Vercel preview URL automatically |

---

## Error Monitoring: Sentry

### Feature-Level Error Boundaries

Each dashboard feature is wrapped in its own `AppErrorBoundary`. This isolates failures — a broken reporting chart does not crash the inventory page.

```typescript
// app/(dashboard)/inventory/page.tsx
<AppErrorBoundary onReset={() => queryClient.invalidateQueries({ queryKey: inventoryKeys.all })}>
  <InventoryPage />
</AppErrorBoundary>
```

### React 19 Root Hooks

```typescript
// instrumentation.ts (Next.js) or via @sentry/nextjs SDK
onUncaughtError:    Sentry.reactErrorHandler()
onCaughtError:      Sentry.reactErrorHandler()
onRecoverableError: Sentry.reactErrorHandler()
```

Error messages are only shown in the UI in `development` mode — production shows a generic fallback.

---

## Testing Strategy: Testing Trophy

```
Static Analysis (TypeScript + ESLint)    10%
Unit Tests (Manager, pure functions)     20%
Integration Tests (RTL + MSW)            60%  ← Primary layer
E2E Tests (Playwright)                   10%
Coverage target: ≥ 70%
```

### Tool Stack

| Tool | Purpose |
|---|---|
| **Vitest** | Unit and integration tests — 2–4× faster than Jest |
| **React Testing Library** | Component tests from the user's perspective |
| **MSW (Mock Service Worker)** | Network-level mocking — shared between tests and browser |
| **Playwright** | Real browser E2E tests — Chromium, Firefox, WebKit |

---

## Unit Tests

Target: pure functions and business logic classes that have no dependencies on the UI or DB.

| Test Target | File |
|---|---|
| `SaleManager.calculateProfit()` | `features/sales/services/SaleManager.test.ts` |
| `SaleManager.validateSalePrice()` | `features/sales/services/SaleManager.test.ts` |
| `ItemManager.calculateStorageDays()` | `features/inventory/services/ItemManager.test.ts` |
| `formatCurrency()` | `shared/lib/utils.test.ts` |
| `formatDate()` | `shared/lib/utils.test.ts` |

### Example

```typescript
describe('SaleManager.calculateProfit', () => {
  it('calculates profit correctly across all cost types', () => {
    // 100 - 50 - 5 - 10 - 8 - 2 = 25
    expect(SaleManager.calculateProfit(item)).toBe(25);
  });

  it('returns null when item has not been sold', () => {
    expect(SaleManager.calculateProfit({ ...item, sale: null })).toBeNull();
  });
});
```

---

## Integration Tests

Target: complete user-facing flows. Components + hooks + MSW-mocked Server Actions.  
This is the highest-value test layer — tests confirm the UI behaves correctly from the user's perspective.

| Flow | Description |
|---|---|
| Create item | Fill form → submit → item appears in list |
| Record sale | Select item → fill sale form → profit shown in confirmation |
| Filter inventory | Toggle status filter → list updates → URL reflects state |
| View monthly report | Navigate to reporting → data loads → chart renders |

---

## E2E Tests (Playwright)

Four critical scenarios — run against a real browser on every merge to `main`:

| # | Scenario |
|---|---|
| 1 | User registers → dashboard is empty |
| 2 | User creates item → item appears in inventory list |
| 3 | User records sale → item shows SOLD status + correct profit |
| 4 | User changes reporting filter → URL updates + data refreshes |

---

## CI/CD Pipeline (GitHub Actions)

```
Push / PR
    ↓
[quality job]
  npm ci
  tsc --noEmit          ← Type check
  eslint                ← Lint + import boundary check
  vitest                ← Unit + integration tests
  npm audit             ← Dependency vulnerability scan
    ↓ (on success)
[e2e job]
  playwright install
  npm run test:e2e
  Upload report on failure
    ↓ (on success)
Vercel Preview Deployment (automatic, per PR)
```

Concurrent runs for the same branch are cancelled (`cancel-in-progress: true`).

---

## Deployment Checks (Pre-Production)

- [ ] All CI jobs green on `main`
- [ ] Playwright E2E passing on Vercel preview URL
- [ ] Sentry receiving events from staging environment
- [ ] No `npm audit --audit-level=high` findings
- [ ] Feature-level error boundaries present on all dashboard routes
