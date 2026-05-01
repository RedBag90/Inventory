import type { BadgeTier } from '../types/badge.types';

const XP_BY_TIER: Record<BadgeTier, number> = {
  BRONZE: 50,
  SILVER: 150,
  GOLD:   400,
};

export function getBadgeXP(tier: BadgeTier): number {
  return XP_BY_TIER[tier];
}

export function computeTotalXP(earned: { badge: { tier: BadgeTier } }[]): number {
  return earned.reduce((sum, e) => sum + getBadgeXP(e.badge.tier), 0);
}
