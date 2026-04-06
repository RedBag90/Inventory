'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

async function resolveUserId(targetUserId?: string): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true, role: true },
  });
  if (!dbUser) throw new Error('User record not found');

  if (!targetUserId || targetUserId === dbUser.id) return dbUser.id;
  if (dbUser.role !== 'ADMIN') throw new Error('Forbidden');
  return targetUserId;
}

/**
 * Returns the earliest purchasedAt date (ISO date string "YYYY-MM-DD") across
 * all items belonging to the resolved user, or null if they have no items.
 */
export async function getEarliestItemDate(targetUserId?: string): Promise<string | null> {
  const userId = await resolveUserId(targetUserId);

  const earliest = await prisma.item.findFirst({
    where:   { userId },
    orderBy: { purchasedAt: 'asc' },
    select:  { purchasedAt: true },
  });

  if (!earliest) return null;
  return earliest.purchasedAt.toISOString().split('T')[0];
}
