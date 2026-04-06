'use server';

// Data access layer — all DB calls for sales.
// No UI logic. No business rules. Only Prisma queries.
// Auth check happens before every mutation.

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import type { RecordSaleInput } from '../types/sales.types';

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
export async function createSale(data: RecordSaleInput): Promise<void> {
  const userId = await getLocalUserId();

  // Verify ownership and status before writing
  const item = await prisma.item.findFirst({
    where: { id: data.itemId, userId },
  });

  if (!item) throw new Error('Item not found');
  if (item.status === 'SOLD') throw new Error('Item is already sold');

  // Atomic: both writes succeed or neither does
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
    prisma.item.update({
      where: { id: data.itemId },
      data:  { status: 'SOLD' },
    }),
  ]);
}
