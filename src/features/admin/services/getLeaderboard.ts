'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { computeProfit } from '@/shared/lib/calculations';
import { getBadgeXP } from '@/features/badges/lib/xpSystem';

export type LeaderboardBadge = {
  slug: string;
  tier: string;
};

export type LeaderboardEntry = {
  id:          string;
  email:       string;
  displayName: string | null;
  itemCount:   number;
  soldCount:   number;
  totalProfit: number;
  badgeXP:     number;
  /** Positions gained (+) or lost (−) vs last Sunday midnight. 0 = unchanged. */
  rankChange:  number;
  topBadges:   LeaderboardBadge[];
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
      memberships: {
        orderBy: { joinedAt: 'desc' },
        select: {
          instance: { select: { id: true, name: true, startsAt: true, endsAt: true, isActive: true } },
        },
      },
    },
  });
  if (!caller) throw new Error('User not found');

  const isMasterAdmin = caller.role === 'MASTER_ADMIN';

  // Resolve which instance to show
  let instance: { id: string; name: string; startsAt: Date; endsAt: Date } | null = null;

  if (instanceIdOverride) {
    if (isMasterAdmin) {
      // MASTER_ADMIN may view any instance
      instance = await prisma.olympiadInstance.findUnique({
        where:  { id: instanceIdOverride },
        select: { id: true, name: true, startsAt: true, endsAt: true },
      });
    } else {
      // Regular users / admins may only view instances they belong to
      const membership = caller.memberships.find(m => m.instance.id === instanceIdOverride);
      instance = membership?.instance ?? null;
    }
  } else if (caller.memberships.length > 0) {
    // Default: most recently joined active instance, else most recently joined overall
    const active = caller.memberships.find(m => m.instance.isActive) ?? caller.memberships[0];
    instance = active.instance;
  }
  // Admin with no membership and no override → show all users (legacy behaviour)

  const snapshot = lastSundayMidnightUTC();

  // Build user filter: instance members only (or all if admin with no instance)
  const userWhere = instance
    ? { isActive: true, memberships: { some: { instanceId: instance.id } } }
    : { isActive: true };

  const winStart = instance?.startsAt ?? null;
  const winEnd   = instance?.endsAt   ?? null;

  const users = await prisma.user.findMany({
    where:   userWhere,
    orderBy: { email: 'asc' },
    select: {
      id:          true,
      email:       true,
      displayName: true,
      items: {
        where: (winStart && winEnd) ? {
          OR: [
            { purchasedAt: { gte: winStart, lte: winEnd } },
            { sale: { soldAt: { gte: winStart, lte: winEnd } } },
          ],
        } : undefined,
        select: {
          purchasePrice: true, shippingCostIn: true, repairCost: true,
          purchasedAt:   true, status:         true,
          costs: { select: { amount: true } },
          sale:  { select: { salePrice: true, shippingCostOut: true, soldAt: true } },
        },
      },
      userBadges: {
        include: { badge: { select: { slug: true, tier: true, sortOrder: true } } },
        orderBy: [{ badge: { sortOrder: 'desc' } }],
      },
    },
  });

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

    const totalProfit    = soldItems.reduce((s, i) => s + computeProfit({ ...i.sale!, item: i }), 0);
    const snapshotItems  = soldItems.filter((i) => i.sale!.soldAt < snapshot);
    const snapshotProfit = snapshotItems.reduce((s, i) => s + computeProfit({ ...i.sale!, item: i }), 0);

    const badgeXP = u.userBadges.reduce((sum, ub) => sum + getBadgeXP(ub.badge.tier as Parameters<typeof getBadgeXP>[0]), 0);

    return {
      id:             u.id,
      email:          u.email,
      displayName:    u.displayName,
      itemCount:      windowItems.length,
      soldCount:      soldItems.length,
      totalProfit,
      badgeXP,
      snapshotProfit,
      topBadges: u.userBadges.slice(0, 3).map((ub) => ({ slug: ub.badge.slug, tier: ub.badge.tier })),
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
    badgeXP:     e.badgeXP,
    rankChange:  (snapshotRankOf.get(e.id) ?? 0) - (currentRankOf.get(e.id) ?? 0),
    topBadges:   e.topBadges,
  }));

  return {
    entries,
    instanceName: instance?.name   ?? null,
    startsAt:     instance?.startsAt ?? null,
    endsAt:       instance?.endsAt   ?? null,
  };
}
