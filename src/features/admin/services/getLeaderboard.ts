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

/** Returns the most recent Sunday at 00:00 UTC */
function lastSundayMidnightUTC(): Date {
  const now        = new Date();
  const dayOfWeek  = now.getUTCDay(); // 0 = Sun
  const daysBack   = dayOfWeek === 0 ? 7 : dayOfWeek;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack));
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const snapshot = lastSundayMidnightUTC();

  const users = await prisma.user.findMany({
    where:   { isActive: true },
    orderBy: { email: 'asc' },
    include: {
      items: {
        include: {
          costs: true,
          sale:  true,
        },
      },
    },
  });

  // ── Compute profits (current + snapshot) for each user ──────────────
  const computed = users.map((u) => {
    const soldItems = u.items.filter((i) => i.status === 'SOLD' && i.sale);

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
      itemCount:      u.items.length,
      soldCount:      soldItems.length,
      totalProfit,
      snapshotProfit,
    };
  });

  // ── Build rank maps ──────────────────────────────────────────────────
  const currentRanked  = [...computed].sort((a, b) => b.totalProfit    - a.totalProfit);
  const snapshotRanked = [...computed].sort((a, b) => b.snapshotProfit - a.snapshotProfit);

  const currentRankOf  = new Map(currentRanked .map((e, i) => [e.id, i + 1]));
  const snapshotRankOf = new Map(snapshotRanked.map((e, i) => [e.id, i + 1]));

  // ── Return sorted by current rank ────────────────────────────────────
  return currentRanked.map((e) => {
    const cur  = currentRankOf.get(e.id)!;
    const prev = snapshotRankOf.get(e.id)!;
    // rankChange > 0 = moved up, < 0 = moved down, 0 = no change
    const rankChange = prev - cur;

    return {
      id:          e.id,
      email:       e.email,
      displayName: e.displayName,
      itemCount:   e.itemCount,
      soldCount:   e.soldCount,
      totalProfit: e.totalProfit,
      rankChange,
    };
  });
}
