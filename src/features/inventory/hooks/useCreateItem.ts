'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createItem } from '../services/ItemRepository';
import { inventoryKeys } from './inventoryKeys';
import { badgeKeys } from '@/features/badges/hooks/badgeKeys';
import { BadgeToast } from '@/features/badges/components/BadgeToast';
import type { CreateItemInput } from '../types/inventory.types';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

function showBadgeToasts(newBadges: AwardedBadge[]) {
  for (const badge of newBadges) {
    toast.custom(() => BadgeToast({ badge }), { duration: 6000 });
  }
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemInput) => createItem(data),
    onSuccess: ({ newBadges }) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: badgeKeys.all });
        showBadgeToasts(newBadges);
      }
    },
  });
}
