// Pure client-side utilities: period generation + chart data derivation.
// All functions are side-effect free so they can be called in useMemo.

import type { DashboardSale } from '../services/getDashboardData';

export type Granularity = 'monthly' | 'quarterly';
export type ItemMeta    = { id: string; name: string; color: string };

// 14-color palette matching dark-navy → blue → purple → gold tones
export const ITEM_COLORS = [
  '#1e3a5f', '#2563eb', '#60a5fa', '#7c3aed', '#d97706',
  '#059669', '#dc2626', '#0891b2', '#9333ea', '#16a34a',
  '#ea580c', '#0284c7', '#6d28d9', '#be185d',
];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Period helpers ────────────────────────────────────────────────────────────

function salePeriodKey(soldAt: string, g: Granularity): string {
  const d     = new Date(soldAt);
  const year  = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  if (g === 'monthly') return `${year}-${String(month).padStart(2, '0')}`;
  return `${year}-Q${Math.ceil(month / 3)}`;
}

function periodLabel(key: string, g: Granularity): string {
  if (g === 'monthly') {
    const [year, month] = key.split('-');
    return `${MONTH_ABBR[parseInt(month, 10) - 1]} ${year}`;
  }
  const [year, q] = key.split('-');
  return `${q} ${year}`;
}

/** All period keys from [from … to] inclusive at the chosen granularity. */
export function generatePeriods(from: string, to: string, g: Granularity): string[] {
  const periods: string[] = [];
  const start = new Date(from);
  const end   = new Date(to);

  if (g === 'monthly') {
    let year  = start.getUTCFullYear();
    let month = start.getUTCMonth() + 1;
    const ey  = end.getUTCFullYear();
    const em  = end.getUTCMonth() + 1;
    while (year < ey || (year === ey && month <= em)) {
      periods.push(`${year}-${String(month).padStart(2, '0')}`);
      month++;
      if (month > 12) { month = 1; year++; }
    }
  } else {
    let year    = start.getUTCFullYear();
    let quarter = Math.ceil((start.getUTCMonth() + 1) / 3);
    const ey    = end.getUTCFullYear();
    const eq    = Math.ceil((end.getUTCMonth() + 1) / 3);
    while (year < ey || (year === ey && quarter <= eq)) {
      periods.push(`${year}-Q${quarter}`);
      quarter++;
      if (quarter > 4) { quarter = 1; year++; }
    }
  }
  return periods;
}

/** Unique items sorted by first sale/purchase date, each assigned a stable color. */
export function getItemsMeta(sales: DashboardSale[]): ItemMeta[] {
  const seen = new Map<string, { name: string; date: string }>();
  for (const s of sales) {
    const date     = s.soldAt ?? s.purchasedAt;
    const existing = seen.get(s.itemId);
    if (!existing || date < existing.date) {
      seen.set(s.itemId, { name: s.itemName, date });
    }
  }
  return Array.from(seen.entries())
    .sort((a, b) => a[1].date.localeCompare(b[1].date))
    .map(([id, { name }], i) => ({ id, name, color: ITEM_COLORS[i % ITEM_COLORS.length] }));
}

// ─── Internal bucket builder ───────────────────────────────────────────────────

type Bucket = Map<string, Map<string, { revenue: number; costs: number }>>;

/**
 * Builds two separate bucket maps:
 * - revBuckets: revenue keyed by soldAt period (when money came in)
 * - costBuckets: costs keyed by purchasedAt period (when money went out)
 */
function buildBuckets(
  sales: DashboardSale[], periods: string[], g: Granularity
): { revBuckets: Bucket; costBuckets: Bucket } {
  const revBuckets: Bucket  = new Map();
  const costBuckets: Bucket = new Map();
  for (const p of periods) {
    revBuckets.set(p, new Map());
    costBuckets.set(p, new Map());
  }

  for (const sale of sales) {
    // Revenue → sale period (only for sold items)
    if (sale.soldAt !== null) {
      const revKey    = salePeriodKey(sale.soldAt, g);
      const revPeriod = revBuckets.get(revKey);
      if (revPeriod) {
        const prev = revPeriod.get(sale.itemId) ?? { revenue: 0, costs: 0 };
        revPeriod.set(sale.itemId, { revenue: prev.revenue + sale.revenue, costs: 0 });
      }
    }

    // Costs → purchase period (all items, including IN_STOCK)
    const costKey    = salePeriodKey(sale.purchasedAt, g);
    const costPeriod = costBuckets.get(costKey);
    if (costPeriod) {
      const prev = costPeriod.get(sale.itemId) ?? { revenue: 0, costs: 0 };
      costPeriod.set(sale.itemId, { revenue: 0, costs: prev.costs + sale.costs });
    }
  }

  return { revBuckets, costBuckets };
}

export type ChartRow = Record<string, string | number>;

// ─── Chart data derivers ───────────────────────────────────────────────────────

