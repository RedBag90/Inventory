'use client';

import { useQuery } from '@tanstack/react-query';
import { reportingKeys } from './reportingKeys';
import { getAllMonthlyReports } from '../services/ReportingRepository';

export function useAllMonthlyReports(year: number, targetUserId?: string) {
  return useQuery({
    queryKey: [...reportingKeys.all, 'year', year, targetUserId ?? 'self'] as const,
    queryFn:  () => getAllMonthlyReports(year, targetUserId),
    staleTime: 5 * 60_000,
  });
}
