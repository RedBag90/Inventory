'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesKeys } from './salesKeys';
import { inventoryKeys } from '@/features/inventory/hooks/inventoryKeys';
import { reportingKeys } from '@/features/reporting/hooks/reportingKeys';
import { createSale } from '../services/SaleRepository';
import type { RecordSaleInput } from '../types/sales.types';

// Hook: record a sale mutation via TanStack Query.
// On success: invalidates sales, inventory, and reporting caches.

export function useRecordSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordSaleInput) => createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}
