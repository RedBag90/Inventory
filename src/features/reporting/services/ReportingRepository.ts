'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentDbUser } from '@/shared/lib/auth/getCurrentUserId';
import { ROLES } from '@/shared/types/auth';
import { computeProfit, calculateStorageDays } from '@/shared/lib/calculations';
import type { DailyReport, MonthlyReport, QuarterlyReport, CumulativeReport } from '../types/reporting.types';

async function resolveUserId(targetUserId?: string): Promise<string> {
  const caller = await getCurrentDbUser();
  if (!targetUserId || targetUserId === caller.id) return caller.id;
  if (caller.role === ROLES.MASTER_ADMIN) return targetUserId;
  if (caller.role !== ROLES.ADMIN) throw new Error('Forbidden');
  // ADMIN: verify the target user is in one of the caller's managed instances
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

const SALE_INCLUDE = { item: { include: { costs: true } } } as const;

type SaleWithItem = {
  salePrice:       { toNumber(): number };
  shippingCostOut: { toNumber(): number };
  soldAt:          Date;
  item: {
    id:             string;
    name:           string;
    purchasePrice:  { toNumber(): number };
    shippingCostIn: { toNumber(): number };
    repairCost:     { toNumber(): number };
    purchasedAt:    Date;
    costs:          Array<{ amount: { toNumber(): number } }>;
  };
};

function computeSaleMetrics(sale: SaleWithItem) {
  const revenue     = sale.salePrice.toNumber();
  const profit      = computeProfit(sale);
  const costs       = revenue - profit;
  const storageDays = calculateStorageDays(sale.item.purchasedAt, sale.soldAt);
  return { revenue, costs, profit, storageDays };
}

export async function getMonthlyReport(year: number, month: number, targetUserId?: string): Promise<MonthlyReport> {
  const userId = await resolveUserId(targetUserId);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end   = new Date(Date.UTC(year, month, 1));
  const sales = await prisma.sale.findMany({ where: { soldAt: { gte: start, lt: end }, item: { userId } }, include: SALE_INCLUDE });
  let revenue = 0, costs = 0, profit = 0;
  for (const sale of sales) { const m = computeSaleMetrics(sale); revenue += m.revenue; costs += m.costs; profit += m.profit; }
  return { year, month, revenue, costs, profit, itemsSold: sales.length };
}

export async function getQuarterlyReport(year: number, quarter: 1 | 2 | 3 | 4, targetUserId?: string): Promise<QuarterlyReport> {
  const userId     = await resolveUserId(targetUserId);
  const startMonth = (quarter - 1) * 3;
  const start      = new Date(Date.UTC(year, startMonth, 1));
  const end        = new Date(Date.UTC(year, startMonth + 3, 1));
  const sales = await prisma.sale.findMany({ where: { soldAt: { gte: start, lt: end }, item: { userId } }, include: SALE_INCLUDE });
  let revenue = 0, costs = 0, profit = 0;
  for (const sale of sales) { const m = computeSaleMetrics(sale); revenue += m.revenue; costs += m.costs; profit += m.profit; }
  return { year, quarter, revenue, costs, profit, itemsSold: sales.length };
}

export async function getCumulativeReport(targetUserId?: string): Promise<CumulativeReport> {
  const userId = await resolveUserId(targetUserId);
  const sales = await prisma.sale.findMany({ where: { item: { userId } }, include: SALE_INCLUDE });
  let revenue = 0, costs = 0, profit = 0, totalStorageDays = 0;
  for (const sale of sales) {
    const m = computeSaleMetrics(sale);
    revenue += m.revenue; costs += m.costs; profit += m.profit; totalStorageDays += m.storageDays;
  }

  // IN_STOCK items — include their costs even though not yet sold
  const unsold = await prisma.item.findMany({
    where: { userId, status: 'IN_STOCK' },
    include: { costs: true },
  });
  for (const item of unsold) {
    const c =
      item.purchasePrice.toNumber() +
      item.shippingCostIn.toNumber() +
      item.repairCost.toNumber() +
      item.costs.reduce((s, cc) => s + cc.amount.toNumber(), 0);
    costs += c;
    profit -= c;
  }

  return {
    revenue, costs, profit,
    itemsSold: sales.length,
    avgStorageDays: sales.length > 0 ? Math.round(totalStorageDays / sales.length) : 0,
  };
}

export type SaleLineItem = { id: string; name: string; soldAt: Date; revenue: number; costs: number; profit: number; storageDays: number };

export async function getRangeReport(
  start: Date, end: Date, targetUserId?: string,
): Promise<{ revenue: number; costs: number; profit: number; itemsSold: number }> {
  const userId = await resolveUserId(targetUserId);

  // Revenue + sold-item costs (items sold in this period)
  const sales = await prisma.sale.findMany({
    where: { soldAt: { gte: start, lt: end }, item: { userId } },
    include: SALE_INCLUDE,
  });
  let revenue = 0, costs = 0, profit = 0;
  for (const sale of sales) {
    const m = computeSaleMetrics(sale);
    revenue += m.revenue; costs += m.costs; profit += m.profit;
  }

  // IN_STOCK items purchased in this period — add their costs
  const unsold = await prisma.item.findMany({
    where: { purchasedAt: { gte: start, lt: end }, userId, status: 'IN_STOCK' },
    include: { costs: true },
  });
  for (const item of unsold) {
    const c =
      item.purchasePrice.toNumber() +
      item.shippingCostIn.toNumber() +
      item.repairCost.toNumber() +
      item.costs.reduce((s, cc) => s + cc.amount.toNumber(), 0);
    costs += c;
    profit -= c;
  }

  return { revenue, costs, profit, itemsSold: sales.length };
}

export async function getSaleLineItems(start: Date, end: Date | null, targetUserId?: string): Promise<SaleLineItem[]> {
  const userId = await resolveUserId(targetUserId);
  const sales = await prisma.sale.findMany({
    where: { item: { userId }, soldAt: { gte: start, ...(end ? { lt: end } : {}) } },
    include: SALE_INCLUDE,
    orderBy: { soldAt: 'desc' },
  });
  return sales.map((sale) => { const m = computeSaleMetrics(sale); return { id: sale.item.id, name: sale.item.name, soldAt: sale.soldAt, ...m }; });
}

export async function getAllDailyReports(
  from: Date, to: Date, targetUserId?: string,
): Promise<DailyReport[]> {
  const userId = await resolveUserId(targetUserId);

  // Seed all days in range (inclusive from, exclusive to)
  const buckets = new Map<string, { revenue: number; costs: number; profit: number; itemsSold: number }>();
  const cur = new Date(from);
  while (cur < to) {
    buckets.set(cur.toISOString().split('T')[0], { revenue: 0, costs: 0, profit: 0, itemsSold: 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  // Revenue: items sold in range, bucketed by soldAt
  const sales = await prisma.sale.findMany({
    where: { soldAt: { gte: from, lt: to }, item: { userId } },
    include: SALE_INCLUDE,
  });
  for (const sale of sales) {
    const key = sale.soldAt.toISOString().split('T')[0];
    const b = buckets.get(key);
    if (!b) continue;
    b.revenue   += sale.salePrice.toNumber();
    b.itemsSold += 1;
  }

  // Costs: ALL items purchased in range, bucketed by purchasedAt
  const items = await prisma.item.findMany({
    where:   { purchasedAt: { gte: from, lt: to }, userId },
    include: { costs: true, sale: true },
  });
  for (const item of items) {
    const key = item.purchasedAt.toISOString().split('T')[0];
    const b = buckets.get(key);
    if (!b) continue;
    const c =
      item.purchasePrice.toNumber() +
      item.shippingCostIn.toNumber() +
      item.repairCost.toNumber() +
      item.costs.reduce((s, cc) => s + cc.amount.toNumber(), 0) +
      (item.sale ? item.sale.shippingCostOut.toNumber() : 0);
    b.costs += c;
  }

  return [...buckets.entries()]
    .sort((a, b_) => a[0].localeCompare(b_[0]))
    .map(([date, b]) => ({ date, ...b, profit: b.revenue - b.costs }));
}

export async function getAllMonthlyReports(year: number, targetUserId?: string): Promise<MonthlyReport[]> {
  const userId = await resolveUserId(targetUserId);
  const start = new Date(Date.UTC(year, 0, 1));
  const end   = new Date(Date.UTC(year + 1, 0, 1));

  const buckets: Record<number, MonthlyReport> = {};
  for (let m = 1; m <= 12; m++) buckets[m] = { year, month: m, revenue: 0, costs: 0, profit: 0, itemsSold: 0 };

  // Revenue: items sold this year, bucketed by soldAt
  const sales = await prisma.sale.findMany({
    where: { soldAt: { gte: start, lt: end }, item: { userId } },
    include: SALE_INCLUDE,
  });
  for (const sale of sales) {
    const month = sale.soldAt.getUTCMonth() + 1;
    buckets[month].revenue   += sale.salePrice.toNumber();
    buckets[month].itemsSold += 1;
  }

  // Costs: ALL items purchased this year (sold + in-stock), bucketed by purchasedAt
  const items = await prisma.item.findMany({
    where:   { purchasedAt: { gte: start, lt: end }, userId },
    include: { costs: true, sale: true },
  });
  for (const item of items) {
    const month = item.purchasedAt.getUTCMonth() + 1;
    const c =
      item.purchasePrice.toNumber() +
      item.shippingCostIn.toNumber() +
      item.repairCost.toNumber() +
      item.costs.reduce((s, cc) => s + cc.amount.toNumber(), 0) +
      (item.sale ? item.sale.shippingCostOut.toNumber() : 0);
    buckets[month].costs += c;
  }

  // Profit = Revenue − Costs per month
  for (let m = 1; m <= 12; m++) {
    buckets[m].profit = buckets[m].revenue - buckets[m].costs;
  }

  return Object.values(buckets);
}
