'use server';

// Admin data layer — user management operations.
// requireAdmin: ADMIN or MASTER_ADMIN
// requireMasterAdmin: MASTER_ADMIN only

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { sendMail } from '@/shared/lib/mailer';
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

// ─── Join requests ────────────────────────────────────────────────────────────

export type JoinRequestRecord = {
  id:           string;
  userId:       string;
  userEmail:    string;
  instanceId:   string;
  instanceName: string;
  status:       'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt:    Date;
};

/**
 * Returns join requests visible to the caller:
 * - ADMIN: only requests for their own olympiads
 * - MASTER_ADMIN: all requests
 */
export async function getJoinRequests(statusFilter: 'PENDING' | 'ALL' = 'PENDING'): Promise<JoinRequestRecord[]> {
  const caller = await getCallerDbUser();
  if (caller.role !== 'ADMIN' && caller.role !== 'MASTER_ADMIN') throw new Error('Forbidden');

  const where: Record<string, unknown> = {};
  if (statusFilter === 'PENDING') where.status = 'PENDING';
  if (caller.role === 'ADMIN') {
    where.instance = { createdById: caller.id };
  }

  const requests = await prisma.joinRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user:     { select: { email: true } },
      instance: { select: { name: true } },
    },
  });

  return requests.map(r => ({
    id:           r.id,
    userId:       r.userId,
    userEmail:    r.user.email,
    instanceId:   r.instanceId,
    instanceName: r.instance.name,
    status:       r.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
    createdAt:    r.createdAt,
  }));
}

export async function getPendingJoinRequestCount(): Promise<number> {
  const caller = await getCallerDbUser();
  if (caller.role !== 'ADMIN' && caller.role !== 'MASTER_ADMIN') return 0;

  const where: Record<string, unknown> = { status: 'PENDING' };
  if (caller.role === 'ADMIN') where.instance = { createdById: caller.id };

  return prisma.joinRequest.count({ where });
}

export async function resolveJoinRequest(
  requestId: string,
  decision: 'ACCEPTED' | 'REJECTED',
): Promise<void> {
  const caller = await getCallerDbUser();
  if (caller.role !== 'ADMIN' && caller.role !== 'MASTER_ADMIN') throw new Error('Forbidden');

  const request = await prisma.joinRequest.findUnique({
    where:   { id: requestId },
    include: {
      instance: { select: { createdById: true, name: true } },
      user:     { select: { email: true } },
    },
  });
  if (!request) throw new Error('Request not found');
  if (caller.role === 'ADMIN' && request.instance.createdById !== caller.id) throw new Error('Forbidden');

  await prisma.joinRequest.update({
    where: { id: requestId },
    data:  { status: decision, resolvedAt: new Date(), resolvedById: caller.id },
  });

  // Notify the user of the decision (fire-and-forget)
  if (decision === 'ACCEPTED') {
    sendMail({
      to:      request.user.email,
      subject: `Du wurdest zu „${request.instance.name}" zugelassen`,
      html: `
        <p>Hallo,</p>
        <p>Deine Beitrittsanfrage für <strong>${request.instance.name}</strong> wurde <strong>akzeptiert</strong>. 🎉</p>
        <p>Du kannst dich jetzt einloggen und loslegen.</p>
      `,
      text: `Deine Anfrage für „${request.instance.name}" wurde akzeptiert. Du kannst dich jetzt einloggen.`,
    }).catch(err => console.error('[mailer] Failed to send acceptance email:', err));
  } else {
    sendMail({
      to:      request.user.email,
      subject: `Beitrittsanfrage für „${request.instance.name}" abgelehnt`,
      html: `
        <p>Hallo,</p>
        <p>Deine Beitrittsanfrage für <strong>${request.instance.name}</strong> wurde leider <strong>abgelehnt</strong>.</p>
        <p>Du kannst mit einem anderen Code eine neue Anfrage stellen.</p>
      `,
      text: `Deine Anfrage für „${request.instance.name}" wurde abgelehnt.`,
    }).catch(err => console.error('[mailer] Failed to send rejection email:', err));
  }

  if (decision === 'ACCEPTED') {
    await prisma.instanceMembership.upsert({
      where:  { userId_instanceId: { userId: request.userId, instanceId: request.instanceId } },
      update: { joinedAt: new Date() },
      create: { userId: request.userId, instanceId: request.instanceId },
    });
  }
}
