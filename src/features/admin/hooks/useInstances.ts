'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from './adminKeys';
import { olympiadKeys } from '@/features/olympiad/hooks/useOlympiads';
import { getAllInstances, getInstanceOlympiads, transferOlympiadOwner } from '../services/AdminRepository';

export function useInstances() {
  return useQuery({
    queryKey: adminKeys.instances(),
    queryFn:  getAllInstances,
    staleTime: 5 * 60_000,
  });
}

export function useInstanceOlympiads(createdById: string) {
  return useQuery({
    queryKey:  adminKeys.instancesByOwner(createdById),
    queryFn:   () => getInstanceOlympiads(createdById),
    enabled:   !!createdById,
    staleTime: 5 * 60_000,
  });
}

export function useTransferOlympiadOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instanceId, newOwnerEmail }: { instanceId: string; newOwnerEmail: string }) =>
      transferOlympiadOwner(instanceId, newOwnerEmail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.instances() });
      qc.invalidateQueries({ queryKey: olympiadKeys.all });
    },
  });
}
