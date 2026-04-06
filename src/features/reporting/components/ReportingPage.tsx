'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMonthlyReport } from '../hooks/useMonthlyReport';
import { useQuarterlyReport } from '../hooks/useQuarterlyReport';
import { useCumulativeReport } from '../hooks/useCumulativeReport';
import { useAllMonthlyReports } from '../hooks/useAllMonthlyReports';
import { KPICard } from './KPICard';
import { RevenueChart } from './RevenueChart';
import { ProfitTable } from './ProfitTable';
import { formatCurrency } from '@/shared/lib/utils';
import { getSaleLineItems } from '../services/ReportingRepository';
import { getReportableUsers } from '../services/getReportableUsers';
import { reportingKeys } from '../hooks/reportingKeys';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';

type View = 'monthly' | 'quarterly' | 'cumulative';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const QUARTERS = [{ label: 'Q1', value: 1 }, { label: 'Q2', value: 2 }, { label: 'Q3', value: 3 }, { label: 'Q4', value: 4 }] as const;

function useFilters() {
  const searchParams = useSearchParams();
  const now = new Date();
  return {
    view:       (searchParams.get('view') as View) ?? 'monthly',
    year:       parseInt(searchParams.get('year')    ?? String(now.getFullYear()), 10),
    month:      parseInt(searchParams.get('month')   ?? String(now.getMonth() + 1), 10),
    quarter:    parseInt(searchParams.get('quarter') ?? String(Math.ceil((now.getMonth() + 1) / 3)), 10) as 1|2|3|4,
    targetUser: searchParams.get('userId') ?? undefined,
  };
}

function MonthlyView({ year, month, targetUser }: { year: number; month: number; targetUser?: string }) {
  const { data: report, isLoading } = useMonthlyReport(year, month, targetUser);
  const { data: allMonths }         = useAllMonthlyReports(year, targetUser);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end   = new Date(Date.UTC(year, month, 1));
  const { data: lineItems = [] } = useQuery({
    queryKey: [...reportingKeys.all, 'line-items', start.toISOString(), end.toISOString(), targetUser ?? 'self'],
    queryFn:  () => getSaleLineItems(start, end, targetUser),
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
      {allMonths && <div className="bg-white rounded-lg border border-gray-200 p-5"><p className="text-sm font-semibold text-gray-700 mb-4">{year} overview</p><RevenueChart data={allMonths} /></div>}
      <div className="bg-white rounded-lg border border-gray-200 p-5"><p className="text-sm font-semibold text-gray-700 mb-4">Sales this month</p><ProfitTable items={lineItems} /></div>
    </div>
  );
}

function QuarterlyView({ year, quarter, targetUser }: { year: number; quarter: 1|2|3|4; targetUser?: string }) {
  const { data: report, isLoading } = useQuarterlyReport(year, quarter, targetUser);
  const { data: allMonths }         = useAllMonthlyReports(year, targetUser);
  const startMonth = (quarter - 1) * 3;
  const start = new Date(Date.UTC(year, startMonth, 1));
  const end   = new Date(Date.UTC(year, startMonth + 3, 1));
  const { data: lineItems = [] } = useQuery({
    queryKey: [...reportingKeys.all, 'line-items', start.toISOString(), end.toISOString(), targetUser ?? 'self'],
    queryFn:  () => getSaleLineItems(start, end, targetUser),
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
      {allMonths && <div className="bg-white rounded-lg border border-gray-200 p-5"><p className="text-sm font-semibold text-gray-700 mb-4">{year} overview</p><RevenueChart data={allMonths} /></div>}
      <div className="bg-white rounded-lg border border-gray-200 p-5"><p className="text-sm font-semibold text-gray-700 mb-4">Sales this quarter</p><ProfitTable items={lineItems} /></div>
    </div>
  );
}

function CumulativeView({ targetUser }: { targetUser?: string }) {
  const { data: report, isLoading } = useCumulativeReport(targetUser);
  const { data: lineItems = [] } = useQuery({
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
      <div className="bg-white rounded-lg border border-gray-200 p-5"><p className="text-sm font-semibold text-gray-700 mb-4">All sales</p><ProfitTable items={lineItems} /></div>
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
  const router   = useRouter();
  const pathname = usePathname();
  const { view, year, month, quarter, targetUser } = useFilters();
  const { data: currentUser } = useCurrentDbUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data: reportableUsers } = useQuery({
    queryKey: ['admin', 'reportable-users'],
    queryFn:  getReportableUsers,
    enabled:  isAdmin,
    staleTime: 60_000,
  });

  function updateParams(updates: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const nextView = (updates.view as string) ?? view;
    params.set('view', nextView);
    params.set('year', String(updates.year ?? year));
    if (nextView === 'monthly')   params.set('month',   String(updates.month   ?? month));
    if (nextView === 'quarterly') params.set('quarter', String(updates.quarter ?? quarter));
    const nextUser = updates.userId !== undefined ? updates.userId as string : targetUser;
    if (nextUser) params.set('userId', nextUser);
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-3">
          {isAdmin && reportableUsers && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Viewing:</span>
              <select
                value={targetUser ?? ''}
                onChange={(e) => updateParams({ userId: e.target.value || undefined })}
                className="border rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">— select user —</option>
                {reportableUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>
            </div>
          )}
          <select
            value={year}
            onChange={(e) => updateParams({ year: parseInt(e.target.value, 10) })}
            className="border rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {isAdmin && !targetUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          Select a user above to view their report.
        </div>
      )}

      {(!isAdmin || targetUser) && (
        <>
          <div className="flex gap-1 border-b border-gray-200">
            {(['monthly', 'quarterly', 'cumulative'] as View[]).map((v) => (
              <button key={v} onClick={() => updateParams({ view: v })}
                className={['px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize', view === v ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'].join(' ')}>
                {v}
              </button>
            ))}
          </div>

          {view === 'monthly' && (
            <div className="flex flex-wrap gap-2">
              {MONTH_NAMES.map((name, i) => (
                <button key={i} onClick={() => updateParams({ month: i + 1 })}
                  className={['px-3 py-1.5 rounded-md text-sm font-medium transition-colors', month === i + 1 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'].join(' ')}>
                  {name.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {view === 'quarterly' && (
            <div className="flex gap-2">
              {QUARTERS.map((q) => (
                <button key={q.value} onClick={() => updateParams({ quarter: q.value })}
                  className={['px-5 py-2 rounded-md text-sm font-medium transition-colors', quarter === q.value ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'].join(' ')}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {view === 'monthly'    && <MonthlyView   year={year} month={month} targetUser={targetUser} />}
          {view === 'quarterly'  && <QuarterlyView year={year} quarter={quarter} targetUser={targetUser} />}
          {view === 'cumulative' && <CumulativeView targetUser={targetUser} />}
        </>
      )}
    </div>
  );
}
