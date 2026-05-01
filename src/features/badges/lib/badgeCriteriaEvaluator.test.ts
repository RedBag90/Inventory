import { describe, it, expect } from 'vitest';
import { evaluateCriteria } from './badgeCriteriaEvaluator';
import type { BadgeCriteria } from '../types/badge.types';
import type { BadgeTrigger } from '../services/BadgeAwardService';

const stats = { itemsBought: 10, itemsSold: 5, totalProfit: 200 };

const saleRecorded: BadgeTrigger = { type: 'sale_recorded', userId: 'u1' };
const itemCreated:  BadgeTrigger = { type: 'item_created',  userId: 'u1' };

describe('items_bought', () => {
  const criteria: BadgeCriteria = { type: 'items_bought', threshold: 10 };
  it('returns false for wrong trigger', () => expect(evaluateCriteria(criteria, saleRecorded, stats)).toBe(false));
  it('returns true at exact threshold',  () => expect(evaluateCriteria(criteria, itemCreated, { ...stats, itemsBought: 10 })).toBe(true));
  it('returns true above threshold',     () => expect(evaluateCriteria(criteria, itemCreated, { ...stats, itemsBought: 11 })).toBe(true));
  it('returns false below threshold',    () => expect(evaluateCriteria(criteria, itemCreated, { ...stats, itemsBought: 9  })).toBe(false));
});

describe('items_sold', () => {
  const criteria: BadgeCriteria = { type: 'items_sold', threshold: 5 };
  it('returns false for wrong trigger', () => expect(evaluateCriteria(criteria, itemCreated, stats)).toBe(false));
  it('returns true at exact threshold',  () => expect(evaluateCriteria(criteria, saleRecorded, { ...stats, itemsSold: 5 })).toBe(true));
  it('returns false below threshold',    () => expect(evaluateCriteria(criteria, saleRecorded, { ...stats, itemsSold: 4 })).toBe(false));
});

describe('total_profit', () => {
  const criteria: BadgeCriteria = { type: 'total_profit', threshold: 200 };
  it('returns true at exact threshold', () => expect(evaluateCriteria(criteria, saleRecorded, { ...stats, totalProfit: 200 })).toBe(true));
  it('returns false below threshold',   () => expect(evaluateCriteria(criteria, saleRecorded, { ...stats, totalProfit: 199 })).toBe(false));
});

describe('speed_days', () => {
  const criteria: BadgeCriteria = { type: 'speed_days', threshold: 3 };
  it('returns true when storageDays ≤ threshold', () => {
    expect(evaluateCriteria(criteria, { ...saleRecorded, storageDays: 3 }, stats)).toBe(true);
  });
  it('returns false when storageDays > threshold', () => {
    expect(evaluateCriteria(criteria, { ...saleRecorded, storageDays: 4 }, stats)).toBe(false);
  });
  it('returns false when isQuickSell is true', () => {
    expect(evaluateCriteria(criteria, { ...saleRecorded, storageDays: 1, isQuickSell: true }, stats)).toBe(false);
  });
  it('returns false when storageDays undefined', () => {
    expect(evaluateCriteria(criteria, saleRecorded, stats)).toBe(false);
  });
});

describe('leaderboard_rank', () => {
  const criteria: BadgeCriteria = { type: 'leaderboard_rank', threshold: 3 };
  const lbTrigger: BadgeTrigger = { type: 'leaderboard_check', userId: 'u1', rank: 2 };
  it('returns true when rank ≤ threshold',  () => expect(evaluateCriteria(criteria, lbTrigger, stats)).toBe(true));
  it('returns false when rank > threshold', () => expect(evaluateCriteria(criteria, { ...lbTrigger, rank: 4 }, stats)).toBe(false));
});

describe('engagement', () => {
  const criteria: BadgeCriteria = { type: 'engagement', event: 'set_display_name' };
  it('returns true on matching event',    () => expect(evaluateCriteria(criteria, { type: 'engagement', userId: 'u1', event: 'set_display_name' }, stats)).toBe(true));
  it('returns false on different event',  () => expect(evaluateCriteria(criteria, { type: 'engagement', userId: 'u1', event: 'other' }, stats)).toBe(false));
});

describe('sales_streak', () => {
  const criteria: BadgeCriteria = { type: 'sales_streak', threshold: 4 };
  const streakTrigger: BadgeTrigger = { type: 'streak_check', userId: 'u1', streak: 4 };
  it('returns true at exact threshold',  () => expect(evaluateCriteria(criteria, streakTrigger, stats)).toBe(true));
  it('returns false below threshold',    () => expect(evaluateCriteria(criteria, { ...streakTrigger, streak: 3 }, stats)).toBe(false));
});

describe('single_deal_profit', () => {
  const criteria: BadgeCriteria = { type: 'single_deal_profit', threshold: 50 };
  it('returns true when profit ≥ threshold',  () => expect(evaluateCriteria(criteria, { ...saleRecorded, singleItemProfit: 50 }, stats)).toBe(true));
  it('returns false when profit < threshold', () => expect(evaluateCriteria(criteria, { ...saleRecorded, singleItemProfit: 49 }, stats)).toBe(false));
  it('returns false when profit undefined',   () => expect(evaluateCriteria(criteria, saleRecorded, stats)).toBe(false));
});

describe('portfolio_size', () => {
  const criteria: BadgeCriteria = { type: 'portfolio_size', threshold: 5 };
  it('returns true when count ≥ threshold',  () => expect(evaluateCriteria(criteria, { ...itemCreated, currentStockCount: 5 }, stats)).toBe(true));
  it('returns false when count < threshold', () => expect(evaluateCriteria(criteria, { ...itemCreated, currentStockCount: 4 }, stats)).toBe(false));
  it('returns false when count undefined',   () => expect(evaluateCriteria(criteria, itemCreated, stats)).toBe(false));
});
