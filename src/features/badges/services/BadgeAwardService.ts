'use server';

import { prisma } from '@/shared/lib/prisma';
import { computeProfit } from '@/shared/lib/calculations';
import { BadgeCriteriaSchema } from '../types/badge.types';
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
    let qualifies = false;

    if (criteria.type === 'items_bought' && trigger.type === 'item_created') {
      qualifies = stats.itemsBought >= criteria.threshold;
    } else if (criteria.type === 'items_sold' && trigger.type === 'sale_recorded') {
      qualifies = stats.itemsSold >= criteria.threshold;
    } else if (criteria.type === 'total_profit' && trigger.type === 'sale_recorded') {
      qualifies = stats.totalProfit >= criteria.threshold;
    } else if (criteria.type === 'speed_days' && trigger.type === 'sale_recorded' && !trigger.isQuickSell) {
      qualifies = trigger.storageDays !== undefined && trigger.storageDays <= criteria.threshold;
    } else if (criteria.type === 'leaderboard_rank' && trigger.type === 'leaderboard_check') {
      qualifies = trigger.rank <= criteria.threshold;
    } else if (criteria.type === 'engagement' && trigger.type === 'engagement') {
      qualifies = trigger.event === criteria.event;
    } else if (criteria.type === 'sales_streak' && trigger.type === 'streak_check') {
      qualifies = trigger.streak >= criteria.threshold;
    } else if (criteria.type === 'single_deal_profit' && trigger.type === 'sale_recorded') {
      qualifies = trigger.singleItemProfit !== undefined && trigger.singleItemProfit >= criteria.threshold;
    } else if (criteria.type === 'portfolio_size' && trigger.type === 'item_created') {
      qualifies = trigger.currentStockCount !== undefined && trigger.currentStockCount >= criteria.threshold;
    }

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
