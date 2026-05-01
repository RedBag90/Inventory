'use server';

import { prisma } from '@/shared/lib/prisma';
import { computeProfit } from '@/shared/lib/calculations';
import { checkAndAwardBadges } from './BadgeAwardService';
import type { AwardedBadge } from '../types/badge.types';

async function getUserRankInInstance(
  userId: string,
  instanceId: string,
  startsAt: Date,
  endsAt: Date,
): Promise<number> {
  const users = await prisma.user.findMany({
    where: { isActive: true, memberships: { some: { instanceId } } },
    select: {
      id: true,
      items: {
        where: {
          OR: [
            { purchasedAt: { gte: startsAt, lte: endsAt } },
            { sale: { soldAt: { gte: startsAt, lte: endsAt } } },
          ],
        },
        select: {
          purchasePrice:  true,
          shippingCostIn: true,
          repairCost:     true,
          costs:          { select: { amount: true } },
          sale:           { select: { salePrice: true, shippingCostOut: true, soldAt: true } },
        },
      },
    },
  });

  const profits = users.map((u) => {
    const soldItems = u.items.filter(
      (i) => i.sale && i.sale.soldAt >= startsAt && i.sale.soldAt <= endsAt,
    );
    const totalProfit = soldItems.reduce(
      (s, i) => s + computeProfit({ ...i.sale!, item: i }),
      0,
    );
    return { id: u.id, totalProfit };
  });

  const sorted = profits.sort((a, b) => b.totalProfit - a.totalProfit);
  const idx    = sorted.findIndex((p) => p.id === userId);
  return idx === -1 ? Infinity : idx + 1;
}

/**
 * Checks all active olympiad instances the user belongs to, computes their
 * current rank, and awards leaderboard badges (top-3, champion) if earned.
 */
export async function checkLeaderboardBadges(userId: string): Promise<AwardedBadge[]> {
  const memberships = await prisma.instanceMembership.findMany({
    where: { userId, instance: { isActive: true } },
    select: {
      instance: { select: { id: true, startsAt: true, endsAt: true } },
    },
  });

  if (memberships.length === 0) return [];

  const allNewBadges: AwardedBadge[] = [];

  for (const { instance } of memberships) {
    const rank = await getUserRankInInstance(
      userId,
      instance.id,
      instance.startsAt,
      instance.endsAt,
    );
    if (rank <= 3) {
      const newBadges = await checkAndAwardBadges({
        type: 'leaderboard_check',
        userId,
        rank,
      });
      allNewBadges.push(...newBadges);
    }
  }

  return allNewBadges;
}
