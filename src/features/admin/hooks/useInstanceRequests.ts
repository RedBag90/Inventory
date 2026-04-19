'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from './adminKeys';
import {
  getInstanceRequests,
  getPendingInstanceRequestCount,
  resolveInstanceRequest,
} from '../services/AdminRepository';
import {
  submitInstanceRequest,
  getMyInstanceRequest,
} from '@/features/olympiad/actions/olympiadActions';

export function useInstanceRequests(statusFilter: 'PENDING' | 'ALL' = 'PENDING') {
  return useQuery({
    queryKey:  adminKeys.instanceRequests(statusFilter),
    queryFn:   () => getInstanceRequests(statusFilter),
    staleTime: 15_000,
  });
}

export function usePendingInstanceRequestCount(enabled: boolean) {
  return useQuery({
    queryKey:        adminKeys.instanceRequestCount(),
    queryFn:         getPendingInstanceRequestCount,
    enabled,
    staleTime:       15_000,
    refetchInterval: 60_000,
  });
}

export function useMyInstanceRequest() {
  return useQuery({
    queryKey:  adminKeys.instanceRequestMine(),
    queryFn:   getMyInstanceRequest,
    staleTime: 30_000,
  });
}

export function useResolveInstanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: 'APPROVED' | 'REJECTED' }) =>
      resolveInstanceRequest(requestId, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.instanceRequests() });
      qc.invalidateQueries({ queryKey: adminKeys.instanceRequestCount() });
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
      qc.invalidateQueries({ queryKey: adminKeys.instanceRequestMine() });
    },
  });
}
