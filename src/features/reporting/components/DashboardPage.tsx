'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useDashboardData }    from '../hooks/useDashboardData';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { useCurrentDbUser }    from '@/features/auth/hooks/useCurrentDbUser';
import { getReportableUsers }  from '../services/getReportableUsers';
import { getEarliestItemDate } from '../services/getEarliestItemDate';
import {
  generatePeriods, getItemsMeta,
  toBenefitVelocityData, toCostDistributionData, toRoiData,
  toGainedValueData, toCumulativeCostData, toCashFlowData, toBreakEvenData,
} from '../lib/dashboardUtils';
import { BenefitVelocityChart } from './charts/BenefitVelocityChart';
import { CostDistributionChart } from './charts/CostDistributionChart';
import { RoiChart }              from './charts/RoiChart';
import { GainedValueChart }      from './charts/GainedValueChart';
import { CumulativeCostChart }   from './charts/CumulativeCostChart';
import { CashFlowChart }         from './charts/CashFlowChart';
import { BreakEvenChart }        from './charts/BreakEvenChart';

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      {children}
    </div>
  );
}

function PanelSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
      <div className="h-3 w-32 bg-gray-200 rounded mb-4" />
      <div className={`bg-gray-100 rounded`} style={{ height }} />
    </div>
  );
}

export function DashboardPage() {
  const { data: currentUser } = useCurrentDbUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data: reportableUsers } = useQuery({
    queryKey: ['admin', 'reportable-users'],
    queryFn:  getReportableUsers,
    enabled:  isAdmin,
    staleTime: 60_000,
  });

  // Read targetUser from URL before filters are fully initialised (needed for the earliest-date query)
  const searchParams = useSearchParams();
  const urlTargetUser = searchParams.get('userId') ?? undefined;

  const { data: earliestDate } = useQuery({
    queryKey: ['earliest-item-date', urlTargetUser ?? 'self'],
    queryFn:  () => getEarliestItemDate(urlTargetUser),
    staleTime: 5 * 60_000,
    // Only fetch for admins once a target user is selected, or always for regular users
    enabled: !isAdmin || !!urlTargetUser,
  });

  const { filters, update } = useDashboardFilters(earliestDate ?? undefined);
  const { granularity, from, to, targetUser } = filters;

  const { data: sales = [], isLoading, isError } = useDashboardData(from, to, targetUser);

  // All chart data derived client-side — only recomputes when inputs change
  const periods = useMemo(() => generatePeriods(from, to, granularity), [from, to, granularity]);
  const items   = useMemo(() => getItemsMeta(sales), [sales]);

  const benefitVelocity  = useMemo(() => toBenefitVelocityData(sales, periods, items, granularity), [sales, periods, items, granularity]);
  const costDistribution = useMemo(() => toCostDistributionData(sales, periods, items, granularity), [sales, periods, items, granularity]);
  const roiData          = useMemo(() => toRoiData(sales, periods, granularity), [sales, periods, granularity]);
  const gainedValue      = useMemo(() => toGainedValueData(sales, periods, items, granularity), [sales, periods, items, granularity]);
  const cumulativeCost   = useMemo(() => toCumulativeCostData(sales, periods, items, granularity), [sales, periods, items, granularity]);
  const cashFlow         = useMemo(() => toCashFlowData(sales, periods, granularity), [sales, periods, granularity]);
  const breakEven        = useMemo(() => toBreakEvenData(sales, periods, granularity), [sales, periods, granularity]);

  const today = new Date().toISOString().split('T')[0];
  const showContent = !isAdmin || !!targetUser;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/reporting"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Overview
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
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

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
        {/* Granularity toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Granularity:</span>
          <div className="flex rounded-md border border-gray-200 overflow-hidden text-sm">
            {(['quarterly', 'monthly'] as const).map((g) => (
              <button
                key={g}
                onClick={() => update({ granularity: g })}
                className={[
                  'px-3 py-1.5 font-medium transition-colors capitalize',
                  granularity === g ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-sm">
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
            max={today}
            onChange={(e) => update({ to: e.target.value })}
            className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {isLoading && (
          <span className="text-xs text-gray-400 ml-auto">Loading…</span>
        )}
      </div>

      {/* ── Error state ── */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          Failed to load dashboard data. Please try refreshing the page.
        </div>
      )}

      {/* ── Admin warning ── */}
      {isAdmin && !targetUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          Select a user above to view their dashboard.
        </div>
      )}

      {/* ── Charts + Legend ── */}
      {showContent && (
        <div className="flex gap-4 items-start">
          {/* Charts */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Top row: 3 panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  <PanelSkeleton />
                  <PanelSkeleton />
                  <PanelSkeleton />
                </>
              ) : (
                <>
                  <ChartCard title="Benefit Velocity">
                    <BenefitVelocityChart
                      data={benefitVelocity.data}
                      items={items}
                      avgCostLine={benefitVelocity.avgCostLine}
                    />
                  </ChartCard>
                  <ChartCard title="Cost Distribution">
                    <CostDistributionChart
                      data={costDistribution.data}
                      items={items}
                      avgCostLine={costDistribution.avgCostLine}
                    />
                  </ChartCard>
                  <ChartCard title="ROI — Revenue vs Costs">
                    <RoiChart data={roiData} />
                  </ChartCard>
                </>
              )}
            </div>

            {/* Bottom row: 4 panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <>
                  <PanelSkeleton height={220} />
                  <PanelSkeleton height={220} />
                  <PanelSkeleton height={220} />
                  <PanelSkeleton height={220} />
                </>
              ) : (
                <>
                  <ChartCard title="Gained Value Analysis">
                    <GainedValueChart data={gainedValue} items={items} />
                  </ChartCard>
                  <ChartCard title="Cost Analysis">
                    <CumulativeCostChart data={cumulativeCost} items={items} />
                  </ChartCard>
                  <ChartCard title="Cash Flow">
                    <CashFlowChart data={cashFlow} />
                  </ChartCard>
                  <ChartCard title="Break-Even Analysis">
                    <BreakEvenChart
                      data={breakEven.data}
                      breakEvenPeriod={breakEven.breakEvenPeriod}
                    />
                  </ChartCard>
                </>
              )}
            </div>
          </div>

          {/* Shared legend sidebar */}
          {!isLoading && items.length > 0 && (
            <div className="w-40 shrink-0 sticky top-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Artikel</p>
                <ul className="space-y-2.5">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-700 leading-tight break-words">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
