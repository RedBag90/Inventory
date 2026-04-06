'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

export type CurrentDbUser = {
  id:    string;
  email: string;
  role:  'USER' | 'ADMIN';
};

/** Returns the current user's DB record including role. Used to gate role-specific UI. */
export async function getCurrentDbUser(): Promise<CurrentDbUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, email: true, role: true },
  });
  if (!dbUser) return null;

  return { id: dbUser.id, email: dbUser.email, role: dbUser.role as 'USER' | 'ADMIN' };
}
