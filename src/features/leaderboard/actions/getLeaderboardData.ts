'use server';

import { computeLeaderboardForInstance } from '../services/computeLeaderboard';
import type { LeaderboardEntry } from '../types/leaderboard.types';

export async function getLeaderboardData(
  instanceId: string,
): Promise<{ entries: LeaderboardEntry[]; instanceName: string }> {
  return computeLeaderboardForInstance(instanceId);
}
