import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateSaleStreak } from './streakUtils';

function monday(weeksAgo: number): Date {
  const now = new Date();
  const day = now.getDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysToMonday - weeksAgo * 7);
  return d;
}

afterEach(() => vi.useRealTimers());

describe('calculateSaleStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calculateSaleStreak([])).toBe(0);
  });

  it('returns 1 for a sale this week', () => {
    expect(calculateSaleStreak([monday(0)])).toBe(1);
  });

  it('returns 1 for a sale last week (no sale this week)', () => {
    expect(calculateSaleStreak([monday(1)])).toBe(1);
  });

  it('returns 3 for 3 consecutive weeks', () => {
    expect(calculateSaleStreak([monday(0), monday(1), monday(2)])).toBe(3);
  });

  it('returns 1 when there is a gap (weeks 1+2, then pause, then week 4)', () => {
    expect(calculateSaleStreak([monday(1), monday(2), monday(4)])).toBe(2);
  });

  it('counts a week only once even with multiple sales', () => {
    const thisWeek = [monday(0), new Date(monday(0).getTime() + 86_400_000)];
    expect(calculateSaleStreak(thisWeek)).toBe(1);
  });

  it('returns 0 when last sale was 2+ weeks ago', () => {
    expect(calculateSaleStreak([monday(2)])).toBe(0);
  });

  it('handles sales on different weekdays in the same week', () => {
    const base = monday(0);
    const wed = new Date(base.getTime() + 2 * 86_400_000);
    const fri = new Date(base.getTime() + 4 * 86_400_000);
    expect(calculateSaleStreak([base, wed, fri])).toBe(1);
  });
});
