'use server';

import { prisma } from '@/shared/lib/prisma';
import { checkAndAwardBadges } from './BadgeAwardService';
import { calculateSaleStreak } from '../lib/streakUtils';
import type { AwardedBadge } from '../types/badge.types';

export async function checkStreakBadges(userId: string): Promise<AwardedBadge[]> {
  const sales = await prisma.sale.findMany({
    where:  { item: { userId } },
    select: { soldAt: true },
  });

  const streak = calculateSaleStreak(sales.map((s) => s.soldAt));
  if (streak < 2) return [];

  return checkAndAwardBadges({ type: 'streak_check', userId, streak });
}
