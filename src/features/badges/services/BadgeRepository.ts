'use server';

import { prisma } from '@/shared/lib/prisma';
import type { BadgeDefinition, UserBadgeWithDefinition } from '../types/badge.types';

function mapBadge(b: {
  id: string; slug: string; category: string; tier: string;
  criteria: unknown; sortOrder: number;
}): BadgeDefinition {
  return {
    id:        b.id,
    slug:      b.slug,
    category:  b.category as BadgeDefinition['category'],
    tier:      b.tier     as BadgeDefinition['tier'],
    criteria:  b.criteria as BadgeDefinition['criteria'],
    sortOrder: b.sortOrder,
  };
}

export async function getAllBadges(): Promise<BadgeDefinition[]> {
  const badges = await prisma.badge.findMany({ orderBy: { sortOrder: 'asc' } });
  return badges.map(mapBadge);
}

export async function getUserBadges(userId: string): Promise<UserBadgeWithDefinition[]> {
  const records = await prisma.userBadge.findMany({
    where:   { userId },
    include: { badge: true },
    orderBy: { unlockedAt: 'asc' },
  });
  return records.map((r) => ({
    id:         r.id,
    unlockedAt: r.unlockedAt,
    badge:      mapBadge(r.badge),
  }));
}

export async function getUnnotifiedBadges(userId: string): Promise<UserBadgeWithDefinition[]> {
  const records = await prisma.userBadge.findMany({
    where:   { userId, notified: false },
    include: { badge: true },
    orderBy: { unlockedAt: 'asc' },
  });
  return records.map((r) => ({
    id:         r.id,
    unlockedAt: r.unlockedAt,
    badge:      mapBadge(r.badge),
  }));
}

export async function markBadgesNotified(userId: string): Promise<void> {
  await prisma.userBadge.updateMany({
    where: { userId, notified: false },
    data:  { notified: true },
  });
}

export async function getUserBadgeCount(userId: string): Promise<number> {
  return prisma.userBadge.count({ where: { userId } });
}

export async function awardBadgeManual(userId: string, badgeSlug: string): Promise<void> {
  const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
  if (!badge) throw new Error(`Badge not found: ${badgeSlug}`);
  await prisma.userBadge.upsert({
    where:  { userId_badgeId: { userId, badgeId: badge.id } },
    update: {},
    create: { userId, badgeId: badge.id, notified: false },
  });
}
