'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { salesKeys } from './salesKeys';
import { inventoryKeys } from '@/features/inventory/hooks/inventoryKeys';
import { reportingKeys } from '@/features/reporting/hooks/reportingKeys';
import { badgeKeys } from '@/features/badges/hooks/badgeKeys';
import { createSale } from '../services/SaleRepository';
import { showBadgeToasts } from '@/features/badges/lib/badgeToasts';
import type { RecordSaleInput } from '../types/sales.types';

export function useRecordSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordSaleInput) => createSale(data),
    onSuccess: ({ newBadges }, variables) => {
      const d     = variables.soldAt;
      const year  = d.getFullYear();
      const month = d.getMonth() + 1;
      const q     = Math.ceil(month / 3) as 1 | 2 | 3 | 4;

      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportingKeys.monthly(year, month) });
      queryClient.invalidateQueries({ queryKey: reportingKeys.quarterly(year, q) });
      queryClient.invalidateQueries({ queryKey: reportingKeys.cumulative() });
      queryClient.invalidateQueries({ queryKey: reportingKeys.rangeAll() });
      queryClient.invalidateQueries({ queryKey: reportingKeys.dashboardAll() });
      queryClient.invalidateQueries({ queryKey: reportingKeys.lineItemsAll() });

      toast.success('Verkauf erfasst');
      if (newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: badgeKeys.all });
        showBadgeToasts(newBadges);
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Fehler beim Speichern'),
  });
}
