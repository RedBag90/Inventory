'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllInstances, getInstanceOlympiads, transferOlympiadOwner } from '../services/AdminRepository';

export const instanceKeys = {
  all:      () => ['instances'] as const,
  byOwner:  (ownerId: string) => ['instances', 'byOwner', ownerId] as const,
};

export function useInstances() {
  return useQuery({
    queryKey: instanceKeys.all(),
    queryFn:  getAllInstances,
  });
}

export function useInstanceOlympiads(createdById: string) {
  return useQuery({
    queryKey: instanceKeys.byOwner(createdById),
    queryFn:  () => getInstanceOlympiads(createdById),
    enabled:  !!createdById,
  });
}

export function useTransferOlympiadOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instanceId, newOwnerEmail }: { instanceId: string; newOwnerEmail: string }) =>
      transferOlympiadOwner(instanceId, newOwnerEmail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instanceKeys.all() });
      qc.invalidateQueries({ queryKey: ['olympiads'] });
    },
  });
}
