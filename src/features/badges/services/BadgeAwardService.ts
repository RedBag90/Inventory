'use server';

import { prisma } from '@/shared/lib/prisma';
import { computeProfit } from '@/shared/lib/calculations';
import { BadgeCriteriaSchema } from '../types/badge.types';
import { evaluateCriteria } from '../lib/badgeCriteriaEvaluator';
import type { AwardedBadge } from '../types/badge.types';

export type BadgeTrigger =
  | { type: 'sale_recorded';    userId: string; storageDays?: number; isQuickSell?: boolean; singleItemProfit?: number }
  | { type: 'item_created';     userId: string; currentStockCount?: number }
  | { type: 'engagement';       userId: string; event: string }
  | { type: 'leaderboard_check'; userId: string; rank: number }
  | { type: 'streak_check';     userId: string; streak: number };

export async function checkAndAwardBadges(trigger: BadgeTrigger): Promise<AwardedBadge[]> {
  const { userId } = trigger;

  // Load all badge definitions
  const allBadges = await prisma.badge.findMany({ orderBy: { sortOrder: 'asc' } });

  // Load already-earned badge IDs
  const existingBadges = await prisma.userBadge.findMany({
    where:  { userId },
    select: { badgeId: true },
  });
  const earnedIds = new Set(existingBadges.map((e) => e.badgeId));

  // Load user stats needed for evaluation
  const stats = await loadUserStats(userId);

  const qualifying = allBadges.filter((badge) => {
    if (earnedIds.has(badge.id)) return false;
    const criteria = BadgeCriteriaSchema.parse(badge.criteria);
    return evaluateCriteria(criteria, trigger, stats);
  });

  if (qualifying.length === 0) return [];

  await prisma.userBadge.createMany({
    data:           qualifying.map((b) => ({ userId, badgeId: b.id, notified: false })),
    skipDuplicates: true,
  });

  const created = await prisma.userBadge.findMany({
    where:  { userId, badgeId: { in: qualifying.map((b) => b.id) } },
    select: { badgeId: true, unlockedAt: true },
  });
  const unlockedAtMap = new Map(created.map((c) => [c.badgeId, c.unlockedAt]));

  return qualifying.map((badge) => ({
    id:         badge.id,
    slug:       badge.slug,
    category:   badge.category as AwardedBadge['category'],
    tier:       badge.tier     as AwardedBadge['tier'],
    criteria:   BadgeCriteriaSchema.parse(badge.criteria),
    sortOrder:  badge.sortOrder,
    unlockedAt: unlockedAtMap.get(badge.id) ?? new Date(),
  }));
}

async function loadUserStats(userId: string) {
  const [itemsBought, soldSales] = await Promise.all([
    prisma.item.count({ where: { userId, NOT: { AND: [{ purchasePrice: 0 }, { status: 'SOLD' }] } } }),
    prisma.sale.findMany({
      where:   { item: { userId } },
      select: {
        salePrice:       true,
        shippingCostOut: true,
        item: {
          select: {
            purchasePrice:  true,
            shippingCostIn: true,
            repairCost:     true,
            costs:          { select: { amount: true } },
          },
        },
      },
    }),
  ]);

  const totalProfit = soldSales.reduce((sum, sale) => sum + computeProfit(sale), 0);
  return { itemsBought, itemsSold: soldSales.length, totalProfit };
}
