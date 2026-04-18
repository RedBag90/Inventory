import { describe, it, expect } from 'vitest';
import {
  generatePeriods,
  getItemsMeta,
  toRoiData,
  toCashFlowData,
  toBreakEvenData,
  ITEM_COLORS,
} from './dashboardUtils';
import type { DashboardSale } from '../services/getDashboardData';

function makeSale(overrides: Partial<DashboardSale> = {}): DashboardSale {
  return {
    itemId:      'item-1',
    itemName:    'Test Item',
    purchasedAt: '2026-01-15',
    soldAt:      '2026-02-20',
    revenue:     20,
    costs:       10,
    ...overrides,
  };
}

// ── generatePeriods ────────────────────────────────────────────────────────────

describe('generatePeriods', () => {
  it('generates monthly periods inclusive', () => {
    const periods = generatePeriods('2026-01-01', '2026-03-31', 'monthly');
    expect(periods).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('generates quarterly periods inclusive', () => {
    const periods = generatePeriods('2026-01-01', '2026-09-30', 'quarterly');
    expect(periods).toEqual(['2026-Q1', '2026-Q2', '2026-Q3']);
  });

  it('returns single period when from === to (monthly)', () => {
    const periods = generatePeriods('2026-06-01', '2026-06-30', 'monthly');
    expect(periods).toEqual(['2026-06']);
  });

  it('wraps year boundary for monthly', () => {
    const periods = generatePeriods('2025-11-01', '2026-02-28', 'monthly');
    expect(periods).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });
});

// ── getItemsMeta ───────────────────────────────────────────────────────────────

describe('getItemsMeta', () => {
  it('returns unique items with stable colors', () => {
    const sales = [
      makeSale({ itemId: 'a', itemName: 'Alpha', purchasedAt: '2026-01-01' }),
      makeSale({ itemId: 'b', itemName: 'Beta',  purchasedAt: '2026-01-02' }),
      makeSale({ itemId: 'a', itemName: 'Alpha', purchasedAt: '2026-01-01' }),
    ];
    const meta = getItemsMeta(sales);
    expect(meta).toHaveLength(2);
    expect(meta[0].id).toBe('a');
    expect(meta[1].id).toBe('b');
    expect(meta[0].color).toBe(ITEM_COLORS[0]);
    expect(meta[1].color).toBe(ITEM_COLORS[1]);
  });

  it('returns empty array for no sales', () => {
    expect(getItemsMeta([])).toEqual([]);
  });
});

// ── toRoiData ──────────────────────────────────────────────────────────────────

describe('toRoiData', () => {
  it('aggregates revenue and costs per period', () => {
    const sales = [
      makeSale({ soldAt: '2026-01-10', purchasedAt: '2026-01-05', revenue: 30, costs: 10 }),
      makeSale({ soldAt: '2026-02-10', purchasedAt: '2026-02-05', revenue: 20, costs: 5 }),
    ];
    const periods = ['2026-01', '2026-02'];
    const result = toRoiData(sales, periods, 'monthly');
    expect(result[0].Revenue).toBe(30);
    expect(result[0].Costs).toBe(10);
    expect(result[1].Revenue).toBe(20);
    expect(result[1].Costs).toBe(5);
  });
});

// ── toCashFlowData ─────────────────────────────────────────────────────────────

describe('toCashFlowData', () => {
  it('computes revenue minus costs per period', () => {
    const sales = [
      makeSale({ soldAt: '2026-01-10', purchasedAt: '2026-01-05', revenue: 30, costs: 10 }),
    ];
    const result = toCashFlowData(sales, ['2026-01'], 'monthly');
    expect(result[0].cashFlow).toBe(20);
  });

  it('produces negative cashflow when costs exceed revenue', () => {
    const sales = [
      makeSale({ soldAt: null, purchasedAt: '2026-01-05', revenue: 0, costs: 15 }),
    ];
    const result = toCashFlowData(sales, ['2026-01'], 'monthly');
    expect(result[0].cashFlow).toBe(-15);
  });
});

// ── toBreakEvenData ────────────────────────────────────────────────────────────

describe('toBreakEvenData', () => {
  it('identifies break-even period', () => {
    const sales = [
      makeSale({ soldAt: '2026-01-10', purchasedAt: '2026-01-01', revenue: 5,  costs: 10 }),
      makeSale({ soldAt: '2026-02-10', purchasedAt: '2026-02-01', revenue: 15, costs: 0  }),
    ];
    const { breakEvenPeriod } = toBreakEvenData(sales, ['2026-01', '2026-02'], 'monthly');
    expect(breakEvenPeriod).toBe('Feb 2026');
  });

  it('returns undefined breakEvenPeriod when never profitable', () => {
    const sales = [makeSale({ soldAt: null, purchasedAt: '2026-01-01', revenue: 0, costs: 100 })];
    const { breakEvenPeriod } = toBreakEvenData(sales, ['2026-01'], 'monthly');
    expect(breakEvenPeriod).toBeUndefined();
  });
});
