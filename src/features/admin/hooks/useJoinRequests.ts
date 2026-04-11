'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from './adminKeys';
import {
  getJoinRequests,
  getPendingJoinRequestCount,
  resolveJoinRequest,
} from '../services/AdminRepository';

export function useJoinRequests(statusFilter: 'PENDING' | 'ALL' = 'PENDING') {
  return useQuery({
    queryKey: [...adminKeys.joinRequests(), statusFilter],
    queryFn:  () => getJoinRequests(statusFilter),
    staleTime: 15_000,
  });
}

export function usePendingJoinRequestCount(enabled = true) {
  return useQuery({
    queryKey: adminKeys.joinRequestCount(),
    queryFn:  getPendingJoinRequestCount,
    staleTime: 15_000,
    refetchInterval: 60_000,
    enabled,
  });
}

export function useResolveJoinRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: 'ACCEPTED' | 'REJECTED' }) =>
      resolveJoinRequest(requestId, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.joinRequests() });
      qc.invalidateQueries({ queryKey: adminKeys.joinRequestCount() });
    },
  });
}
