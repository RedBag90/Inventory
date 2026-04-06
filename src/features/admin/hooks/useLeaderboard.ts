'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from './adminKeys';
import { getLeaderboard } from '../services/getLeaderboard';

export function useLeaderboard() {
  return useQuery({
    queryKey: adminKeys.leaderboard(),
    queryFn:  getLeaderboard,
    staleTime: 60_000,
  });
}
