'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateItemMetadata } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';
import type { EditItemInput } from '../types/inventory.types';

export function useEditItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditItemInput) => updateItemMetadata(id, data),
    onSuccess: () => {
      toast.success('Änderungen gespeichert');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Speichern'),
  });
}
