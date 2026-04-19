'use server';

import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendMail } from '@/shared/lib/mailer';
import { ROLES } from '@/shared/types/auth';
import { getCurrentUserId, getCurrentDbUser } from '@/shared/lib/auth/getCurrentUserId';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireAdminRole(): Promise<string> {
  const user = await getCurrentDbUser();
  if (user.role !== ROLES.ADMIN && user.role !== ROLES.MASTER_ADMIN) throw new Error('Forbidden');
  return user.id;
}

async function assertOwner(instanceId: string, userId: string) {
  const [instance, user, membership] = await Promise.all([
    prisma.olympiadInstance.findUnique({ where: { id: instanceId }, select: { createdById: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.instanceMembership.findUnique({
      where:  { userId_instanceId: { userId, instanceId } },
      select: { memberRole: true },
    }),
  ]);
  if (!instance) throw new Error('Instance not found');
  // MASTER_ADMIN can manage all instances
  if (user?.role === ROLES.MASTER_ADMIN) return;
  // Per-instance admin via memberRole
  if (membership?.memberRole === 'ADMIN') return;
  // Legacy: creator via createdById
  if (instance.createdById === userId) return;
  throw new Error('Unauthorized');
}

function revalidate() {
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/leaderboard');
}

// ── Actions ───────────────────────────────────────────────────────────────────

const CreateOlympiadSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startsAt:    z.coerce.date(),
  endsAt:      z.coerce.date(),
}).refine(d => d.startsAt < d.endsAt, { message: 'startsAt must be before endsAt' });

export async function createOlympiad(data: {
  name: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
}) {
  const userId = await requireAdminRole();
  const parsed = CreateOlympiadSchema.parse(data);
  await prisma.olympiadInstance.create({
    data: { ...parsed, createdById: userId },
  });
  revalidate();
}

export async function updateOlympiad(instanceId: string, data: {
  name?: string;
  description?: string;
  startsAt?: Date;
  endsAt?: Date;
}) {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  await prisma.olympiadInstance.update({
    where: { id: instanceId },
    data,
  });
  revalidate();
}

export async function archiveOlympiad(instanceId: string) {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  await prisma.olympiadInstance.update({
    where: { id: instanceId },
    data:  { isActive: false },
  });
  revalidate();
}

export async function reactivateOlympiad(instanceId: string) {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  await prisma.olympiadInstance.update({
    where: { id: instanceId },
    data:  { isActive: true },
  });
  revalidate();
}

export async function deleteOlympiad(instanceId: string) {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  const memberCount = await prisma.instanceMembership.count({ where: { instanceId } });
  if (memberCount > 0) throw new Error('Instanz hat noch Teilnehmer. Bitte zuerst alle entfernen.');
  await prisma.olympiadInstance.delete({ where: { id: instanceId } });
  revalidate();
}

// ── Assignment actions ────────────────────────────────────────────────────────

export async function assignUserToOlympiad(email: string, instanceId: string) {
  const callerId = await getCurrentUserId();
  await assertOwner(instanceId, callerId);

  const target = await prisma.user.findUnique({
    where:  { email },
    select: { id: true },
  });
  if (!target) throw new Error(`Kein User mit E-Mail "${email}" gefunden.`);

  const alreadyMember = await prisma.instanceMembership.findUnique({
    where: { userId_instanceId: { userId: target.id, instanceId } },
  });
  if (alreadyMember) throw new Error(`${email} ist bereits Mitglied dieser Olympiade.`);

  await prisma.instanceMembership.create({ data: { userId: target.id, instanceId } });
  revalidate();
}

export async function removeUserFromOlympiad(userId: string, instanceId: string) {
  const callerId = await getCurrentUserId();
  await assertOwner(instanceId, callerId);
  await prisma.instanceMembership.deleteMany({
    where: { userId, instanceId },
  });
  revalidate();
}

// ── Invite token ──────────────────────────────────────────────────────────────

export async function generateInviteToken(instanceId: string): Promise<string> {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  const token = crypto.randomUUID();
  await prisma.olympiadInstance.update({
    where: { id: instanceId },
    data:  { inviteToken: token },
  });
  revalidate();
  return token;
}

export async function revokeInviteToken(instanceId: string) {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  await prisma.olympiadInstance.update({
    where: { id: instanceId },
    data:  { inviteToken: null },
  });
  revalidate();
}

// ── Join code ─────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${rand(4)}-${rand(4)}`;
}

