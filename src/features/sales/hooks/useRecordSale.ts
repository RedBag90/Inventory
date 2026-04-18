'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { salesKeys } from './salesKeys';
import { inventoryKeys } from '@/features/inventory/hooks/inventoryKeys';
import { reportingKeys } from '@/features/reporting/hooks/reportingKeys';
import { badgeKeys } from '@/features/badges/hooks/badgeKeys';
import { createSale } from '../services/SaleRepository';
import { BadgeToast } from '@/features/badges/components/BadgeToast';
import type { RecordSaleInput } from '../types/sales.types';
import type { AwardedBadge } from '@/features/badges/types/badge.types';

function showBadgeToasts(newBadges: AwardedBadge[]) {
  for (const badge of newBadges) {
    toast.custom(() => BadgeToast({ badge }), { duration: 6000 });
  }
}

export function useRecordSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordSaleInput) => createSale(data),
    onSuccess: ({ newBadges }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: badgeKeys.all });
        showBadgeToasts(newBadges);
      }
    },
  });
}
