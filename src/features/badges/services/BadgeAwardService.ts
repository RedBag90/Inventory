'use server';

import { prisma } from '@/shared/lib/prisma';
import type { BadgeCriteria, AwardedBadge } from '../types/badge.types';

export type BadgeTrigger =
  | { type: 'sale_recorded';    userId: string; storageDays?: number }
  | { type: 'item_created';     userId: string }
  | { type: 'engagement';       userId: string; event: string }
  | { type: 'leaderboard_check'; userId: string; rank: number };

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

    const criteria = badge.criteria as BadgeCriteria;
    let qualifies = false;

    if (criteria.type === 'items_bought' && trigger.type === 'item_created') {
      qualifies = stats.itemsBought >= criteria.threshold;
    } else if (criteria.type === 'items_sold' && trigger.type === 'sale_recorded') {
      qualifies = stats.itemsSold >= criteria.threshold;
    } else if (criteria.type === 'total_profit' && trigger.type === 'sale_recorded') {
      qualifies = stats.totalProfit >= criteria.threshold;
    } else if (criteria.type === 'speed_days' && trigger.type === 'sale_recorded') {
      qualifies = trigger.storageDays !== undefined && trigger.storageDays <= criteria.threshold;
    } else if (criteria.type === 'leaderboard_rank' && trigger.type === 'leaderboard_check') {
      qualifies = trigger.rank <= criteria.threshold;
    } else if (criteria.type === 'engagement' && trigger.type === 'engagement') {
      qualifies = trigger.event === criteria.event;
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
        criteria:   badge.criteria as BadgeCriteria,
        sortOrder:  badge.sortOrder,
        unlockedAt: userBadge.unlockedAt,
      });
    }
  }

  return newBadges;
}

async function loadUserStats(userId: string) {
  const items = await prisma.item.findMany({
    where:   { userId },
    include: { costs: true, sale: true },
  });

  const itemsBought = items.length;
  const soldItems   = items.filter((i) => i.status === 'SOLD' && i.sale);

  const totalProfit = soldItems.reduce((sum, item) => {
    const sale = item.sale!;
    return (
      sum
      + sale.salePrice.toNumber()
      - item.purchasePrice.toNumber()
      - item.shippingCostIn.toNumber()
      - item.repairCost.toNumber()
      - sale.shippingCostOut.toNumber()
      - item.costs.reduce((s, c) => s + c.amount.toNumber(), 0)
    );
  }, 0);

  return { itemsBought, itemsSold: soldItems.length, totalProfit };
}
