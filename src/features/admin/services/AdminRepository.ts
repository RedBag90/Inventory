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

// ─── Instance requests ────────────────────────────────────────────────────────

export type InstanceRequestRecord = {
  id:           string;
  userId:       string;
  userEmail:    string;
  instanceName: string;
  description:  string | null;
  status:       'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt:    Date;
};

/** Returns instance requests. Only MASTER_ADMIN may access. */
export async function getInstanceRequests(statusFilter: 'PENDING' | 'ALL' = 'PENDING'): Promise<InstanceRequestRecord[]> {
  await requireMasterAdmin();

  const where: Record<string, unknown> = {};
  if (statusFilter === 'PENDING') where.status = 'PENDING';

  const requests = await prisma.instanceRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  });

  return requests.map(r => ({
    id:           r.id,
    userId:       r.userId,
    userEmail:    r.user.email,
    instanceName: r.instanceName,
    description:  r.description,
    status:       r.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    createdAt:    r.createdAt,
  }));
}

export async function getPendingInstanceRequestCount(): Promise<number> {
  const caller = await getCallerDbUser();
  if (caller.role !== 'MASTER_ADMIN') return 0;
  return prisma.instanceRequest.count({ where: { status: 'PENDING' } });
}

export async function resolveInstanceRequest(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
): Promise<void> {
  const caller = await requireMasterAdmin();

  const request = await prisma.instanceRequest.findUnique({
    where:   { id: requestId },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!request) throw new Error('Request not found');
  if (request.status !== 'PENDING') throw new Error('Request already resolved');

  await prisma.instanceRequest.update({
    where: { id: requestId },
    data:  { status: decision, resolvedAt: new Date(), resolvedById: caller.id },
  });

  if (decision === 'APPROVED') {
    // Create the OlympiadInstance and add user as ADMIN member
    const now = new Date();
    const instance = await prisma.olympiadInstance.create({
      data: {
        name:        request.instanceName,
        description: request.description ?? undefined,
        startsAt:    now,
        endsAt:      new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        createdById: request.userId,
      },
    });
    await prisma.instanceMembership.create({
      data: { userId: request.userId, instanceId: instance.id, memberRole: 'ADMIN' },
    });

    sendMail({
      to:      request.user.email,
      subject: `Deine Instanz „${request.instanceName}" wurde genehmigt`,
      html: `
        <p>Hallo,</p>
        <p>Deine Anfrage für die Instanz <strong>${request.instanceName}</strong> wurde <strong>genehmigt</strong>. 🎉</p>
        <p>Du kannst dich jetzt einloggen und deine Instanz verwalten.</p>
      `,
      text: `Deine Instanz „${request.instanceName}" wurde genehmigt. Du kannst dich jetzt einloggen.`,
    }).catch(err => console.error('[mailer] instance approval email failed:', err));
  } else {
    sendMail({
      to:      request.user.email,
      subject: `Instanz-Anfrage „${request.instanceName}" abgelehnt`,
      html: `
        <p>Hallo,</p>
        <p>Deine Anfrage für die Instanz <strong>${request.instanceName}</strong> wurde leider <strong>abgelehnt</strong>.</p>
      `,
      text: `Deine Anfrage für Instanz „${request.instanceName}" wurde abgelehnt.`,
    }).catch(err => console.error('[mailer] instance rejection email failed:', err));
  }
}
