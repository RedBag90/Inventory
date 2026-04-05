'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateItemCosts } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';
import type { UpdateItemCostsInput } from '../types/inventory.types';

export function useUpdateItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateItemCostsInput) => updateItemCosts(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
