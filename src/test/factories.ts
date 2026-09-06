import { prisma } from '@/shared/lib/prisma';
import type { Platform } from '@/generated/prisma';

/**
 * Test data builders. Every field has a sensible default so a test only states the values
 * it actually cares about — the rest is noise that would otherwise be repeated in every
 * test file (each test file previously inlined its own builder).
 */

let seq = 0;
const uniq = () => `${Date.now()}-${++seq}`;

export async function makeUser(overrides: {
  email?: string;
  displayName?: string | null;
  role?: 'USER' | 'ADMIN' | 'MASTER_ADMIN';
  isActive?: boolean;
} = {}) {
  const n = uniq();
  return prisma.user.create({
    data: {
      supabaseId:  overrides.email ? `sb-${overrides.email}` : `sb-${n}`,
      email:       overrides.email ?? `user-${n}@example.test`,
      displayName: overrides.displayName ?? null,
      role:        overrides.role ?? 'USER',
      isActive:    overrides.isActive ?? true,
    },
  });
}

export async function makeInstance(overrides: {
  name?: string;
  createdById: string;
  startsAt?: Date;
  endsAt?: Date;
  isActive?: boolean;
  autoAccept?: boolean;
  inviteLinkAutoAccept?: boolean;
  joinCode?: string | null;
  inviteToken?: string | null;
}) {
  const n = uniq();
  return prisma.olympiadInstance.create({
    data: {
      name:                 overrides.name ?? `Olympiade ${n}`,
      createdById:          overrides.createdById,
      startsAt:             overrides.startsAt ?? new Date('2026-01-01T00:00:00Z'),
      endsAt:               overrides.endsAt   ?? new Date('2026-12-31T23:59:59Z'),
      isActive:             overrides.isActive ?? true,
      autoAccept:           overrides.autoAccept ?? true,
      inviteLinkAutoAccept: overrides.inviteLinkAutoAccept ?? true,
      joinCode:             overrides.joinCode ?? null,
      inviteToken:          overrides.inviteToken ?? null,
    },
  });
}

export async function makeMembership(
  userId: string,
  instanceId: string,
  memberRole: 'MEMBER' | 'ADMIN' = 'MEMBER',
) {
  return prisma.instanceMembership.create({ data: { userId, instanceId, memberRole } });
}

export async function makeItem(overrides: {
  userId: string;
  name?: string;
  purchasePrice?: number;
  shippingCostIn?: number;
  repairCost?: number;
  purchasedAt?: Date;
  purchasePlatform?: Platform;
  status?: 'IN_STOCK' | 'RESERVED' | 'SOLD';
  isQuickSell?: boolean;
  additionalCosts?: { label: string; amount: number }[];
}) {
  const n = uniq();
  return prisma.item.create({
    data: {
      userId:           overrides.userId,
      name:             overrides.name ?? `Item ${n}`,
      purchasePrice:    overrides.purchasePrice  ?? 10,
      shippingCostIn:   overrides.shippingCostIn ?? 0,
      repairCost:       overrides.repairCost     ?? 0,
      purchasedAt:      overrides.purchasedAt    ?? new Date('2026-02-01T00:00:00Z'),
      purchasePlatform: overrides.purchasePlatform ?? 'KLEINANZEIGEN',
      status:           overrides.status ?? 'IN_STOCK',
      isQuickSell:      overrides.isQuickSell ?? false,
      costs: overrides.additionalCosts
        ? { create: overrides.additionalCosts }
        : undefined,
    },
    include: { costs: true },
  });
}

export async function makeSale(overrides: {
  itemId: string;
  salePrice?: number;
  shippingCostOut?: number;
  soldAt?: Date;
  salePlatform?: Platform;
}) {
  return prisma.sale.create({
    data: {
      itemId:          overrides.itemId,
      salePrice:       overrides.salePrice       ?? 20,
      shippingCostOut: overrides.shippingCostOut ?? 0,
      soldAt:          overrides.soldAt          ?? new Date('2026-03-01T00:00:00Z'),
      salePlatform:    overrides.salePlatform    ?? 'KLEINANZEIGEN',
    },
  });
}

/** An item that has been sold — the shape most profit/leaderboard tests need. */
export async function makeSoldItem(overrides: {
  userId: string;
  purchasePrice?: number;
  shippingCostIn?: number;
  repairCost?: number;
  additionalCosts?: { label: string; amount: number }[];
  salePrice?: number;
  shippingCostOut?: number;
  soldAt?: Date;
  purchasedAt?: Date;
  isQuickSell?: boolean;
}) {
  const item = await makeItem({ ...overrides, status: 'SOLD' });
  await makeSale({
    itemId:          item.id,
    salePrice:       overrides.salePrice,
    shippingCostOut: overrides.shippingCostOut,
    soldAt:          overrides.soldAt,
  });
  return item;
}
