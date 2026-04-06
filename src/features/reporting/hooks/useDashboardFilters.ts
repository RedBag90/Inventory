'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Granularity } from '../lib/dashboardUtils';

export type DashboardFilters = {
  granularity: Granularity;
  from:        string;
  to:          string;
  targetUser?: string;
};

export function useDashboardFilters(earliestDate?: string | null) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const now        = new Date();
  // Use the user's earliest item date when available, otherwise fall back to start of last year
  const defaultFrom = earliestDate
    ?? new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1)).toISOString().split('T')[0];
  const defaultTo   = now.toISOString().split('T')[0];

  const filters: DashboardFilters = {
    granularity: (searchParams.get('granularity') as Granularity) ?? 'monthly',
    from:        searchParams.get('from') ?? defaultFrom,
    to:          searchParams.get('to')   ?? defaultTo,
    targetUser:  searchParams.get('userId') ?? undefined,
  };

  // Pass null for from/to to remove them from the URL (falls back to defaults)
  function update(updates: Omit<Partial<DashboardFilters>, 'from' | 'to'> & { userId?: string | undefined; from?: string | null; to?: string | null }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.granularity !== undefined) params.set('granularity', updates.granularity);
    if (updates.from === null)  params.delete('from');
    else if (updates.from)      params.set('from', updates.from);
    if (updates.to === null)    params.delete('to');
    else if (updates.to)        params.set('to', updates.to);
    if ('userId' in updates) {
      if (updates.userId) params.set('userId', updates.userId);
      else                params.delete('userId');
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return { filters, update };
}
