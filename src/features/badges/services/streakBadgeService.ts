'use server';

import { prisma } from '@/shared/lib/prisma';
import { checkAndAwardBadges } from './BadgeAwardService';
import type { AwardedBadge } from '../types/badge.types';

function toMondayTime(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.getTime();
}

export function calculateSaleStreak(saleDates: Date[]): number {
  if (saleDates.length === 0) return 0;

  const weekSet = new Set(saleDates.map(toMondayTime));

  const thisMonday = toMondayTime(new Date());
  const lastMonday = thisMonday - 7 * 86_400_000;

  // Start counting from this week if sold this week, else from last week
  let cursor = weekSet.has(thisMonday) ? thisMonday : lastMonday;
  if (!weekSet.has(cursor)) return 0;

  let streak = 0;
  while (weekSet.has(cursor)) {
    streak++;
    cursor -= 7 * 86_400_000;
  }
  return streak;
}

export async function checkStreakBadges(userId: string): Promise<AwardedBadge[]> {
  const sales = await prisma.sale.findMany({
    where:  { item: { userId } },
    select: { soldAt: true },
  });

  const streak = calculateSaleStreak(sales.map((s) => s.soldAt));
  if (streak < 2) return [];

  return checkAndAwardBadges({ type: 'streak_check', userId, streak });
}
