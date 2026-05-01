import { Suspense } from 'react';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { ReportingPage } from '@/features/reporting';
import { getEarliestItemDate } from '@/features/reporting/services/getEarliestItemDate';

export default async function ReportingRoute() {
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ['earliest-item-date', 'self'],
    queryFn:  () => getEarliestItemDate(),
  });
  return (
    <Suspense fallback={<div className="text-sm text-slate-500 py-8 text-center">Loading…</div>}>
      <HydrationBoundary state={dehydrate(qc)}>
        <ReportingPage />
      </HydrationBoundary>
    </Suspense>
  );
}
