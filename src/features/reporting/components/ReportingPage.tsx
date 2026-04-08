'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAllMonthlyReports } from '../hooks/useAllMonthlyReports';
import { useCumulativeReport }  from '../hooks/useCumulativeReport';
import { useRangeReport }       from '../hooks/useRangeReport';
import { KPICard }              from './KPICard';
import { RevenueChart }         from './RevenueChart';
import { ProfitTable }          from './ProfitTable';
import { formatCurrency }       from '@/shared/lib/utils';
import { getSaleLineItems }     from '../services/ReportingRepository';
import { getReportableUsers }   from '../services/getReportableUsers';
import { getEarliestItemDate }  from '../services/getEarliestItemDate';
import { reportingKeys }        from '../hooks/reportingKeys';
import { useCurrentDbUser }     from '@/features/auth/hooks/useCurrentDbUser';

type View = 'monthly' | 'quarterly' | 'cumulative';

function useFilters(earliestDate?: string | null) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const now          = new Date();
  const today        = now.toISOString().split('T')[0];

  const view = (searchParams.get('view') as View) ?? 'monthly';

  function defaultFrom(v: View): string {
    if (v === 'cumulative') return '';
    // Use the user's earliest item date when available, otherwise start of last year
    return earliestDate
      ?? new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1)).toISOString().split('T')[0];
  }

  const from       = searchParams.get('from') ?? defaultFrom(view);
  const to         = searchParams.get('to')   ?? today;
  const targetUser = searchParams.get('userId') ?? undefined;

  function update(updates: { view?: View; from?: string | null; to?: string | null; userId?: string | undefined }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.view !== undefined) {
      params.set('view', updates.view);
      // Reset date range when switching view tabs
      params.delete('from');
      params.delete('to');
    }
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

  return { view, from, to, today, targetUser, update };
}

function RangeView({ from, to, targetUser }: { from: string; to: string; targetUser?: string }) {
  const year = new Date(from).getUTCFullYear();

  const { data: report, isLoading } = useRangeReport(from, to, targetUser);
  const { data: allMonths }         = useAllMonthlyReports(year, targetUser);
  const { data: lineItems = [] }    = useQuery({
    queryKey: [...reportingKeys.all, 'line-items', from, to, targetUser ?? 'self'],
    queryFn: () => {
      const start  = new Date(from);
      const toDate = new Date(to);
      const end    = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate() + 1));
      return getSaleLineItems(start, end, targetUser);
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading || !report) return <ReportingSkeleton />;
  const profitTrend = report.profit > 0 ? 'positive' : report.profit < 0 ? 'negative' : 'neutral';
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard label="Revenue"    value={formatCurrency(report.revenue)} />
        <KPICard label="Costs"      value={formatCurrency(report.costs)} trend="negative" />
        <KPICard label="Profit"     value={formatCurrency(report.profit)} trend={profitTrend} />
        <KPICard label="Items sold" value={String(report.itemsSold)} />
      </div>
      {allMonths && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">{year} overview</p>
          <RevenueChart data={allMonths} />
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Sales in period</p>
        <ProfitTable items={lineItems} />
      </div>
    </div>
  );
}

function CumulativeView({ targetUser }: { targetUser?: string }) {
  const { data: report, isLoading } = useCumulativeReport(targetUser);
  const { data: lineItems = [] }    = useQuery({
    queryKey: [...reportingKeys.all, 'line-items', 'all', targetUser ?? 'self'],
    queryFn:  () => getSaleLineItems(new Date(0), null, targetUser),
    staleTime: 5 * 60_000,
  });
  if (isLoading || !report) return <ReportingSkeleton count={5} />;
  const profitTrend = report.profit > 0 ? 'positive' : report.profit < 0 ? 'negative' : 'neutral';
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KPICard label="Revenue"     value={formatCurrency(report.revenue)} />
        <KPICard label="Costs"       value={formatCurrency(report.costs)} trend="negative" />
        <KPICard label="Profit"      value={formatCurrency(report.profit)} trend={profitTrend} />
        <KPICard label="Items sold"  value={String(report.itemsSold)} />
        <KPICard label="Avg storage" value={`${report.avgStorageDays}d`} />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">All sales</p>
        <ProfitTable items={lineItems} />
      </div>
    </div>
  );
}

function ReportingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
          <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
          <div className="h-7 w-24 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ReportingPage() {
  const { data: currentUser } = useCurrentDbUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data: reportableUsers } = useQuery({
    queryKey: ['admin', 'reportable-users'],
    queryFn:  getReportableUsers,
    enabled:  isAdmin,
    staleTime: 60_000,
  });

  const searchParams   = useSearchParams();
  const urlTargetUser  = searchParams.get('userId') ?? undefined;

  const { data: earliestDate } = useQuery({
    queryKey: ['earliest-item-date', urlTargetUser ?? 'self'],
    queryFn:  () => getEarliestItemDate(urlTargetUser),
    staleTime: 5 * 60_000,
    enabled: !isAdmin || !!urlTargetUser,
  });

  const { view, from, to, today, targetUser, update } = useFilters(earliestDate ?? undefined);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">Reporting</h1>
          <Link
            href="/dashboard/reporting/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-3 py-1 transition-colors hover:border-gray-400"
          >
            Dashboard →
          </Link>
        </div>
        {isAdmin && reportableUsers && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Viewing:</span>
            <select
              value={targetUser ?? ''}
              onChange={(e) => update({ userId: e.target.value || undefined, from: null, to: null })}
              className="border rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">— select user —</option>
              {reportableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isAdmin && !targetUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          Select a user above to view their report.
        </div>
      )}

      {(!isAdmin || targetUser) && (
        <>
          {/* ── View tabs ── */}
          <div className="flex gap-1 border-b border-gray-200">
            {(['monthly', 'quarterly', 'cumulative'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => update({ view: v })}
                className={[
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                  view === v ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {v}
              </button>
            ))}
          </div>

          {/* ── Date range filter (hidden for Cumulative) ── */}
          {view !== 'cumulative' && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">From:</span>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => update({ from: e.target.value })}
                className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
              <span className="text-xs text-gray-500 font-medium">To:</span>
              <input
                type="date"
                value={to}
                min={from}
                onChange={(e) => update({ to: e.target.value })}
                className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          {/* ── Content ── */}
          {view !== 'cumulative' && <RangeView from={from} to={to} targetUser={targetUser} />}
          {view === 'cumulative'  && <CumulativeView targetUser={targetUser} />}
        </>
      )}
    </div>
  );
}
