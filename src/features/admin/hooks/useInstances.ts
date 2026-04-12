'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllInstances, getInstanceOlympiads } from '../services/AdminRepository';

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
