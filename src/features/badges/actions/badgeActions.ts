'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { getAllBadges, getUserBadges, getUnnotifiedBadges, markBadgesNotified, awardBadgeManual } from '../services/BadgeRepository';
import type { BadgesPageData, UserBadgeWithDefinition } from '../types/badge.types';

async function getCallerDbId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) throw new Error('User not found');
  return dbUser.id;
}

export async function getMyBadgesPageData(): Promise<BadgesPageData> {
  const userId = await getCallerDbId();
  const [all, earned] = await Promise.all([getAllBadges(), getUserBadges(userId)]);
  return { all, earned };
}

export async function getMyUnnotifiedBadges(): Promise<UserBadgeWithDefinition[]> {
  const userId = await getCallerDbId();
  return getUnnotifiedBadges(userId);
}

export async function markMyBadgesNotified(): Promise<void> {
  const userId = await getCallerDbId();
  return markBadgesNotified(userId);
}

export async function getMyBadgeCount(): Promise<number> {
  const userId = await getCallerDbId();
  return prisma.userBadge.count({ where: { userId } });
}

export async function adminAwardSpecialBadge(targetUserId: string, badgeSlug: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  const caller = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!caller || (caller.role !== 'ADMIN' && caller.role !== 'MASTER_ADMIN')) {
    throw new Error('Unauthorized');
  }

  const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
  if (!badge || badge.category !== 'SPECIAL') throw new Error('Not a special badge');

  await awardBadgeManual(targetUserId, badgeSlug);
}