export async function generateJoinCode(instanceId: string): Promise<string> {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  let code = generateCode();
  // Retry on collision
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.olympiadInstance.findUnique({ where: { joinCode: code } });
    if (!existing) break;
    code = generateCode();
  }
  await prisma.olympiadInstance.update({ where: { id: instanceId }, data: { joinCode: code } });
  revalidate();
  return code;
}

export async function revokeJoinCode(instanceId: string): Promise<void> {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  await prisma.olympiadInstance.update({ where: { id: instanceId }, data: { joinCode: null } });
  revalidate();
}

export async function updateAutoAccept(instanceId: string, autoAccept: boolean): Promise<void> {
  const userId = await getCurrentUserId();
  await assertOwner(instanceId, userId);
  await prisma.olympiadInstance.update({ where: { id: instanceId }, data: { autoAccept } });
  revalidate();
}

export async function submitJoinRequest(joinCode: string): Promise<{ autoAccepted: boolean; instanceName: string }> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Nicht eingeloggt');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: authUser.id },
    select: { id: true, email: true, memberships: { select: { instanceId: true } } },
  });
  if (!dbUser) throw new Error('Benutzer nicht gefunden');

  const instance = await prisma.olympiadInstance.findFirst({
    where:   { joinCode: { equals: joinCode.toUpperCase() } },
    select:  { id: true, name: true, autoAccept: true, createdBy: { select: { email: true } } },
  });
  if (!instance) throw new Error('Ungültiger Code. Bitte überprüfe die Eingabe.');

  const alreadyMember = dbUser.memberships.some(m => m.instanceId === instance.id);
  if (alreadyMember) throw new Error('Du bist bereits Mitglied dieser Olympiade.');

  const pendingRequest = await prisma.joinRequest.findFirst({
    where: { userId: dbUser.id, instanceId: instance.id, status: 'PENDING' },
  });
  if (pendingRequest) throw new Error('Du hast bereits eine offene Anfrage für diese Olympiade.');

  if (instance.autoAccept) {
    await prisma.instanceMembership.upsert({
      where:  { userId_instanceId: { userId: dbUser.id, instanceId: instance.id } },
      update: { joinedAt: new Date() },
      create: { userId: dbUser.id, instanceId: instance.id },
    });
    revalidate();
    return { autoAccepted: true, instanceName: instance.name };
  }

  await prisma.joinRequest.create({
    data: { userId: dbUser.id, instanceId: instance.id },
  });

  // Notify the admin of the olympiad about the new join request (fire-and-forget)
  sendMail({
    to:      instance.createdBy.email,
    subject: `Neue Beitrittsanfrage für „${instance.name}"`,
    html: `
      <p>Hallo,</p>
      <p><strong>${dbUser.email}</strong> möchte der Olympiade <strong>${instance.name}</strong> beitreten.</p>
      <p>Bitte melde dich im Admin-Bereich an, um die Anfrage zu bearbeiten.</p>
    `,
    text: `${dbUser.email} möchte „${instance.name}" beitreten. Bitte öffne den Admin-Bereich.`,
  }).catch(err => console.error('[mailer] Failed to send join-request notification:', err));

  revalidate();
  return { autoAccepted: false, instanceName: instance.name };
}

export type MyMembership = {
  instanceId:   string;
  instanceName: string;
  isActive:     boolean;
  joinedAt:     Date;
  memberRole:   'MEMBER' | 'ADMIN';
};

