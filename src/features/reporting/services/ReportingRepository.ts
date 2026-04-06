'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import type { MonthlyReport, QuarterlyReport, CumulativeReport } from '../types/reporting.types';

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
  const revenue = sale.salePrice.toNumber();
  const costs =
    sale.item.purchasePrice.toNumber() +
    sale.item.shippingCostIn.toNumber() +
    sale.item.repairCost.toNumber() +
    sale.shippingCostOut.toNumber() +
    sale.item.costs.reduce((sum, c) => sum + c.amount.toNumber(), 0);
  const storageDays = Math.floor(
    (sale.soldAt.getTime() - sale.item.purchasedAt.getTime()) / 86_400_000
  );
  return { revenue, costs, profit: revenue - costs, storageDays };
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
  for (const sale of sales) { const m = computeSaleMetrics(sale); revenue += m.revenue; costs += m.costs; profit += m.profit; totalStorageDays += m.storageDays; }
  return { revenue, costs, profit, itemsSold: sales.length, avgStorageDays: sales.length > 0 ? Math.round(totalStorageDays / sales.length) : 0 };
}

export type SaleLineItem = { id: string; name: string; soldAt: Date; revenue: number; costs: number; profit: number; storageDays: number };

export async function getRangeReport(
  start: Date, end: Date, targetUserId?: string,
): Promise<{ revenue: number; costs: number; profit: number; itemsSold: number }> {
  const userId = await resolveUserId(targetUserId);
  const sales = await prisma.sale.findMany({
    where: { soldAt: { gte: start, lt: end }, item: { userId } },
    include: SALE_INCLUDE,
  });
  let revenue = 0, costs = 0, profit = 0;
  for (const sale of sales) {
    const m = computeSaleMetrics(sale);
    revenue += m.revenue; costs += m.costs; profit += m.profit;
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

export async function getAllMonthlyReports(year: number, targetUserId?: string): Promise<MonthlyReport[]> {
  const userId = await resolveUserId(targetUserId);
  const start = new Date(Date.UTC(year, 0, 1));
  const end   = new Date(Date.UTC(year + 1, 0, 1));
  const sales = await prisma.sale.findMany({ where: { soldAt: { gte: start, lt: end }, item: { userId } }, include: SALE_INCLUDE });
  const buckets: Record<number, MonthlyReport> = {};
  for (let m = 1; m <= 12; m++) buckets[m] = { year, month: m, revenue: 0, costs: 0, profit: 0, itemsSold: 0 };
  for (const sale of sales) {
    const month = sale.soldAt.getUTCMonth() + 1;
    const m = computeSaleMetrics(sale);
    buckets[month].revenue += m.revenue; buckets[month].costs += m.costs; buckets[month].profit += m.profit; buckets[month].itemsSold += 1;
  }
  return Object.values(buckets);
}
