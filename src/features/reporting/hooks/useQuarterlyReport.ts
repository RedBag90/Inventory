'use client';

import { useQuery } from '@tanstack/react-query';
import { reportingKeys } from './reportingKeys';
import { getQuarterlyReport } from '../services/ReportingRepository';

export function useQuarterlyReport(year: number, quarter: 1 | 2 | 3 | 4, targetUserId?: string) {
  return useQuery({
    queryKey: [...reportingKeys.quarterly(year, quarter), targetUserId ?? 'self'],
    queryFn:  () => getQuarterlyReport(year, quarter, targetUserId),
    staleTime: 5 * 60_000,
  });
}
