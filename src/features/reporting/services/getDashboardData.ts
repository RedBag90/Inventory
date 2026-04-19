'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentDbUser } from '@/shared/lib/auth/getCurrentUserId';
import { ROLES } from '@/shared/types/auth';
import { computeProfit } from '@/shared/lib/calculations';

export type DashboardSale = {
  itemId:      string;
  itemName:    string;
  soldAt:      string | null; // null for IN_STOCK items — no revenue, costs only
  purchasedAt: string;        // ISO string — purchase date, used for cost bucketing
  revenue:     number;
  costs:       number;
};

async function resolveUserId(targetUserId?: string): Promise<string> {
  const caller = await getCurrentDbUser();
  if (!targetUserId || targetUserId === caller.id) return caller.id;
  if (caller.role === ROLES.MASTER_ADMIN) return targetUserId;
  if (caller.role !== ROLES.ADMIN) throw new Error('Forbidden');
  const adminMemberships = await prisma.instanceMembership.findMany({
    where:  { userId: caller.id, memberRole: 'ADMIN' },
    select: { instanceId: true },
  });
  const adminInstanceIds = adminMemberships.map(m => m.instanceId);
  if (adminInstanceIds.length === 0) throw new Error('Forbidden');
  const targetInInstance = await prisma.instanceMembership.findFirst({
    where: { userId: targetUserId, instanceId: { in: adminInstanceIds } },
  });
  if (!targetInInstance) throw new Error('Forbidden');
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

  const soldEntries: DashboardSale[] = sales.map((sale) => {
    const revenue = sale.salePrice.toNumber();
    const profit  = computeProfit(sale);
    const costs   = revenue - profit;
    return {
      itemId:      sale.item.id,
      itemName:    sale.item.name,
      soldAt:      sale.soldAt.toISOString(),
      purchasedAt: sale.item.purchasedAt.toISOString(),
      revenue,
      costs,
    };
  });

  // IN_STOCK items purchased in the date range — contribute costs but no revenue
  const inStockItems = await prisma.item.findMany({
    where: {
      id:          { in: itemIds },
      status:      'IN_STOCK',
      purchasedAt: { gte: fromDate, lte: toDate },
    },
    include: { costs: true },
  });

  const unsoldEntries: DashboardSale[] = inStockItems.map((item) => {
    const costs =
      item.purchasePrice.toNumber() +
      item.shippingCostIn.toNumber() +
      item.repairCost.toNumber() +
      item.costs.reduce((sum, c) => sum + c.amount.toNumber(), 0);
    return {
      itemId:      item.id,
      itemName:    item.name,
      soldAt:      null,
      purchasedAt: item.purchasedAt.toISOString(),
      revenue:     0,
      costs,
    };
  });

  return [...soldEntries, ...unsoldEntries];
}
