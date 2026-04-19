'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from './adminKeys';
import { getAllInstances, getInstanceOlympiads, transferOlympiadOwner } from '../services/AdminRepository';

export function useInstances() {
  return useQuery({
    queryKey: adminKeys.instances(),
    queryFn:  getAllInstances,
  });
}

export function useInstanceOlympiads(createdById: string) {
  return useQuery({
    queryKey: adminKeys.instancesByOwner(createdById),
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
      qc.invalidateQueries({ queryKey: adminKeys.instances() });
      qc.invalidateQueries({ queryKey: ['olympiads'] });
    },
  });
}
