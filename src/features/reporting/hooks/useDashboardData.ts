'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../services/getDashboardData';
import { reportingKeys } from './reportingKeys';

export function useDashboardData(from: string, to: string, targetUser?: string) {
  return useQuery({
    queryKey: reportingKeys.dashboard(from, to, targetUser ?? 'self'),
    queryFn:  () => getDashboardData(from, to, targetUser),
    staleTime: 5 * 60_000,
    enabled:  from.length > 0 && to.length > 0,
  });
}
