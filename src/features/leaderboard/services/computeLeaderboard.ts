import { prisma } from '@/shared/lib/prisma';
import { computeProfit } from '@/shared/lib/calculations';
import type { LeaderboardEntry } from '@/features/admin/services/getLeaderboard';

/** Returns the most recent Sunday at 00:00 UTC */
export function lastSundayMidnightUTC(): Date {
  const now       = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysBack  = dayOfWeek === 0 ? 7 : dayOfWeek;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack));
}

/** Returns this week's Sunday (start of current week) at 00:00 UTC */
export function thisSundayMidnightUTC(): Date {
  const now       = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysBack  = dayOfWeek === 0 ? 0 : dayOfWeek;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack));
}

/**
 * Computes the ranked leaderboard for a given instance without any auth guard.
 * Used by the cron job and admin preview.
 */
export async function computeLeaderboardForInstance(
  instanceId: string,
): Promise<{ entries: LeaderboardEntry[]; instanceName: string }> {
  const instance = await prisma.olympiadInstance.findUnique({
    where:  { id: instanceId },
    select: { name: true, startsAt: true, endsAt: true },
  });
  if (!instance) throw new Error(`Instance ${instanceId} not found`);
  const { startsAt, endsAt } = instance;

  const snapshot = lastSundayMidnightUTC();

  const users = await prisma.user.findMany({
    where:   { isActive: true, memberships: { some: { instanceId } } },
    orderBy: { email: 'asc' },
    select: {
      id:          true,
      email:       true,
      displayName: true,
      items: {
        where: {
          OR: [
            { purchasedAt: { gte: startsAt, lte: endsAt } },
            { sale: { soldAt: { gte: startsAt, lte: endsAt } } },
          ],
        },
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
    return date >= startsAt && date <= endsAt;
  }

  const computed = users.map((u) => {
    const windowItems    = u.items.filter((i) => inWindow(i.purchasedAt));
    const soldItems      = u.items.filter((i) => i.status === 'SOLD' && i.sale && inWindow(i.sale.soldAt));
    const totalProfit    = soldItems.reduce((s, i) => s + computeProfit({ ...i.sale!, item: i }), 0);
    const snapshotItems  = soldItems.filter((i) => i.sale!.soldAt < snapshot);
    const snapshotProfit = snapshotItems.reduce((s, i) => s + computeProfit({ ...i.sale!, item: i }), 0);
    return {
      id: u.id, email: u.email, displayName: u.displayName,
      itemCount: windowItems.length, soldCount: soldItems.length,
      totalProfit, snapshotProfit,
      topBadges: u.userBadges.slice(0, 3).map((ub) => ({ slug: ub.badge.slug, tier: ub.badge.tier })),
    };
  });

  const currentRanked  = [...computed].sort((a, b) => b.totalProfit    - a.totalProfit);
  const snapshotRanked = [...computed].sort((a, b) => b.snapshotProfit - a.snapshotProfit);
  const currentRankOf  = new Map(currentRanked .map((e, i) => [e.id, i + 1]));
  const snapshotRankOf = new Map(snapshotRanked.map((e, i) => [e.id, i + 1]));

  const entries: LeaderboardEntry[] = currentRanked.map((e) => ({
    id:          e.id,
    email:       e.email,
    displayName: e.displayName,
    itemCount:   e.itemCount,
    soldCount:   e.soldCount,
    totalProfit: e.totalProfit,
    rankChange:  (snapshotRankOf.get(e.id) ?? 0) - (currentRankOf.get(e.id) ?? 0),
    topBadges:   e.topBadges,
  }));

  return { entries, instanceName: instance.name };
}
