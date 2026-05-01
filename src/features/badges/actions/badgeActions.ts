'use server';

import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma';
import { getCurrentUserId, getCurrentDbUser } from '@/shared/lib/auth/getCurrentUserId';
import { ROLES } from '@/shared/types/auth';
import { getAllBadges, getUserBadges, getUnnotifiedBadges, markBadgesNotified, awardBadgeManual } from '../services/BadgeRepository';
import { computeTotalXP } from '../lib/xpSystem';
import type { BadgesPageData, UserBadgeWithDefinition } from '../types/badge.types';

export async function getMyBadgesPageData(): Promise<BadgesPageData> {
  const userId = await getCurrentUserId();
  const [all, earned] = await Promise.all([getAllBadges(), getUserBadges(userId)]);
  const totalXP = computeTotalXP(earned);
  return { all, earned, totalXP };
}

export async function getMyXP(): Promise<number> {
  const userId = await getCurrentUserId();
  const earned = await prisma.userBadge.findMany({
    where:  { userId },
    select: { badge: { select: { tier: true } } },
  });
  return computeTotalXP(earned);
}

export async function getMyUnnotifiedBadges(): Promise<UserBadgeWithDefinition[]> {
  const userId = await getCurrentUserId();
  return getUnnotifiedBadges(userId);
}

export async function markMyBadgesNotified(): Promise<void> {
  const userId = await getCurrentUserId();
  return markBadgesNotified(userId);
}

export async function getMyBadgeCount(): Promise<number> {
  const userId = await getCurrentUserId();
  return prisma.userBadge.count({ where: { userId } });
}

export async function adminAwardSpecialBadge(targetUserId: string, badgeSlug: string): Promise<void> {
  z.string().min(1).parse(targetUserId);
  z.string().min(1).parse(badgeSlug);
  const caller = await getCurrentDbUser();
  if (caller.role !== ROLES.ADMIN && caller.role !== ROLES.MASTER_ADMIN) {
    throw new Error('Unauthorized');
  }

  const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
  if (!badge || badge.category !== 'SPECIAL') throw new Error('Not a special badge');

  await awardBadgeManual(targetUserId, badgeSlug);
}
