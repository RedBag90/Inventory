'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateItemMetadata } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';
import type { EditItemInput } from '../types/inventory.types';

export function useEditItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditItemInput) => updateItemMetadata(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
