'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/shared/lib/prisma';

export type SyncedUser = {
  id:                   string;
  email:                string;
  role:                 'USER' | 'ADMIN';
  isActive:             boolean;
  tutorialCompletedAt:  Date | null;
  instanceId:           string | null;
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
export async function syncUser(supabaseId: string, email: string): Promise<SyncedUser> {
  let user = await prisma.user.findUnique({
    where:  { supabaseId },
    select: { id: true, email: true, role: true, isActive: true, tutorialCompletedAt: true,
              membership: { select: { instanceId: true } } },
  });

  if (!user) {
    user = await prisma.user.upsert({
      where:  { email },
      update: { supabaseId },
      create: { supabaseId, email },
      select: { id: true, email: true, role: true, isActive: true, tutorialCompletedAt: true,
                membership: { select: { instanceId: true } } },
    });
  }

  if (!user.isActive) redirect('/suspended');

  // Handle pending invite cookie (set by /join/[token] before login)
  if (!user.membership) {
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get('pending_invite_token')?.value;
    if (pendingToken) {
      const instance = await prisma.olympiadInstance.findUnique({
        where: { inviteToken: pendingToken },
        select: { id: true },
      });
      if (instance) {
        await prisma.instanceMembership.create({
          data: { userId: user.id, instanceId: instance.id },
        });
        cookieStore.delete('pending_invite_token');
        // Re-fetch membership
        user = { ...user, membership: { instanceId: instance.id } };
      }
    }
  }

  // Block non-admins without an instance membership
  if (!user.membership && user.role !== 'ADMIN') {
    redirect('/pending-assignment');
  }

  return {
    id:                  user.id,
    email:               user.email,
    role:                user.role as 'USER' | 'ADMIN',
    isActive:            user.isActive,
    tutorialCompletedAt: user.tutorialCompletedAt,
    instanceId:          user.membership?.instanceId ?? null,
  };
}
