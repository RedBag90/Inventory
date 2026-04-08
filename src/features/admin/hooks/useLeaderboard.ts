'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from './adminKeys';
import { getLeaderboard } from '../services/getLeaderboard';

/** Re-fetches every 5 minutes so rank changes stay live throughout the week.
 *  The server always compares against the most recent Sunday 00:00 UTC,
 *  so the baseline resets automatically each week. */
export function useLeaderboard() {
  return useQuery({
    queryKey:       adminKeys.leaderboard(),
    queryFn:        getLeaderboard,
    staleTime:      0,
    refetchInterval: 5 * 60_000,
  });
}
