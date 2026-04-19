'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteItem } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      toast.success('Artikel gelöscht');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Löschen'),
  });
}
