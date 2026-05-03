'use server';

// Admin data layer — user management operations.
// requireAdmin: ADMIN or MASTER_ADMIN
// requireMasterAdmin: MASTER_ADMIN only

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { sendMail } from '@/shared/lib/mailer';
import { ROLES } from '@/shared/types/auth';
import { computeProfit } from '@/shared/lib/calculations';
import type { AdminUserRecord, UserRole } from '../types/admin.types';

// ─── Auth + role guards ───────────────────────────────────────────────────────

type CallerCtx = { id: string; role: string; adminInstanceIds: string[] };

async function getCallerCtx(): Promise<CallerCtx> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: {
      id:          true,
      role:        true,
      memberships: { where: { memberRole: 'ADMIN' }, select: { instanceId: true } },
    },
  });
  if (!dbUser) throw new Error('Unauthenticated');
  return {
    id:               dbUser.id,
    role:             dbUser.role,
    adminInstanceIds: dbUser.memberships.map(m => m.instanceId),
  };
}

/** Allows ADMIN, MASTER_ADMIN, or any user with instanceMembership.memberRole === 'ADMIN'. */
async function requireAnyAdmin(): Promise<CallerCtx> {
  const ctx = await getCallerCtx();
  if (ctx.role !== ROLES.ADMIN && ctx.role !== ROLES.MASTER_ADMIN && ctx.adminInstanceIds.length === 0)
    throw new Error('Forbidden');
  return ctx;
}

