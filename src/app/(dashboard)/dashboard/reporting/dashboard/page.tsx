import { Suspense } from 'react';
import { DashboardPage } from '@/features/reporting/components/DashboardPage';

export default function ReportingDashboardRoute() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500 py-8 text-center">Loading…</div>}>
      <DashboardPage />
    </Suspense>
  );
}