export function toBenefitVelocityData(
  sales: DashboardSale[], periods: string[], items: ItemMeta[], g: Granularity
): { data: ChartRow[]; avgCostLine: number } {
  const { revBuckets, costBuckets } = buildBuckets(sales, periods, g);
  const data = periods.map((p) => {
    const row: ChartRow = { period: periodLabel(p, g) };
    for (const item of items) row[item.id] = revBuckets.get(p)?.get(item.id)?.revenue ?? 0;
    return row;
  });
  // avgCostLine uses total costs spread evenly across periods (purchase-date costs)
  let totalCosts = 0;
  for (const period of costBuckets.values()) for (const v of period.values()) totalCosts += v.costs;
  const avgCostLine = periods.length > 0 ? parseFloat((totalCosts / periods.length).toFixed(2)) : 0;
  return { data, avgCostLine };
}

export function toCostDistributionData(
  sales: DashboardSale[], periods: string[], items: ItemMeta[], g: Granularity
): { data: ChartRow[]; avgCostLine: number } {
  const { costBuckets } = buildBuckets(sales, periods, g);
  const data = periods.map((p) => {
    const row: ChartRow = { period: periodLabel(p, g) };
    for (const item of items) row[item.id] = costBuckets.get(p)?.get(item.id)?.costs ?? 0;
    return row;
  });
  let totalCosts = 0;
  for (const period of costBuckets.values()) for (const v of period.values()) totalCosts += v.costs;
  const avgCostLine = periods.length > 0 ? parseFloat((totalCosts / periods.length).toFixed(2)) : 0;
  return { data, avgCostLine };
}

export function toRoiData(
  sales: DashboardSale[], periods: string[], g: Granularity
): Array<{ period: string; Revenue: number; Costs: number }> {
  const { revBuckets, costBuckets } = buildBuckets(sales, periods, g);
  return periods.map((p) => {
    let revenue = 0, costs = 0;
    for (const v of (revBuckets.get(p)  ?? new Map()).values()) revenue += v.revenue;
    for (const v of (costBuckets.get(p) ?? new Map()).values()) costs   += v.costs;
    return { period: periodLabel(p, g), Revenue: parseFloat(revenue.toFixed(2)), Costs: parseFloat(costs.toFixed(2)) };
  });
}

export function toGainedValueData(
  sales: DashboardSale[], periods: string[], items: ItemMeta[], g: Granularity
): ChartRow[] {
  const { revBuckets } = buildBuckets(sales, periods, g);
  const running: Record<string, number> = {};
  return periods.map((p) => {
    const row: ChartRow = { period: periodLabel(p, g) };
    for (const item of items) {
      running[item.id] = (running[item.id] ?? 0) + (revBuckets.get(p)?.get(item.id)?.revenue ?? 0);
      row[item.id] = parseFloat(running[item.id].toFixed(2));
    }
    return row;
  });
}

export function toCumulativeCostData(
  sales: DashboardSale[], periods: string[], items: ItemMeta[], g: Granularity
): ChartRow[] {
  const { costBuckets } = buildBuckets(sales, periods, g);
  const running: Record<string, number> = {};
  return periods.map((p) => {
    const row: ChartRow = { period: periodLabel(p, g) };
    for (const item of items) {
      running[item.id] = (running[item.id] ?? 0) + (costBuckets.get(p)?.get(item.id)?.costs ?? 0);
      row[item.id] = parseFloat(running[item.id].toFixed(2));
    }
    return row;
  });
}

export function toCashFlowData(
  sales: DashboardSale[], periods: string[], g: Granularity
): Array<{ period: string; cashFlow: number }> {
  const { revBuckets, costBuckets } = buildBuckets(sales, periods, g);
  return periods.map((p) => {
    let revenue = 0, costs = 0;
    for (const v of (revBuckets.get(p)  ?? new Map()).values()) revenue += v.revenue;
    for (const v of (costBuckets.get(p) ?? new Map()).values()) costs   += v.costs;
    return { period: periodLabel(p, g), cashFlow: parseFloat((revenue - costs).toFixed(2)) };
  });
}

export type BreakEvenPoint = { period: string; accRevenue: number; accCosts: number };

export function toBreakEvenData(
  sales: DashboardSale[], periods: string[], g: Granularity
): { data: BreakEvenPoint[]; breakEvenPeriod?: string } {
  const { revBuckets, costBuckets } = buildBuckets(sales, periods, g);
  let accRevenue = 0, accCosts = 0;
  let breakEvenPeriod: string | undefined;

  const data: BreakEvenPoint[] = periods.map((p) => {
    for (const v of (revBuckets.get(p)  ?? new Map()).values()) accRevenue += v.revenue;
    for (const v of (costBuckets.get(p) ?? new Map()).values()) accCosts   += v.costs;
    const label = periodLabel(p, g);
    if (!breakEvenPeriod && accRevenue >= accCosts && accCosts > 0) breakEvenPeriod = label;
    return { period: label, accRevenue: parseFloat(accRevenue.toFixed(2)), accCosts: parseFloat(accCosts.toFixed(2)) };
  });

  return { data, breakEvenPeriod };
}
