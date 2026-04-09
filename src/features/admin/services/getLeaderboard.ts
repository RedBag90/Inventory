'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

export type LeaderboardEntry = {
  id:          string;
  email:       string;
  displayName: string | null;
  itemCount:   number;
  soldCount:   number;
  totalProfit: number;
  /** Positions gained (+) or lost (−) vs last Sunday midnight. 0 = unchanged. */
  rankChange:  number;
};

export type LeaderboardResult = {
  entries:      LeaderboardEntry[];
  instanceName: string | null;
  startsAt:     Date | null;
  endsAt:       Date | null;
};

/** Returns the most recent Sunday at 00:00 UTC */
function lastSundayMidnightUTC(): Date {
  const now       = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysBack  = dayOfWeek === 0 ? 7 : dayOfWeek;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack));
}

export async function getLeaderboard(instanceIdOverride?: string): Promise<LeaderboardResult> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Unauthenticated');

  const caller = await prisma.user.findUnique({
    where:  { supabaseId: authUser.id },
    select: {
      id:   true,
      role: true,
      membership: {
        select: {
          instance: { select: { id: true, name: true, startsAt: true, endsAt: true } },
        },
      },
    },
  });
  if (!caller) throw new Error('User not found');

  const isAdmin = caller.role === 'ADMIN';

  // Resolve which instance to show
  let instance: { id: string; name: string; startsAt: Date; endsAt: Date } | null = null;

  if (instanceIdOverride && isAdmin) {
    instance = await prisma.olympiadInstance.findUnique({
      where:  { id: instanceIdOverride },
      select: { id: true, name: true, startsAt: true, endsAt: true },
    });
  } else if (caller.membership?.instance) {
    instance = caller.membership.instance;
  }
  // Admin with no membership and no override → show all users (legacy behaviour)

  const snapshot = lastSundayMidnightUTC();

  // Build user filter: instance members only (or all if admin with no instance)
  const userWhere = instance
    ? { isActive: true, membership: { instanceId: instance.id } }
    : { isActive: true };

  const users = await prisma.user.findMany({
    where:   userWhere,
    orderBy: { email: 'asc' },
    include: {
      items: {
        include: { costs: true, sale: true },
      },
    },
  });

  // Restrict items/sales to instance time window if applicable
  const winStart = instance?.startsAt ?? null;
  const winEnd   = instance?.endsAt   ?? null;

  function inWindow(date: Date): boolean {
    if (!winStart || !winEnd) return true;
    return date >= winStart && date <= winEnd;
  }

  const computed = users.map((u) => {
    // Items purchased within the window (for itemCount)
    const windowItems = u.items.filter((i) => inWindow(i.purchasedAt));

    // Sold items with sale within window
    const soldItems = u.items.filter(
      (i) => i.status === 'SOLD' && i.sale && inWindow(i.sale.soldAt),
    );

    function profitOf(item: typeof soldItems[0]): number {
      const sale = item.sale!;
      return (
        sale.salePrice.toNumber()
        - item.purchasePrice.toNumber()
        - item.shippingCostIn.toNumber()
        - item.repairCost.toNumber()
        - sale.shippingCostOut.toNumber()
        - item.costs.reduce((s, c) => s + c.amount.toNumber(), 0)
      );
    }

    const totalProfit    = soldItems.reduce((s, i) => s + profitOf(i), 0);
    const snapshotItems  = soldItems.filter((i) => i.sale!.soldAt < snapshot);
    const snapshotProfit = snapshotItems.reduce((s, i) => s + profitOf(i), 0);

    return {
      id:             u.id,
      email:          u.email,
      displayName:    u.displayName,
      itemCount:      windowItems.length,
      soldCount:      soldItems.length,
      totalProfit,
      snapshotProfit,
    };
  });

  const currentRanked  = [...computed].sort((a, b) => b.totalProfit    - a.totalProfit);
  const snapshotRanked = [...computed].sort((a, b) => b.snapshotProfit - a.snapshotProfit);

  const currentRankOf  = new Map(currentRanked .map((e, i) => [e.id, i + 1]));
  const snapshotRankOf = new Map(snapshotRanked.map((e, i) => [e.id, i + 1]));

  const entries = currentRanked.map((e) => ({
    id:          e.id,
    email:       e.email,
    displayName: e.displayName,
    itemCount:   e.itemCount,
    soldCount:   e.soldCount,
    totalProfit: e.totalProfit,
    rankChange:  (snapshotRankOf.get(e.id) ?? 0) - (currentRankOf.get(e.id) ?? 0),
  }));

  return {
    entries,
    instanceName: instance?.name   ?? null,
    startsAt:     instance?.startsAt ?? null,
    endsAt:       instance?.endsAt   ?? null,
  };
}
