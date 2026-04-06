'use server';

// Data access layer — all DB calls for inventory items.
// No UI logic. No business rules. Only Prisma queries.
// Every function resolves the authenticated user's local DB id before querying.

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import type {
  CreateItemInput,
  EditItemInput,
  UpdateItemCostsInput,
  ItemWithCosts,
} from '../types/inventory.types';

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getLocalUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) throw new Error('User record not found');

  return dbUser.id;
}

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
}): ItemWithCosts {
  return {
    ...item,
    purchasePrice:  item.purchasePrice.toNumber(),
    shippingCostIn: item.shippingCostIn.toNumber(),
    repairCost:     item.repairCost.toNumber(),
    status:         item.status as 'IN_STOCK' | 'SOLD',
    costs: item.costs.map(c => ({ ...c, amount: c.amount.toNumber() })),
    sale: item.sale
      ? {
          ...item.sale,
          salePrice:       item.sale.salePrice.toNumber(),
          shippingCostOut: item.sale.shippingCostOut.toNumber(),
        }
      : null,
  };
}

const ITEM_INCLUDE = {
  costs: true,
  sale: true,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

/** US-011 — Fetch all items for the current user, optionally filtered by status. */
export async function getItems(
  filters: { status?: 'IN_STOCK' | 'SOLD' } = {}
): Promise<ItemWithCosts[]> {
  const userId = await getLocalUserId();
  const items = await prisma.item.findMany({
    where: { userId, ...(filters.status ? { status: filters.status } : {}) },
    include: ITEM_INCLUDE,
    orderBy: { purchasedAt: 'desc' },
  });
  return items.map(toPlain);
}

/** US-012 — Fetch a single item. Returns null if not found or not owned by current user. */
export async function getItemById(id: string): Promise<ItemWithCosts | null> {
  const userId = await getLocalUserId();
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: ITEM_INCLUDE,
  });
  return item ? toPlain(item) : null;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/** US-009 — Create a new inventory item. */
export async function createItem(data: CreateItemInput): Promise<ItemWithCosts> {
  const userId = await getLocalUserId();
  const item = await prisma.item.create({
    data: {
      userId,
      name:             data.name,
      description:      data.description,
      purchasePrice:    data.purchasePrice,
      purchasePlatform: data.purchasePlatform,
      purchasedAt:      data.purchasedAt,
      shippingCostIn:   data.shippingCostIn,
      repairCost:       data.repairCost,
    },
    include: ITEM_INCLUDE,
  });
  return toPlain(item);
}

/** US-010 — Update shipping/repair costs and replace additional costs list. */
export async function updateItemCosts(
  id: string,
  data: UpdateItemCostsInput
): Promise<ItemWithCosts> {
  const userId = await getLocalUserId();

  // Ownership check
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Item not found');

  const item = await prisma.item.update({
    where: { id },
    data: {
      shippingCostIn: data.shippingCostIn,
      repairCost:     data.repairCost,
      costs: {
        deleteMany: {},
        create: data.additionalCosts.map(c => ({ label: c.label, amount: c.amount })),
      },
    },
    include: ITEM_INCLUDE,
  });
  return toPlain(item);
}

/** Delete an item owned by the current user, including its sale and costs. */
export async function deleteItem(id: string): Promise<void> {
  const userId = await getLocalUserId();

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
  const userId = await getLocalUserId();

  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) throw new Error('Item not found');
  if (existing.status === 'SOLD') throw new Error('Cannot edit a sold item');

  const item = await prisma.item.update({
    where: { id },
    data: {
      name:             data.name,
      description:      data.description,
      purchasePrice:    data.purchasePrice,
      purchasePlatform: data.purchasePlatform,
      purchasedAt:      data.purchasedAt,
    },
    include: ITEM_INCLUDE,
  });
  return toPlain(item);
}
