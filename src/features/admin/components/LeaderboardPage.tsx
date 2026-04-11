'use client';

import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import { useOlympiads } from '@/features/olympiad/hooks/useOlympiads';
import { formatCurrency } from '@/shared/lib/utils';

// ── helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  const parts = name.split(/[@.\s]+/).filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function profitColor(v: number) {
  if (v > 0)  return 'text-emerald-600';
  if (v < 0)  return 'text-red-500';
  return 'text-gray-400';
}

// ── podium card ───────────────────────────────────────────────────────────────

function RankChange({ value }: { value: number }) {
  if (value === 0) return (
    <span className="inline-flex items-center justify-center text-gray-400 bg-gray-50 border border-gray-100 w-6 h-6 rounded-full">
      <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" />
      </svg>
    </span>
  );
  return value > 0 ? (
    <span className="inline-flex items-center justify-center text-emerald-700 bg-emerald-50 border border-emerald-100 w-6 h-6 rounded-full">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center text-red-600 bg-red-50 border border-red-100 w-6 h-6 rounded-full">
      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

type Entry = {
  id: string;
  email: string;
  displayName: string | null;
  itemCount: number;
  soldCount: number;
  totalProfit: number;
  rankChange: number;
};

// height encodes rank — gold tallest, bronze shortest
const PODIUM_CONFIG = [
  { rank: 2, medal: '🥈', bar: 'bg-slate-300',  card: 'bg-slate-50  border-slate-200',  order: 'order-first', h: 'h-[200px]' },
  { rank: 1, medal: '🥇', bar: 'bg-amber-400',  card: 'bg-amber-50  border-amber-300',  order: 'order-none',  h: 'h-[240px]' },
  { rank: 3, medal: '🥉', bar: 'bg-orange-300', card: 'bg-orange-50 border-orange-200', order: 'order-last',  h: 'h-[170px]' },
] as const;

function PodiumCard({ user, config }: { user: Entry; config: typeof PODIUM_CONFIG[number] }) {
  const label = user.displayName ?? user.email;
  return (
    <div className={[
      'relative flex flex-col items-center rounded-xl border overflow-hidden',
      config.card, config.h,
    ].join(' ')}>
      {/* coloured top bar */}
      <div className={['w-full h-1 shrink-0', config.bar].join(' ')} />


      {/* content */}
      <div className="flex flex-col items-center justify-center gap-1 flex-1 px-3 py-2 text-center min-w-0 w-full">
        {/* medal + avatar row */}
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{config.medal}</span>
          <span className="w-9 h-9 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {initials(label)}
          </span>
        </div>

        {/* name */}
        <div className="min-w-0 w-full">
          <p className="text-sm font-semibold text-gray-900 truncate">{label}</p>
          {user.displayName && (
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          )}
        </div>

        {/* profit */}
        <p className={['text-base font-bold tabular-nums', profitColor(user.totalProfit)].join(' ')}>
          {formatCurrency(user.totalProfit)}
        </p>

        {/* items · sold + rank change in one row */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 tabular-nums">
            {user.itemCount} Items · {user.soldCount} verk.
          </span>
          <RankChange value={user.rankChange} />
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const { data: me } = useCurrentDbUser();
  const isMasterAdmin = me?.role === 'MASTER_ADMIN';
  const [instanceOverride, setInstanceOverride] = useState<string | undefined>(undefined);
  const { data: olympiads } = useOlympiads();
  const { data: result, isLoading, isError } = useLeaderboard(instanceOverride);

  const ranked = result?.entries ?? [];
  const top3 = ranked.slice(0, 3);

  const subtitle = result?.instanceName
    ? `${result.instanceName}${result.startsAt && result.endsAt
        ? ` · ${new Date(result.startsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(result.endsAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : ''}`
    : 'Gewinn-Ranking · Veränderung seit letztem Sonntag';

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rangliste</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-sm text-gray-500">{subtitle}</p>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="inline-flex items-center justify-center text-emerald-700 bg-emerald-50 border border-emerald-100 w-5 h-5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" /></svg>
                </span>
                Aufgestiegen
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="inline-flex items-center justify-center text-red-600 bg-red-50 border border-red-100 w-5 h-5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" /></svg>
                </span>
                Abgestiegen
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="inline-flex items-center justify-center text-gray-400 bg-gray-50 border border-gray-100 w-5 h-5 rounded-full">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" /></svg>
                </span>
                Unverändert
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isMasterAdmin && olympiads && olympiads.length > 0 && (
            <select
              value={instanceOverride ?? ''}
              onChange={e => setInstanceOverride(e.target.value || undefined)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Meine Olympiade</option>
              {olympiads.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
          {ranked.length > 0 && (
            <span className="text-sm text-gray-400 font-medium">
              {ranked.length} Teilnehmer
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map((i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-100 bg-gray-50 h-48 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-sm text-red-600 py-8 text-center">Rangliste konnte nicht geladen werden.</div>
      )}

      {ranked.length > 0 && (
        <>
          {/* ── Podium ── */}
          <div className="grid grid-cols-3 gap-3 items-end">
            {PODIUM_CONFIG.map((config) => {
              const user = top3[config.rank - 1];
              if (!user) return <div key={config.rank} />;
              return (
                <PodiumCard
                  key={user.id}
                  user={user}
                  config={config}
                />
              );
            })}
          </div>

          {/* ── Full rankings list ── */}
          <div data-tutorial="leaderboard-table" className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid items-center gap-x-3 px-5 py-3 border-b border-gray-100 bg-gray-50 grid-cols-[2rem_1.5rem_2rem_1fr_5rem_5rem_7rem]">
              <span />
              <span />
              <span />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide pl-3">Name</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Items</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Verkauft</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Profit</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {ranked.map((user, i) => {
                const isMe = user.id === me?.id;
                const label = user.displayName ?? user.email;
                return (
                  <li
                    key={user.id}
                    className={[
                      'grid items-center gap-x-3 px-5 py-3.5 transition-colors',
                      'grid-cols-[2rem_1.5rem_2rem_1fr_5rem_5rem_7rem]',
                      isMe ? 'bg-amber-50/60' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {/* Rank */}
                    <span className="text-center">
                      {i === 0 ? <span className="text-lg">🥇</span>
                       : i === 1 ? <span className="text-lg">🥈</span>
                       : i === 2 ? <span className="text-lg">🥉</span>
                       : <span className="text-sm font-semibold text-gray-400 tabular-nums">{i + 1}</span>}
                    </span>

                    {/* Rank change */}
                    <span><RankChange value={user.rankChange} /></span>

                    {/* Avatar */}
                    <span className="w-8 h-8 rounded-full bg-gray-800 text-white text-xs font-semibold flex items-center justify-center">
                      {initials(label)}
                    </span>

                    {/* Name */}
                    <div className="min-w-0 pl-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                        {isMe && (
                          <span className="text-[10px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            Du
                          </span>
                        )}
                      </div>
                      {user.displayName && (
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      )}
                    </div>

                    {/* Items */}
                    <span className="text-sm text-gray-400 tabular-nums text-right">{user.itemCount} Items</span>

                    {/* Sold */}
                    <span className="text-sm text-gray-400 tabular-nums text-right">{user.soldCount} verk.</span>

                    {/* Profit */}
                    <span className={['text-sm font-bold tabular-nums text-right', profitColor(user.totalProfit)].join(' ')}>
                      {formatCurrency(user.totalProfit)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {!isLoading && ranked.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-16">Noch keine Einträge.</div>
      )}
    </div>
  );
}
