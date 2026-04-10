'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, role: true },
  });
  if (!dbUser) throw new Error('User not found');
  return dbUser.id;
}

async function assertOwner(instanceId: string, userId: string) {
  const [instance, user] = await Promise.all([
    prisma.olympiadInstance.findUnique({ where: { id: instanceId }, select: { createdById: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);
  if (!instance) throw new Error('Instance not found');
  if (user?.role !== 'ADMIN' && instance.createdById !== userId) throw new Error('Unauthorized');
}

function revalidate() {
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard/leaderboard');
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createOlympiad(data: {
  name: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
}) {
  const userId = await getCurrentUserId();
  await prisma.olympiadInstance.create({
    data: { ...data, createdById: userId },
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

  await prisma.instanceMembership.upsert({
    where:  { userId: target.id },
    update: { instanceId, joinedAt: new Date() },
    create: { userId: target.id, instanceId },
  });
  revalidate();

  return { replacedInstance: null };
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

export async function joinViaToken(token: string, userId: string) {
  const instance = await prisma.olympiadInstance.findUnique({
    where:  { inviteToken: token },
    select: { id: true, name: true },
  });
  if (!instance) throw new Error('Ungültiger Einladungslink.');

  const existing = await prisma.instanceMembership.findFirst({
    where: { userId, instanceId: instance.id },
    select: { id: true },
  });
  if (!existing) {
    await prisma.instanceMembership.create({ data: { userId, instanceId: instance.id } });
  }
  revalidate();
  return instance.name;
}
