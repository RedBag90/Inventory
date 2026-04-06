'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

export type DashboardSale = {
  itemId:      string;
  itemName:    string;
  soldAt:      string;      // ISO string — sale date, used for revenue bucketing
  purchasedAt: string;      // ISO string — purchase date, used for cost bucketing
  revenue:     number;
  costs:       number;
};

async function resolveUserId(targetUserId?: string): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, role: true },
  });
  if (!dbUser) throw new Error('User record not found');

  if (!targetUserId || targetUserId === dbUser.id) return dbUser.id;
  if (dbUser.role !== 'ADMIN') throw new Error('Forbidden');
  return targetUserId;
}

export async function getDashboardData(
  from: string,
  to: string,
  targetUserId?: string
): Promise<DashboardSale[]> {
  const userId = await resolveUserId(targetUserId);

  const fromDate = new Date(from);
  const toDate   = new Date(to);
  toDate.setUTCHours(23, 59, 59, 999);

  // Resolve the user's item IDs first, then filter sales by those IDs.
  // This avoids nested-relation filtering which can behave unexpectedly
  // with Prisma's 1:1 relation on Sale → Item.
  const userItems = await prisma.item.findMany({
    where:  { userId },
    select: { id: true },
  });
  const itemIds = userItems.map((i) => i.id);

  if (itemIds.length === 0) return [];

  const sales = await prisma.sale.findMany({
    where: {
      itemId: { in: itemIds },
      soldAt: { gte: fromDate, lte: toDate },
    },
    include: { item: { include: { costs: true } } },
    orderBy: { soldAt: 'asc' },
  });

  return sales.map((sale) => {
    const revenue = sale.salePrice.toNumber();
    const costs =
      sale.item.purchasePrice.toNumber() +
      sale.item.shippingCostIn.toNumber() +
      sale.item.repairCost.toNumber() +
      sale.shippingCostOut.toNumber() +
      sale.item.costs.reduce((sum, c) => sum + c.amount.toNumber(), 0);
    return {
      itemId:      sale.item.id,
      itemName:    sale.item.name,
      soldAt:      sale.soldAt.toISOString(),
      purchasedAt: sale.item.purchasedAt.toISOString(),
      revenue,
      costs,
    };
  });
}
