import { Suspense } from 'react';
import { ReportingPage } from '@/features/reporting';

export default function ReportingRoute() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500 py-8 text-center">Loading…</div>}>
      <ReportingPage />
    </Suspense>
  );
}
