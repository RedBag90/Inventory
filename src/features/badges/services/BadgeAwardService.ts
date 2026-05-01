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

  const newBadges: AwardedBadge[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    const criteria = BadgeCriteriaSchema.parse(badge.criteria);
    const qualifies = evaluateCriteria(criteria, trigger, stats);

    if (qualifies) {
      const userBadge = await prisma.userBadge.create({
        data: { userId, badgeId: badge.id, notified: false },
      });
      newBadges.push({
        id:         badge.id,
        slug:       badge.slug,
        category:   badge.category as AwardedBadge['category'],
        tier:       badge.tier     as AwardedBadge['tier'],
        criteria,
        sortOrder:  badge.sortOrder,
        unlockedAt: userBadge.unlockedAt,
      });
    }
  }

  return newBadges;
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
