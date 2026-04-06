'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Granularity } from '../lib/dashboardUtils';

export type DashboardFilters = {
  granularity: Granularity;
  from:        string;
  to:          string;
  targetUser?: string;
};

export function useDashboardFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const now        = new Date();
  const defaultFrom = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1)).toISOString().split('T')[0];
  const defaultTo   = now.toISOString().split('T')[0];

  const filters: DashboardFilters = {
    granularity: (searchParams.get('granularity') as Granularity) ?? 'monthly',
    from:        searchParams.get('from') ?? defaultFrom,
    to:          searchParams.get('to')   ?? defaultTo,
    targetUser:  searchParams.get('userId') ?? undefined,
  };

  function update(updates: Partial<DashboardFilters> & { userId?: string | undefined }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.granularity !== undefined) params.set('granularity', updates.granularity);
    if (updates.from        !== undefined) params.set('from',        updates.from);
    if (updates.to          !== undefined) params.set('to',          updates.to);
    if ('userId' in updates) {
      if (updates.userId) params.set('userId', updates.userId);
      else                params.delete('userId');
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return { filters, update };
}
