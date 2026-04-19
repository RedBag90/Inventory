'use server';

// Data access layer — all DB calls for sales.
// No UI logic. No business rules. Only Prisma queries.
// Auth check happens before every mutation.

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { checkAndAwardBadges } from '@/features/badges/services/BadgeAwardService';
import type { RecordSaleInput, QuickSellInput } from '../types/sales.types';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getLocalUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) throw new Error('User record not found');

  return dbUser.id;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * US-014 — Record a sale against an IN_STOCK item.
 * Atomically creates the Sale record and transitions the item to SOLD.
 * Throws if the item is not found, not owned by the user, or already SOLD.
 */
export async function createSale(data: RecordSaleInput): Promise<{ newBadges: AwardedBadge[] }> {
  const userId = await getLocalUserId();

  const item = await prisma.item.findFirst({ where: { id: data.itemId, userId } });
  if (!item) throw new Error('Item not found');
  if (item.status === 'SOLD') throw new Error('Item is already sold');

  const storageDays = Math.floor(
    (data.soldAt.getTime() - item.purchasedAt.getTime()) / 86_400_000
  );

  await prisma.$transaction([
    prisma.sale.create({
      data: {
        itemId:          data.itemId,
        salePrice:       data.salePrice,
        salePlatform:    data.salePlatform,
        shippingCostOut: data.shippingCostOut ?? 0,
        soldAt:          data.soldAt,
      },
    }),
    prisma.item.update({ where: { id: data.itemId }, data: { status: 'SOLD' } }),
  ]);

  const newBadges = await checkAndAwardBadges({ type: 'sale_recorded', userId, storageDays });
  return { newBadges };
}

/**
 * Quick sell — atomically creates a new item and its sale in one step.
 * The item is created with purchasePrice=0, purchasedAt=soldAt, status=SOLD.
 */
export async function createQuickSale(data: QuickSellInput): Promise<{ newBadges: AwardedBadge[] }> {
  const userId = await getLocalUserId();

  await prisma.$transaction(async (tx) => {
    const item = await tx.item.create({
      data: {
        userId,
        name:             data.name,
        purchasePrice:    0,
        purchasePlatform: data.salePlatform,
        purchasedAt:      data.soldAt,
        shippingCostIn:   0,
        repairCost:       0,
        status:           'SOLD',
      },
    });
    await tx.sale.create({
      data: {
        itemId:          item.id,
        salePrice:       data.salePrice,
        salePlatform:    data.salePlatform,
        shippingCostOut: data.shippingCostOut ?? 0,
        soldAt:          data.soldAt,
      },
    });
  });

  // Quick sell: 0 storage days (bought and sold same day)
  const newBadges = await checkAndAwardBadges({ type: 'sale_recorded', userId, storageDays: 0 });
  return { newBadges };
}
