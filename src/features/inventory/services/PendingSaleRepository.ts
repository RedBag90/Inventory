'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentUserId } from '@/shared/lib/auth/getCurrentUserId';
import { checkAndAwardBadges } from '@/features/badges/services/BadgeAwardService';
import { checkLeaderboardBadges } from '@/features/badges/services/leaderboardBadgeService';
import { checkStreakBadges } from '@/features/badges/services/streakBadgeService';
import { calculateStorageDays } from '@/shared/lib/calculations';
import { revalidatePath } from 'next/cache';
import {
  CreatePendingSaleSchema,
  UpdatePendingSaleSchema,
  QuickPendingSaleSchema,
} from '@/features/sales/types/sales.types';
import type {
  CreatePendingSaleInput,
  UpdatePendingSaleInput,
  QuickPendingSaleInput,
} from '@/features/sales/types/sales.types';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

export async function createPendingSale(data: CreatePendingSaleInput): Promise<void> {
  const parsed = CreatePendingSaleSchema.parse(data);
  const userId = await getCurrentUserId();

  const item = await prisma.item.findFirst({ where: { id: parsed.itemId, userId } });
  if (!item) throw new Error('Item not found');
  if (item.status !== 'IN_STOCK') throw new Error(
    item.status === 'SOLD' ? 'Item is already sold' : 'Item already has a pending sale'
  );

  await prisma.$transaction([
    prisma.pendingSale.create({
      data: {
        itemId:          parsed.itemId,
        salePrice:       parsed.salePrice,
        salePlatform:    parsed.salePlatform,
        shippingCostOut: parsed.shippingCostOut,
        soldAt:          parsed.soldAt,
      },
    }),
    prisma.item.update({ where: { id: parsed.itemId }, data: { status: 'RESERVED' } }),
  ]);

  revalidatePath('/dashboard/inventory');
}

export async function confirmPendingSale(
  itemId: string,
  overrides?: UpdatePendingSaleInput
): Promise<{ newBadges: AwardedBadge[] }> {
  const userId = await getCurrentUserId();

  const item = await prisma.item.findFirst({
    where:   { id: itemId, userId },
    include: { pendingSale: true, costs: true },
  });
  if (!item)            throw new Error('Item not found');
  if (!item.pendingSale) throw new Error('No pending sale found');

  const parsed = overrides ? UpdatePendingSaleSchema.parse(overrides) : null;

  const saleData = {
    salePrice:       parsed?.salePrice       ?? item.pendingSale.salePrice,
    salePlatform:    parsed?.salePlatform     ?? item.pendingSale.salePlatform,
    shippingCostOut: parsed?.shippingCostOut  ?? item.pendingSale.shippingCostOut,
    soldAt:          parsed?.soldAt           ?? item.pendingSale.soldAt,
  };

  const storageDays = calculateStorageDays(item.purchasedAt, saleData.soldAt);

  await prisma.$transaction([
    prisma.sale.create({
      data: { itemId, ...saleData },
    }),
    prisma.pendingSale.delete({ where: { itemId } }),
    prisma.item.update({ where: { id: itemId }, data: { status: 'SOLD' } }),
  ]);

  const numSalePrice      = parsed?.salePrice       ?? item.pendingSale.salePrice.toNumber();
  const numShippingOut    = parsed?.shippingCostOut  ?? item.pendingSale.shippingCostOut.toNumber();
  const singleItemProfit  =
    numSalePrice
    - item.purchasePrice.toNumber()
    - item.shippingCostIn.toNumber()
    - item.repairCost.toNumber()
    - numShippingOut
    - item.costs.reduce((s, c) => s + c.amount.toNumber(), 0);

  const saleBadges        = await checkAndAwardBadges({ type: 'sale_recorded', userId, storageDays, singleItemProfit });
  const leaderboardBadges = await checkLeaderboardBadges(userId);
  const streakBadges      = await checkStreakBadges(userId);

  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard');

  return { newBadges: [...saleBadges, ...leaderboardBadges, ...streakBadges] };
}

export async function cancelPendingSale(itemId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const item = await prisma.item.findFirst({ where: { id: itemId, userId } });
  if (!item) throw new Error('Item not found');
  if (item.status === 'IN_STOCK' || item.status === 'SOLD') throw new Error('Item has no pending sale');

  await prisma.$transaction([
    prisma.pendingSale.delete({ where: { itemId } }),
    prisma.item.update({ where: { id: itemId }, data: { status: 'IN_STOCK' } }),
  ]);

  revalidatePath('/dashboard/inventory');
}

export async function updatePendingSale(itemId: string, data: UpdatePendingSaleInput): Promise<void> {
  const parsed = UpdatePendingSaleSchema.parse(data);
  const userId = await getCurrentUserId();

  const item = await prisma.item.findFirst({ where: { id: itemId, userId } });
  if (!item) throw new Error('Item not found');
  if (item.status === 'IN_STOCK' || item.status === 'SOLD') throw new Error('Item has no pending sale');

  await prisma.pendingSale.update({
    where: { itemId },
    data: {
      salePrice:       parsed.salePrice,
      salePlatform:    parsed.salePlatform,
      shippingCostOut: parsed.shippingCostOut,
      soldAt:          parsed.soldAt,
    },
  });

  revalidatePath('/dashboard/inventory');
}

export async function createQuickPendingSale(data: QuickPendingSaleInput): Promise<void> {
  const parsed = QuickPendingSaleSchema.parse(data);
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
        status:           'RESERVED',
      },
    });
    await tx.pendingSale.create({
      data: {
        itemId:          item.id,
        salePrice:       parsed.salePrice,
        salePlatform:    parsed.salePlatform,
        shippingCostOut: parsed.shippingCostOut,
        soldAt:          parsed.soldAt,
      },
    });
  });

  revalidatePath('/dashboard/inventory');
}
