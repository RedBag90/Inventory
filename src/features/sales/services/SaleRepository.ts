'use server';

// Data access layer — all DB calls for sales.
// No UI logic. No business rules. Only Prisma queries.
// Auth check happens before every mutation.

import { prisma } from '@/shared/lib/prisma';
import { getCurrentUserId } from '@/shared/lib/auth/getCurrentUserId';
import { checkAndAwardBadges } from '@/features/badges/services/BadgeAwardService';
import { checkLeaderboardBadges } from '@/features/badges/services/leaderboardBadgeService';
import { checkStreakBadges } from '@/features/badges/services/streakBadgeService';
import { calculateStorageDays } from '@/shared/lib/calculations';
import { RecordSaleSchema, QuickSellSchema } from '../types/sales.types';
import type { RecordSaleInput, QuickSellInput } from '../types/sales.types';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * US-014 — Record a sale against an IN_STOCK item.
 * Atomically creates the Sale record and transitions the item to SOLD.
 * Throws if the item is not found, not owned by the user, or already SOLD.
 */
export async function createSale(data: RecordSaleInput): Promise<{ newBadges: AwardedBadge[] }> {
  const parsed = RecordSaleSchema.parse(data);
  const userId = await getCurrentUserId();

  const item = await prisma.item.findFirst({
    where:   { id: parsed.itemId, userId },
    include: { costs: true },
  });
  if (!item) throw new Error('Item not found');
  if (item.status === 'SOLD') throw new Error('Item is already sold');

  const storageDays = calculateStorageDays(item.purchasedAt, parsed.soldAt);
  const shippingOut = parsed.shippingCostOut ?? 0;
  const singleItemProfit =
    parsed.salePrice
    - item.purchasePrice.toNumber()
    - item.shippingCostIn.toNumber()
    - item.repairCost.toNumber()
    - shippingOut
    - item.costs.reduce((s, c) => s + c.amount.toNumber(), 0);

  await prisma.$transaction([
    prisma.sale.create({
      data: {
        itemId:          parsed.itemId,
        salePrice:       parsed.salePrice,
        salePlatform:    parsed.salePlatform,
        shippingCostOut: shippingOut,
        soldAt:          parsed.soldAt,
      },
    }),
    prisma.item.update({ where: { id: parsed.itemId }, data: { status: 'SOLD' } }),
  ]);

  const [saleBadges, leaderboardBadges, streakBadges] = await Promise.all([
    checkAndAwardBadges({ type: 'sale_recorded', userId, storageDays, singleItemProfit }),
    checkLeaderboardBadges(userId),
    checkStreakBadges(userId),
  ]);
  return { newBadges: [...saleBadges, ...leaderboardBadges, ...streakBadges] };
}

/**
 * Quick sell — atomically creates a new item and its sale in one step.
 * The item is created with purchasePrice=0, purchasedAt=soldAt, status=SOLD.
 */
export async function createQuickSale(data: QuickSellInput): Promise<{ newBadges: AwardedBadge[] }> {
  const parsed = QuickSellSchema.parse(data);
  const userId = await getCurrentUserId();

  await prisma.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        userId,
        name:             parsed.name,
        purchasePrice:    0,
        purchasePlatform: parsed.salePlatform,
        purchasedAt:      parsed.soldAt,
        shippingCostIn:   0,
        repairCost:       0,
        status:           'SOLD',
      },
    });
    await tx.sale.create({
      data: {
        itemId:          item.id,
        salePrice:       parsed.salePrice,
        salePlatform:    parsed.salePlatform,
        shippingCostOut: parsed.shippingCostOut ?? 0,
        soldAt:          parsed.soldAt,
      },
    });
  });

  const singleItemProfit = parsed.salePrice - (parsed.shippingCostOut ?? 0);
  const [saleBadges, leaderboardBadges, streakBadges] = await Promise.all([
    checkAndAwardBadges({ type: 'sale_recorded', userId, storageDays: 0, isQuickSell: true, singleItemProfit }),
    checkLeaderboardBadges(userId),
    checkStreakBadges(userId),
  ]);
  return { newBadges: [...saleBadges, ...leaderboardBadges, ...streakBadges] };
}
