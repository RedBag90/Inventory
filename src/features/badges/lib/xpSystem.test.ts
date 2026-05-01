import { describe, it, expect } from 'vitest';
import { getBadgeXP, computeTotalXP } from './xpSystem';

describe('getBadgeXP', () => {
  it('returns 50 for BRONZE', () => expect(getBadgeXP('BRONZE')).toBe(50));
  it('returns 150 for SILVER', () => expect(getBadgeXP('SILVER')).toBe(150));
  it('returns 400 for GOLD',   () => expect(getBadgeXP('GOLD')).toBe(400));
});

describe('computeTotalXP', () => {
  it('returns 0 for empty array', () => {
    expect(computeTotalXP([])).toBe(0);
  });

  it('sums XP across tiers', () => {
    const earned = [
      { badge: { tier: 'BRONZE' as const } },
      { badge: { tier: 'BRONZE' as const } },
      { badge: { tier: 'SILVER' as const } },
    ];
    expect(computeTotalXP(earned)).toBe(50 + 50 + 150);
  });

  it('reaches 4950 XP with all 27 badges', () => {
    const badges = [
      ...Array(11).fill({ badge: { tier: 'BRONZE' as const } }),
      ...Array(8).fill({ badge: { tier: 'SILVER' as const } }),
      ...Array(8).fill({ badge: { tier: 'GOLD'   as const } }),
    ];
    expect(computeTotalXP(badges)).toBe(11 * 50 + 8 * 150 + 8 * 400);
  });
});