/** Allows MASTER_ADMIN only. */
async function requireMasterAdmin(): Promise<CallerCtx> {
  const ctx = await getCallerCtx();
  if (ctx.role !== ROLES.MASTER_ADMIN) throw new Error('Forbidden');
  return ctx;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Returns registered users with per-user stats. MASTER_ADMIN sees all; instance admins see only their instance's members. */
export async function getAllUsers(): Promise<AdminUserRecord[]> {
  const ctx = await requireAnyAdmin();

  let userIdFilter: string[] | undefined;
  if (ctx.role !== 'MASTER_ADMIN') {
    const memberships = await prisma.instanceMembership.findMany({
      where:  { instanceId: { in: ctx.adminInstanceIds } },
      select: { userId: true },
    });
    userIdFilter = [...new Set(memberships.map(m => m.userId))];
  }

  const users = await prisma.user.findMany({
    where:   userIdFilter ? { id: { in: userIdFilter } } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { costs: true, sale: true },
      },
    },
  });

  return users.map((u) => {
    const soldItems = u.items.filter((i) => i.status === 'SOLD' && i.sale);
    const totalProfit = soldItems.reduce((sum, item) => {
      if (!item.sale) return sum;
      return sum + computeProfit({ ...item.sale, item });
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
 * - MASTER_ADMIN: all requests
 * - global ADMIN: requests for olympiads they created
 * - instance admin: requests for their own instance(s)
 */
export async function getJoinRequests(statusFilter: 'PENDING' | 'ALL' = 'PENDING'): Promise<JoinRequestRecord[]> {
  const ctx = await requireAnyAdmin();

  const where: Record<string, unknown> = {};
  if (statusFilter === 'PENDING') where.status = 'PENDING';
  if (ctx.role === ROLES.MASTER_ADMIN) {
    // no extra filter
  } else if (ctx.adminInstanceIds.length > 0) {
    where.instanceId = { in: ctx.adminInstanceIds };
  } else {
    where.instance = { createdById: ctx.id };
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
  const ctx = await getCallerCtx();
  const isGlobalAdmin   = ctx.role === ROLES.ADMIN || ctx.role === ROLES.MASTER_ADMIN;
  const isInstanceAdmin = ctx.adminInstanceIds.length > 0;
  if (!isGlobalAdmin && !isInstanceAdmin) return 0;

  const where: Record<string, unknown> = { status: 'PENDING' };
  if (ctx.role === ROLES.MASTER_ADMIN) {
    // no extra filter
  } else if (isInstanceAdmin) {
    where.instanceId = { in: ctx.adminInstanceIds };
  } else {
    where.instance = { createdById: ctx.id };
  }

  return prisma.joinRequest.count({ where });
}

export async function resolveJoinRequest(
  requestId: string,
  decision: 'ACCEPTED' | 'REJECTED',
): Promise<void> {
  const ctx = await requireAnyAdmin();

  const request = await prisma.joinRequest.findUnique({
    where:   { id: requestId },
    include: {
      instance: { select: { createdById: true, name: true } },
      user:     { select: { email: true } },
    },
  });
  if (!request) throw new Error('Request not found');

  if (ctx.role !== ROLES.MASTER_ADMIN) {
    const canResolve =
      (ctx.role === ROLES.ADMIN && request.instance.createdById === ctx.id) ||
      ctx.adminInstanceIds.includes(request.instanceId);
    if (!canResolve) throw new Error('Forbidden');
  }

  await prisma.joinRequest.update({
    where: { id: requestId },
    data:  { status: decision, resolvedAt: new Date(), resolvedById: ctx.id },
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
    }).catch((err: unknown) => console.error('[mailer] join-request acceptance email failed', { requestId, to: request.user.email, error: err instanceof Error ? err.message : String(err) }));
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
    }).catch((err: unknown) => console.error('[mailer] join-request rejection email failed', { requestId, to: request.user.email, error: err instanceof Error ? err.message : String(err) }));
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
  const ctx = await getCallerCtx();
  if (ctx.role !== ROLES.MASTER_ADMIN) return 0;
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
    // Create the OlympiadInstance, add user as ADMIN member, and promote global role to ADMIN
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
    await Promise.all([
      prisma.instanceMembership.create({
        data: { userId: request.userId, instanceId: instance.id, memberRole: 'ADMIN' },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data:  { role: 'ADMIN' },
      }),
    ]);

    sendMail({
      to:      request.user.email,
      subject: `Deine Instanz „${request.instanceName}" wurde genehmigt`,
      html: `
        <p>Hallo,</p>
        <p>Deine Anfrage für die Instanz <strong>${request.instanceName}</strong> wurde <strong>genehmigt</strong>. 🎉</p>
        <p>Du kannst dich jetzt einloggen und deine Instanz verwalten.</p>
      `,
      text: `Deine Instanz „${request.instanceName}" wurde genehmigt. Du kannst dich jetzt einloggen.`,
    }).catch((err: unknown) => console.error('[mailer] instance-request approval email failed', { requestId, to: request.user.email, error: err instanceof Error ? err.message : String(err) }));
  } else {
    sendMail({
      to:      request.user.email,
      subject: `Instanz-Anfrage „${request.instanceName}" abgelehnt`,
      html: `
        <p>Hallo,</p>
        <p>Deine Anfrage für die Instanz <strong>${request.instanceName}</strong> wurde leider <strong>abgelehnt</strong>.</p>
      `,
      text: `Deine Anfrage für Instanz „${request.instanceName}" wurde abgelehnt.`,
    }).catch((err: unknown) => console.error('[mailer] instance-request rejection email failed', { requestId, to: request.user.email, error: err instanceof Error ? err.message : String(err) }));
  }
}

// ─── Instance overview (MASTER_ADMIN) ─────────────────────────────────────────

export type AdminInstanceRecord = {
  id:                   string;
  name:                 string;
  description:          string | null;
  startsAt:             Date;
  endsAt:               Date;
  isActive:             boolean;
  weeklyDigestEnabled:  boolean;
  createdAt:            Date;
  createdById:          string;
  createdByEmail:       string;
  memberCount:          number;
};

function mapInstance(i: {
  id: string; name: string; description: string | null;
  startsAt: Date; endsAt: Date; isActive: boolean; weeklyDigestEnabled: boolean;
  createdAt: Date; createdById: string;
  createdBy: { email: string };
  _count: { memberships: number };
}): AdminInstanceRecord {
  return {
    id:                  i.id,
    name:                i.name,
    description:         i.description,
    startsAt:            i.startsAt,
    endsAt:              i.endsAt,
    isActive:            i.isActive,
    weeklyDigestEnabled: i.weeklyDigestEnabled,
    createdAt:           i.createdAt,
    createdById:         i.createdById,
    createdByEmail:      i.createdBy.email,
    memberCount:         i._count.memberships,
  };
}

/** All olympiad instances across the platform. MASTER_ADMIN only. */
export async function getAllInstances(): Promise<AdminInstanceRecord[]> {
  await requireMasterAdmin();
  const rows = await prisma.olympiadInstance.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count:    { select: { memberships: true } },
      createdBy: { select: { email: true } },
    },
  });
  return rows.map(mapInstance);
}

/** Transfer an olympiad to a new owner by email. MASTER_ADMIN only. */
export async function transferOlympiadOwner(instanceId: string, newOwnerEmail: string): Promise<void> {
  await requireMasterAdmin();
  const newOwner = await prisma.user.findUnique({
    where:  { email: newOwnerEmail },
    select: { id: true },
  });
  if (!newOwner) throw new Error(`Kein User mit der E-Mail „${newOwnerEmail}" gefunden.`);
  await prisma.olympiadInstance.update({
    where: { id: instanceId },
    data:  { createdById: newOwner.id },
  });
}

/** All olympiad instances created by a specific user. MASTER_ADMIN only. */
export async function getInstanceOlympiads(createdById: string): Promise<AdminInstanceRecord[]> {
  await requireMasterAdmin();
  const rows = await prisma.olympiadInstance.findMany({
    where:   { createdById },
    orderBy: { createdAt: 'desc' },
    include: {
      _count:    { select: { memberships: true } },
      createdBy: { select: { email: true } },
    },
  });
  return rows.map(mapInstance);
}
