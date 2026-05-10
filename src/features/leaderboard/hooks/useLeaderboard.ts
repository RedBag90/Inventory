'use client';

import { useQuery } from '@tanstack/react-query';
import { leaderboardKeys } from './leaderboardKeys';
import { getLeaderboardData } from '../actions/getLeaderboardData';

export function useLeaderboard(instanceId: string | null | undefined) {
  return useQuery({
    queryKey: leaderboardKeys.instance(instanceId ?? ''),
    queryFn:  () => getLeaderboardData(instanceId!),
    enabled:  !!instanceId,
  });
}