/** Returns all olympiad memberships of the current user, sorted by joinedAt desc. */
export async function getMyMemberships(): Promise<MyMembership[]> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return [];

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: authUser.id },
    select: {
      memberships: {
        orderBy: { joinedAt: 'desc' },
        include: { instance: { select: { name: true, isActive: true } } },
      },
    },
  });
  if (!dbUser) return [];

  return dbUser.memberships.map(m => ({
    instanceId:   m.instanceId,
    instanceName: m.instance.name,
    isActive:     m.instance.isActive,
    joinedAt:     m.joinedAt,
    memberRole:   m.memberRole as 'MEMBER' | 'ADMIN',
  }));
}

/** Returns true if the current user has an active olympiad membership. */
export async function checkHasMembership(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return false;

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: authUser.id },
    select: { memberships: { select: { instanceId: true }, take: 1 } },
  });
  return (dbUser?.memberships.length ?? 0) > 0;
}

export async function getMyJoinRequests() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return [];

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: authUser.id }, select: { id: true } });
  if (!dbUser) return [];

  const requests = await prisma.joinRequest.findMany({
    where:   { userId: dbUser.id, status: { in: ['PENDING', 'REJECTED'] } },
    include: { instance: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return requests.map(r => ({
    id:           r.id,
    instanceName: r.instance.name,
    status:       r.status as 'PENDING' | 'REJECTED',
    createdAt:    r.createdAt,
  }));
}

// ── Instance requests ─────────────────────────────────────────────────────────

export async function submitInstanceRequest(instanceName: string, description?: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Nicht eingeloggt');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: authUser.id },
    select: { id: true, email: true },
  });
  if (!dbUser) throw new Error('Benutzer nicht gefunden');

  const existing = await prisma.instanceRequest.findFirst({
    where: { userId: dbUser.id, status: 'PENDING' },
  });
  if (existing) throw new Error('Du hast bereits eine offene Instanz-Anfrage.');

  await prisma.instanceRequest.create({
    data: { userId: dbUser.id, instanceName: instanceName.trim(), description },
  });

  // Notify MASTER_ADMINs (fire-and-forget)
  const admins = await prisma.user.findMany({
    where:  { role: ROLES.MASTER_ADMIN, isActive: true },
    select: { email: true },
  });
  for (const admin of admins) {
    sendMail({
      to:      admin.email,
      subject: `Neue Instanz-Anfrage: „${instanceName}"`,
      html:    `<p><strong>${dbUser.email}</strong> beantragt eine eigene Instanz: <strong>${instanceName}</strong>.</p><p>Bitte öffne den Admin-Bereich, um die Anfrage zu bearbeiten.</p>`,
      text:    `${dbUser.email} beantragt Instanz „${instanceName}". Bitte Admin-Bereich öffnen.`,
    }).catch(err => console.error('[mailer] instance request notification failed:', err));
  }

  revalidate();
}

export async function getMyInstanceRequest() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: authUser.id },
    select: { id: true },
  });
  if (!dbUser) return null;

  return prisma.instanceRequest.findFirst({
    where:   { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    select:  { id: true, instanceName: true, status: true, createdAt: true },
  });
}

export async function joinViaToken(token: string) {
  const userId = await getCurrentUserId();
  const instance = await prisma.olympiadInstance.findUnique({
    where:  { inviteToken: token },
    select: { id: true, name: true },
  });
  if (!instance) throw new Error('Ungültiger Einladungslink.');

  await prisma.instanceMembership.upsert({
    where:  { userId_instanceId: { userId, instanceId: instance.id } },
    update: {},
    create: { userId, instanceId: instance.id },
  });
  revalidate();
  return instance.name;
}

// ── Pending email invite ──────────────────────────────────────────────────────

/**
 * Stores a pending invite by email so membership is created on first login,
 * even if the user confirms their email on a different device/browser.
 */
export async function storePendingEmailInvite(email: string, instanceId: string): Promise<void> {
  const callerId = await getCurrentUserId();
  await assertOwner(instanceId, callerId);
  z.string().email().parse(email);
  await prisma.pendingEmailInvite.upsert({
    where:  { email_instanceId: { email, instanceId } },
    update: {},
    create: { email, instanceId },
  });
}
