'use client';

import { useQuery } from '@tanstack/react-query';
import { reportingKeys } from './reportingKeys';
import { getMonthlyReport } from '../services/ReportingRepository';

export function useMonthlyReport(year: number, month: number, targetUserId?: string) {
  return useQuery({
    queryKey: [...reportingKeys.monthly(year, month), targetUserId ?? 'self'],
    queryFn:  () => getMonthlyReport(year, month, targetUserId),
    staleTime: 5 * 60_000,
  });
}
