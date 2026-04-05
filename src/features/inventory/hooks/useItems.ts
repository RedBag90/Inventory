'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getItems } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';
import type { ItemStatus } from '../types/inventory.types';

export function useItems() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') as ItemStatus | null;
  const filters = statusParam ? { status: statusParam } : {};

  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn:  () => getItems(filters),
    staleTime: 60_000,
  });
}
