'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQuickSale } from '../services/SaleRepository';
import { showBadgeToasts } from '@/features/badges';
import { invalidateForMutation } from '@/shared/lib/queryInvalidation';
import type { QuickSellInput } from '../types/sales.types';

export function useQuickSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuickSellInput) => createQuickSale(data),
    onSuccess: ({ newBadges }, variables) => {
      const year  = variables.soldAt.getFullYear();
      const month = variables.soldAt.getMonth() + 1;
      invalidateForMutation(queryClient, 'sale_recorded', { year, month, hasBadges: newBadges.length > 0 });
      toast.success('Verkauf erfasst');
      if (newBadges.length > 0) showBadgeToasts(newBadges);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Speichern'),
  });
}
