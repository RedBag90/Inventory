'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createItem } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';
import { badgeKeys } from '@/features/badges/hooks/badgeKeys';
import { showBadgeToasts } from '@/features/badges/lib/badgeToasts';
import type { CreateItemInput } from '../types/inventory.types';

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemInput) => createItem(data),
    onSuccess: ({ newBadges }) => {
      toast.success('Artikel gespeichert');
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: badgeKeys.all });
        showBadgeToasts(newBadges);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Speichern'),
  });
}
