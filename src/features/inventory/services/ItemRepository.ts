'use server';

// Data access layer — all DB calls for inventory items.
// No UI logic. No business rules. Only Prisma queries.
// Every function resolves the authenticated user's local DB id before querying.

import { prisma } from '@/shared/lib/prisma';
import { getCurrentUserId } from '@/shared/lib/auth/getCurrentUserId';
import { checkAndAwardBadges } from '@/features/badges/services/BadgeAwardService';
import {
  CreateItemSchema,
  EditItemSchema,
  UpdateItemCostsSchema,
} from '../types/inventory.types';
import type {
  CreateItemInput,
  EditItemInput,
  UpdateItemCostsInput,
  ItemWithCosts,
} from '../types/inventory.types';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

// ─── Prisma → plain object ────────────────────────────────────────────────────
// Prisma returns Decimal objects; we convert to number so the client can use them.

function toPlain(item: {
  id: string;
  name: string;
  description: string | null;
  purchasePrice: { toNumber(): number };
  purchasePlatform: string;
  purchasedAt: Date;
  shippingCostIn: { toNumber(): number };
  repairCost: { toNumber(): number };
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  costs: Array<{ id: string; label: string; amount: { toNumber(): number }; itemId: string }>;
  sale: {
    id: string;
    salePrice: { toNumber(): number };
    salePlatform: string;
    shippingCostOut: { toNumber(): number };
    soldAt: Date;
  } | null;
  pendingSale: {
    id: string;
    salePrice: { toNumber(): number };
    salePlatform: string;
    shippingCostOut: { toNumber(): number };
    soldAt: Date;
  } | null;
}): ItemWithCosts {
  return {
    ...item,
    purchasePrice:  item.purchasePrice.toNumber(),
    shippingCostIn: item.shippingCostIn.toNumber(),
    repairCost:     item.repairCost.toNumber(),
    status:         item.status as 'IN_STOCK' | 'RESERVED' | 'SOLD',
    costs: item.costs.map(c => ({ ...c, amount: c.amount.toNumber() })),
    sale: item.sale
      ? {
          ...item.sale,
          salePrice:       item.sale.salePrice.toNumber(),
          shippingCostOut: item.sale.shippingCostOut.toNumber(),
        }
      : null,
    pendingSale: item.pendingSale
      ? {
          ...item.pendingSale,
          salePrice:       item.pendingSale.salePrice.toNumber(),
          shippingCostOut: item.pendingSale.shippingCostOut.toNumber(),
        }
      : null,
  };
}

const ITEM_INCLUDE = {
  costs:       true,
  sale:        true,
  pendingSale: true,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

/** US-011 — Fetch all items for the current user, optionally filtered by status. */
export async function getItems(
  filters: { status?: 'IN_STOCK' | 'SOLD' } = {}
): Promise<ItemWithCosts[]> {
  const userId = await getCurrentUserId();
  const items = await prisma.item.findMany({
    where: { userId, ...(filters.status ? { status: filters.status } : {}) },
    include: ITEM_INCLUDE,
    orderBy: { purchasedAt: 'desc' },
  });
  return items.map(toPlain);
}

/** US-012 — Fetch a single item. Returns null if not found or not owned by current user. */
export async function getItemById(id: string): Promise<ItemWithCosts | null> {
  const userId = await getCurrentUserId();
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: ITEM_INCLUDE,
  });
  return item ? toPlain(item) : null;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** US-009 — Create a new inventory item. */
export async function createItem(data: CreateItemInput): Promise<{ item: ItemWithCosts; newBadges: AwardedBadge[] }> {
  const parsed = CreateItemSchema.parse(data);
  const userId = await getCurrentUserId();
  const raw = await prisma.item.create({
    data: {
      userId,
      name:             parsed.name,
      description:      parsed.description,
      purchasePrice:    parsed.purchasePrice,
      purchasePlatform: parsed.purchasePlatform,
      purchasedAt:      parsed.purchasedAt,
      shippingCostIn:   parsed.shippingCostIn,
      repairCost:       parsed.repairCost,
    },
    include: ITEM_INCLUDE,
  });
  const newBadges = await checkAndAwardBadges({ type: 'item_created', userId });
  return { item: toPlain(raw), newBadges };
}

/** US-010 — Update shipping/repair costs and replace additional costs list. */
export async function updateItemCosts(
  id: string,
  data: UpdateItemCostsInput
): Promise<ItemWithCosts> {
  const parsed = UpdateItemCostsSchema.parse(data);
  const userId = await getCurrentUserId();

  // Ownership check
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Item not found');

  const item = await prisma.item.update({
    where: { id },
    data: {
      shippingCostIn: parsed.shippingCostIn,
      repairCost:     parsed.repairCost,
      costs: {
        deleteMany: {},
        create: parsed.additionalCosts.map(c => ({ label: c.label, amount: c.amount })),
      },
    },
    include: ITEM_INCLUDE,
  });
  return toPlain(item);
}

/** Delete an item owned by the current user, including its sale and costs. */
export async function deleteItem(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Item not found');

  await prisma.$transaction([
    prisma.additionalCost.deleteMany({ where: { itemId: id } }),
    prisma.sale.deleteMany({ where: { itemId: id } }),
    prisma.item.delete({ where: { id } }),
  ]);
}

/** US-030 — Update item metadata fields only (not costs, not status). */
export async function updateItemMetadata(
  id: string,
  data: EditItemInput
): Promise<ItemWithCosts> {
  const parsed = EditItemSchema.parse(data);
  const userId = await getCurrentUserId();

  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Item not found');
  if (existing.status === 'SOLD') throw new Error('Cannot edit a sold item');

  const item = await prisma.item.update({
    where: { id },
    data: {
      name:             parsed.name,
      description:      parsed.description,
      purchasePrice:    parsed.purchasePrice,
      purchasePlatform: parsed.purchasePlatform,
      purchasedAt:      parsed.purchasedAt,
    },
    include: ITEM_INCLUDE,
  });
  return toPlain(item);
}
