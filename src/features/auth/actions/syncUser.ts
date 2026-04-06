'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/shared/lib/prisma';

export type SyncedUser = {
  id:       string;
  email:    string;
  role:     'USER' | 'ADMIN';
  isActive: boolean;
};

/**
 * US-008 — Upsert the Supabase-authenticated user into the local Prisma User table.
 * Called from the dashboard layout on every authenticated request.
 *
 * - Creates the user record on first login (role defaults to USER).
 * - Redirects to /suspended if the account has been deactivated by an admin.
 * - Returns the resolved user record so the layout can pass role info downstream.
 */
export async function syncUser(supabaseId: string, email: string): Promise<SyncedUser> {
  const user = await prisma.user.upsert({
    where:  { supabaseId },
    update: { email },
    create: { supabaseId, email },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user.isActive) {
    redirect('/suspended');
  }

  return {
    id:       user.id,
    email:    user.email,
    role:     user.role as 'USER' | 'ADMIN',
    isActive: user.isActive,
  };
}
