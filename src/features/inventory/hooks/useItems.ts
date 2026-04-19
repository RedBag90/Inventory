'use client';

import { useQuery } from '@tanstack/react-query';
import { getItems } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';

export function useItems() {
  return useQuery({
    queryKey: inventoryKeys.list({}),
    queryFn:  () => getItems({}),
    staleTime: 60_000,
  });
}
