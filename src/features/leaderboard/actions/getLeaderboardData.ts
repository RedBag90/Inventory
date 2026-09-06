'use server';

import { prisma } from '@/shared/lib/prisma';
import { getCurrentDbUser } from '@/shared/lib/auth/getCurrentUserId';
import { ROLES } from '@/shared/types/auth';
import { computeLeaderboardForInstance } from '../services/computeLeaderboard';
import type { LeaderboardEntry } from '../types/leaderboard.types';

/**
 * Client-facing leaderboard entry point — reachable from the browser as a server action.
 *
 * Guarded: the caller must be a member of the instance, or MASTER_ADMIN. This mirrors what
 * `getLeaderboard` (admin) already permits, so a MASTER_ADMIN may still inspect an instance
 * they do not belong to.
 *
 * System callers that carry their own authorization — the weekly-digest cron (CRON_SECRET
 * bearer token, no user session) and the admin preview (resolves membership itself) — must
 * use `computeLeaderboardForInstance` instead. Calling this from them would throw.
 */
export async function getLeaderboardData(
  instanceId: string,
): Promise<{ entries: LeaderboardEntry[]; instanceName: string }> {
  const caller = await getCurrentDbUser();

  if (caller.role !== ROLES.MASTER_ADMIN) {
    const membership = await prisma.instanceMembership.findUnique({
      where:  { userId_instanceId: { userId: caller.id, instanceId } },
      select: { id: true },
    });
    if (!membership) throw new Error('Forbidden');
  }

  return computeLeaderboardForInstance(instanceId);
}
