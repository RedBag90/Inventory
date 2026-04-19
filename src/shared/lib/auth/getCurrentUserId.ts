'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import type { UserRole } from '@/shared/types/auth';

/** Returns the authenticated user's local Postgres ID. Throws if unauthenticated. */
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) throw new Error('User record not found');

  return dbUser.id;
}

/** Returns the authenticated user's local record with id + role. Throws if unauthenticated. */
export async function getCurrentDbUser(): Promise<{ id: string; role: UserRole }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, role: true },
  });
  if (!dbUser) throw new Error('User record not found');

  return { id: dbUser.id, role: dbUser.role as UserRole };
}
