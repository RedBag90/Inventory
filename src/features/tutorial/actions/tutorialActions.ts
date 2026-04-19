'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentUserId } from '@/shared/lib/auth/getCurrentUserId';
import { revalidateTag } from 'next/cache';
import { checkAndAwardBadges } from '@/features/badges/services/BadgeAwardService';

export async function completeTutorial(): Promise<void> {
  const userId = await getCurrentUserId();

  await prisma.user.update({
    where: { id: userId },
    data:  { tutorialCompletedAt: new Date() },
  });

  await checkAndAwardBadges({ type: 'engagement', userId, event: 'tutorial_done' });
  revalidateTag('currentDbUser');
}

export async function resetTutorial(): Promise<void> {
  const userId = await getCurrentUserId();

  await prisma.user.update({
    where: { id: userId },
    data:  { tutorialCompletedAt: null },
  });

  revalidateTag('currentDbUser');
}
