'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInstanceRequests,
  getPendingInstanceRequestCount,
  resolveInstanceRequest,
} from '../services/AdminRepository';
import {
  submitInstanceRequest,
  getMyInstanceRequest,
} from '@/features/olympiad/actions/olympiadActions';

export const instanceRequestKeys = {
  all:     () => ['instanceRequests'] as const,
  count:   () => ['instanceRequests', 'count'] as const,
  mine:    () => ['instanceRequests', 'mine'] as const,
};

export function useInstanceRequests(statusFilter: 'PENDING' | 'ALL' = 'PENDING') {
  return useQuery({
    queryKey: [...instanceRequestKeys.all(), statusFilter],
    queryFn:  () => getInstanceRequests(statusFilter),
  });
}

export function usePendingInstanceRequestCount(enabled: boolean) {
  return useQuery({
    queryKey:       instanceRequestKeys.count(),
    queryFn:        getPendingInstanceRequestCount,
    enabled,
    refetchInterval: 60_000,
  });
}

export function useMyInstanceRequest() {
  return useQuery({
    queryKey: instanceRequestKeys.mine(),
    queryFn:  getMyInstanceRequest,
  });
}

export function useResolveInstanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: 'APPROVED' | 'REJECTED' }) =>
      resolveInstanceRequest(requestId, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instanceRequestKeys.all() });
      qc.invalidateQueries({ queryKey: instanceRequestKeys.count() });
      // Also invalidate olympiads so new instance appears
      qc.invalidateQueries({ queryKey: ['olympiads'] });
    },
  });
}

export function useSubmitInstanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instanceName, description }: { instanceName: string; description?: string }) =>
      submitInstanceRequest(instanceName, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instanceRequestKeys.mine() });
    },
  });
}
