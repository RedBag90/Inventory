# Feature: Reporting

**Module:** `features/reporting/`  
**Priority:** Must Have  
**Depends On:** Auth, Inventory, Sales  
**Blocks:** Nothing  

---

## Purpose

Aggregates financial data across time periods and presents it as actionable KPIs and charts. Gives the reseller a clear picture of revenue, costs, and profit — by month, by quarter, and cumulatively. All figures are computed from raw DB records at query time.

---

## Responsibilities

| Responsibility | Description |
|---|---|
| Monthly report | Revenue, costs, profit, and items sold for a given month |
| Quarterly report | Same dimensions aggregated across a full quarter |
| Cumulative report | All-time totals including average storage duration |
| Time series chart | Visual trend of revenue / costs / profit over time |
| URL-driven filters | Month/quarter/year selection lives in the URL — dashboards are bookmarkable |

---

## Report Dimensions

| Dimension | Monthly | Quarterly | Cumulative |
|---|---|---|---|
| Revenue | ✓ | ✓ | ✓ |
| Total Costs | ✓ | ✓ | ✓ |
| Profit | ✓ | ✓ | ✓ |
| Items Sold | ✓ | ✓ | ✓ |
| Avg Storage Days | — | — | ✓ |
| Time Series Chart | ✓ | ✓ | — |

---

## Key Files

| File | Role |
|---|---|
| `features/reporting/services/ReportingRepository.ts` | Aggregation queries — `'use server'`, auth-checked, profit computed here |
| `features/reporting/hooks/useMonthlyReport.ts` | TanStack Query hook — `staleTime: 5 * 60_000` |
| `features/reporting/hooks/useQuarterlyReport.ts` | TanStack Query hook — `staleTime: 5 * 60_000` |
| `features/reporting/hooks/reportingKeys.ts` | Typed key factory for all reporting queries |
| `features/reporting/types/reporting.types.ts` | `MonthlyReport`, `QuarterlyReport`, `CumulativeReport` types |
| `features/reporting/components/RevenueChart.tsx` | Recharts time-series chart — Client Component |
| `features/reporting/components/ProfitTable.tsx` | Tabular period breakdown |
| `features/reporting/components/KPICard.tsx` | Single metric display card |
| `features/reporting/index.ts` | Public API — only import from here |

---

## Data Types

```typescript
type MonthlyReport = {
  year: number;
  month: number;        // 1–12
  revenue: number;
  costs: number;
  profit: number;
  itemsSold: number;
};

type QuarterlyReport = {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  revenue: number;
  costs: number;
  profit: number;
  itemsSold: number;
};

type CumulativeReport = {
  revenue: number;
  costs: number;
  profit: number;
  itemsSold: number;
  avgStorageDays: number;
};
```

---

## Filter State: URL, Not Zustand

Filter selection (month, quarter, year) belongs in the URL via `useSearchParams`.

```
/dashboard/reporting?view=monthly&year=2026&month=4
/dashboard/reporting?view=quarterly&year=2026&quarter=2
```

**Why URL state, not Zustand:**
- Dashboards become bookmarkable and shareable
- Browser back/forward navigation works correctly
- No state synchronisation bugs between URL and component state

---

## State Management

| State | Tool | Reason |
|---|---|---|
| Report data (server) | TanStack Query | `staleTime: 5 * 60_000` — reports change infrequently |
| Filter selection | URL state (`useSearchParams`) | Bookmarkable, shareable |

---

## Reporting Query Pattern

Reports are computed entirely on the server. The repository:
1. Fetches all `Sale` records within the time period for the current user
2. Joins each sale with its `Item` and `AdditionalCost[]`
3. Computes revenue, costs, and profit in-memory (not via SQL aggregations)
4. Returns a typed report object

This matches the spec's pattern of always computing profit from raw fields — the same formula used in `SaleManager.calculateProfit()`.

---

## Performance Notes

- DB indexes on `(userId, purchasedAt)` and `soldAt` support time-range filtering
- Query benchmarking with `EXPLAIN ANALYZE` is required before going to production
- `staleTime: 5 * 60_000` reduces repeat fetches for stable historical data

---

## Out of Scope (v1)

- CSV or PDF export of report data
- Per-platform profit breakdown
- Item-level profit ranking / top performers list
- Year-over-year comparison view
