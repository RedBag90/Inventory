'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';
import { computeLeaderboardForInstance } from '@/features/leaderboard';

import type { LeaderboardBadge, LeaderboardEntry, LeaderboardResult } from '@/features/leaderboard';
export type { LeaderboardBadge, LeaderboardEntry, LeaderboardResult };

export async function getLeaderboard(instanceIdOverride?: string): Promise<LeaderboardResult> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Unauthenticated');

  const [caller, overrideInstance] = await Promise.all([
    prisma.user.findUnique({
      where:  { supabaseId: authUser.id },
      select: {
        id:   true,
        role: true,
        memberships: {
          orderBy: { joinedAt: 'desc' },
          select: {
            instance: { select: { id: true, name: true, startsAt: true, endsAt: true, isActive: true } },
          },
        },
      },
    }),
    instanceIdOverride
      ? prisma.olympiadInstance.findUnique({
          where:  { id: instanceIdOverride },
          select: { id: true, name: true, startsAt: true, endsAt: true },
        })
      : Promise.resolve(null),
  ]);
  if (!caller) throw new Error('User not found');

  const isMasterAdmin = caller.role === 'MASTER_ADMIN';

  // Resolve which instance to show
  let instance: { id: string; name: string; startsAt: Date; endsAt: Date } | null = null;

  if (instanceIdOverride) {
    if (isMasterAdmin) {
      instance = overrideInstance;
    } else {
      // Regular users / admins may only view instances they belong to
      const membership = caller.memberships.find(m => m.instance.id === instanceIdOverride);
      instance = membership?.instance ?? null;
    }
  } else if (caller.memberships.length > 0) {
    // Default: most recently joined active instance, else most recently joined overall
    const active = caller.memberships.find(m => m.instance.isActive) ?? caller.memberships[0];
    instance = active.instance;
  }

  if (!instance) {
    return { entries: [], instanceName: null, startsAt: null, endsAt: null };
  }

  const { entries, instanceName } = await computeLeaderboardForInstance(instance.id);

  return {
    entries,
    instanceName,
    startsAt: instance.startsAt,
    endsAt:   instance.endsAt,
  };
}
