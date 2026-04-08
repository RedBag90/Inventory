'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesKeys } from './salesKeys';
import { inventoryKeys } from '@/features/inventory/hooks/inventoryKeys';
import { reportingKeys } from '@/features/reporting/hooks/reportingKeys';
import { createQuickSale } from '../services/SaleRepository';
import type { QuickSellInput } from '../types/sales.types';

export function useQuickSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuickSellInput) => createQuickSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}
