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
};

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

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

  return users.map((u) => {
    const soldItems = u.items.filter((i) => i.status === 'SOLD' && i.sale);
    const totalProfit = soldItems.reduce((sum, item) => {
      const sale = item.sale!;
      return sum + (
        sale.salePrice.toNumber()
        - item.purchasePrice.toNumber()
        - item.shippingCostIn.toNumber()
        - item.repairCost.toNumber()
        - sale.shippingCostOut.toNumber()
        - item.costs.reduce((s, c) => s + c.amount.toNumber(), 0)
      );
    }, 0);

    return {
      id:          u.id,
      email:       u.email,
      displayName: u.displayName,
      itemCount:   u.items.length,
      soldCount:   soldItems.length,
      totalProfit,
    };
  });
}
