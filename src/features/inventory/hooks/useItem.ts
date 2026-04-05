'use client';

import { useQuery } from '@tanstack/react-query';
import { getItemById } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';

export function useItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn:  () => getItemById(id),
    staleTime: 60_000,
  });
}
