'use server';

// Admin data layer — user management operations.
// requireAdmin: ADMIN or MASTER_ADMIN
// requireMasterAdmin: MASTER_ADMIN only

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import type { AdminUserRecord, UserRole } from '../types/admin.types';

// ─── Auth + role guards ───────────────────────────────────────────────────────

async function getCallerDbUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, role: true },
  });
  if (!dbUser) throw new Error('Unauthenticated');
  return dbUser;
}

/** Allows ADMIN and MASTER_ADMIN. */
async function requireAdmin(): Promise<void> {
  const caller = await getCallerDbUser();
  if (caller.role !== 'ADMIN' && caller.role !== 'MASTER_ADMIN') throw new Error('Forbidden');
}

/** Allows MASTER_ADMIN only. */
async function requireMasterAdmin(): Promise<{ id: string }> {
  const caller = await getCallerDbUser();
  if (caller.role !== 'MASTER_ADMIN') throw new Error('Forbidden');
  return caller;
}

// ─── Profit helper ────────────────────────────────────────────────────────────

function computeProfit(sale: {
  salePrice:       { toNumber(): number };
  shippingCostOut: { toNumber(): number };
  item: {
    purchasePrice:  { toNumber(): number };
    shippingCostIn: { toNumber(): number };
    repairCost:     { toNumber(): number };
    costs:          Array<{ amount: { toNumber(): number } }>;
  };
}): number {
  return (
    sale.salePrice.toNumber()
    - sale.item.purchasePrice.toNumber()
    - sale.item.shippingCostIn.toNumber()
    - sale.item.repairCost.toNumber()
    - sale.shippingCostOut.toNumber()
    - sale.item.costs.reduce((s, c) => s + c.amount.toNumber(), 0)
  );
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Returns all registered users with per-user stats. ADMIN sees own-olympiad members; MASTER_ADMIN sees all. */
export async function getAllUsers(): Promise<AdminUserRecord[]> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          sale: { include: { item: { include: { costs: true } } } },
        },
      },
    },
  });

  return users.map((u) => {
    const soldItems = u.items.filter((i) => i.status === 'SOLD' && i.sale);
    const totalProfit = soldItems.reduce((sum, item) => {
      if (!item.sale) return sum;
      return sum + computeProfit(item.sale as Parameters<typeof computeProfit>[0]);
    }, 0);

    return {
      id:          u.id,
      email:       u.email,
      role:        u.role as UserRole,
      isActive:    u.isActive,
      createdAt:   u.createdAt,
      itemCount:   u.items.length,
      soldCount:   soldItems.length,
      totalProfit,
    };
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Set a user's role. Only MASTER_ADMIN may promote/demote to/from ADMIN. */
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const caller = await requireMasterAdmin();
  if (caller.id === userId) throw new Error('Cannot change your own role');
  await prisma.user.update({ where: { id: userId }, data: { role } });
}

/** Activate or deactivate a user account. Only MASTER_ADMIN may do this. */
export async function setUserActive(userId: string, isActive: boolean): Promise<void> {
  const caller = await requireMasterAdmin();
  if (caller.id === userId) throw new Error('Cannot deactivate your own account');
  await prisma.user.update({ where: { id: userId }, data: { isActive } });
}
