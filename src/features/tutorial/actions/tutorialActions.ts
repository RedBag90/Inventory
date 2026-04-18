'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { revalidateTag } from 'next/cache';
import { checkAndAwardBadges } from '@/features/badges/services/BadgeAwardService';

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { id: true },
  });
  return dbUser?.id ?? null;
}

export async function completeTutorial(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data:  { tutorialCompletedAt: new Date() },
  });

  await checkAndAwardBadges({ type: 'engagement', userId, event: 'tutorial_done' });
  revalidateTag('currentDbUser');
}

export async function resetTutorial(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data:  { tutorialCompletedAt: null },
  });

  revalidateTag('currentDbUser');
}
