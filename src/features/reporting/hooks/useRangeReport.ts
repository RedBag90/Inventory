'use client';

import { useQuery } from '@tanstack/react-query';
import { reportingKeys } from './reportingKeys';
import { getRangeReport } from '../services/ReportingRepository';

export function useRangeReport(from: string, to: string, targetUserId?: string) {
  return useQuery({
    queryKey: reportingKeys.range(from, to, targetUserId ?? 'self'),
    queryFn: () => {
      const start  = new Date(from);
      const toDate = new Date(to);
      // end is exclusive — advance to start of next day
      const end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate() + 1));
      return getRangeReport(start, end, targetUserId);
    },
    staleTime: 5 * 60_000,
    enabled: !!from && !!to,
  });
}
