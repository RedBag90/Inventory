'use client';

import { useQuery } from '@tanstack/react-query';
import { reportingKeys } from './reportingKeys';
import { getCumulativeReport } from '../services/ReportingRepository';

export function useCumulativeReport(targetUserId?: string) {
  return useQuery({
    queryKey: [...reportingKeys.cumulative(), targetUserId ?? 'self'],
    queryFn:  () => getCumulativeReport(targetUserId),
    staleTime: 5 * 60_000,
  });
}
