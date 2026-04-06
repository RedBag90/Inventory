'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteItem } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
