'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';
import type { CreateItemInput } from '../types/inventory.types';

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemInput) => createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
