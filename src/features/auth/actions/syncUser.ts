'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/shared/lib/prisma';

export type SyncedUser = {
  id:                   string;
  email:                string;
  role:                 'USER' | 'ADMIN' | 'MASTER_ADMIN';
  isActive:             boolean;
  tutorialCompletedAt:  Date | null;
};

/**
 * US-008 — Upsert the Supabase-authenticated user into the local Prisma User table.
 * Called from the dashboard layout on every authenticated request.
 *
 * - Creates the user record on first login (role defaults to USER).
 * - Redirects to /suspended if the account has been deactivated by an admin.
 * - Redirects to /pending-assignment if USER has no OlympiadInstance membership.
 * - Handles pending invite cookie: auto-joins instance after login via invite link.
 */
export async function syncUser(
  supabaseId: string,
  email: string,
  userMetadata?: Record<string, string>,
): Promise<SyncedUser> {
  let user = await prisma.user.findUnique({
    where:  { supabaseId },
    select: { id: true, email: true, role: true, isActive: true, tutorialCompletedAt: true,
              memberships: { select: { instanceId: true } } },
  });

  if (!user) {
    const displayName = userMetadata?.displayName?.trim() || null;
    user = await prisma.user.upsert({
      where:  { email },
      update: { supabaseId },
      create: { supabaseId, email, displayName },
      select: { id: true, email: true, role: true, isActive: true, tutorialCompletedAt: true,
                memberships: { select: { instanceId: true } } },
    });
  }

  if (!user.isActive) redirect('/suspended');

  // Handle pending invite cookie (set by /join/[token] before login)
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get('pending_invite_token')?.value;
  if (pendingToken) {
    const instance = await prisma.olympiadInstance.findUnique({
      where: { inviteToken: pendingToken },
      select: { id: true },
    });
    if (instance) {
      await prisma.instanceMembership.upsert({
        where:  { userId_instanceId: { userId: user.id, instanceId: instance.id } },
        update: {},
        create: { userId: user.id, instanceId: instance.id },
      });
      const alreadyMember = user.memberships.some(m => m.instanceId === instance.id);
      if (!alreadyMember) {
        user = { ...user, memberships: [...user.memberships, { instanceId: instance.id }] };
      }
      cookieStore.delete('pending_invite_token');
    }
  }

  // Handle DB-stored pending invite by email (survives cross-device email confirmation)
  const pendingEmailInvite = await prisma.pendingEmailInvite.findFirst({
    where: { email: user.email },
  });
  if (pendingEmailInvite) {
    await prisma.pendingEmailInvite.deleteMany({ where: { email: user.email } });
    const alreadyMember = user.memberships.some(m => m.instanceId === pendingEmailInvite.instanceId);
    if (!alreadyMember) {
      const instance = await prisma.olympiadInstance.findUnique({
        where:  { id: pendingEmailInvite.instanceId },
        select: { inviteLinkAutoAccept: true },
      });
      if (instance?.inviteLinkAutoAccept !== false) {
        await prisma.instanceMembership.create({
          data: { userId: user.id, instanceId: pendingEmailInvite.instanceId },
        });
        user = { ...user, memberships: [...user.memberships, { instanceId: pendingEmailInvite.instanceId }] };
      } else {
        const existingRequest = await prisma.joinRequest.findFirst({
          where: { userId: user.id, instanceId: pendingEmailInvite.instanceId, status: 'PENDING' },
        });
        if (!existingRequest) {
          await prisma.joinRequest.create({
            data: { userId: user.id, instanceId: pendingEmailInvite.instanceId },
          });
        }
      }
    }
  }

  // Block non-admins without any instance membership
  if (user.memberships.length === 0 && user.role === 'USER') {
    redirect('/pending-assignment');
  }

  return {
    id:                  user.id,
    email:               user.email,
    role:                user.role as 'USER' | 'ADMIN' | 'MASTER_ADMIN',
    isActive:            user.isActive,
    tutorialCompletedAt: user.tutorialCompletedAt,
  };
}
