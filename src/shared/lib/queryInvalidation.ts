'use client';

import type { QueryClient } from '@tanstack/react-query';
import { salesKeys } from '@/features/sales';
import { inventoryKeys } from '@/features/inventory';
import { reportingKeys } from '@/features/reporting';
import { badgeKeys } from '@/features/badges';

type MutationType =
  | 'sale_recorded'
  | 'pending_sale_confirmed'
  | 'pending_sale_cancelled';

export function invalidateForMutation(
  queryClient: QueryClient,
  type: MutationType,
  opts?: { hasBadges?: boolean; year?: number; month?: number },
): void {
  if (type === 'sale_recorded' || type === 'pending_sale_confirmed') {
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    queryClient.invalidateQueries({ queryKey: reportingKeys.dashboardAll() });
    queryClient.invalidateQueries({ queryKey: reportingKeys.rangeAll() });
  }

  if (type === 'sale_recorded') {
    const year  = opts?.year  ?? new Date().getFullYear();
    const month = opts?.month ?? new Date().getMonth() + 1;
    const q     = Math.ceil(month / 3) as 1 | 2 | 3 | 4;

    queryClient.invalidateQueries({ queryKey: salesKeys.all });
    queryClient.invalidateQueries({ queryKey: reportingKeys.monthly(year, month) });
    queryClient.invalidateQueries({ queryKey: reportingKeys.quarterly(year, q) });
    queryClient.invalidateQueries({ queryKey: reportingKeys.cumulative() });
    queryClient.invalidateQueries({ queryKey: reportingKeys.lineItemsAll() });
  }

  if (type === 'pending_sale_cancelled') {
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
  }

  if (opts?.hasBadges) {
    queryClient.invalidateQueries({ queryKey: badgeKeys.all });
  }
}
