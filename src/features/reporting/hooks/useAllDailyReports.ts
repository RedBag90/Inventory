'use client';

import { useQuery } from '@tanstack/react-query';
import { reportingKeys } from './reportingKeys';
import { getAllDailyReports } from '../services/ReportingRepository';

export function useAllDailyReports(from: string, to: string, targetUserId?: string) {
  return useQuery({
    queryKey: [...reportingKeys.all, 'daily', from, to, targetUserId ?? 'self'] as const,
    queryFn:  () => {
      const start = new Date(from);
      const end   = new Date(to);
      end.setUTCDate(end.getUTCDate() + 1); // inclusive end date
      return getAllDailyReports(start, end, targetUserId);
    },
    staleTime: 5 * 60_000,
    enabled:   !!from && !!to,
  });
}
