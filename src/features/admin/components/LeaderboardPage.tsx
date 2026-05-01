'use client';

import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import { useOlympiads } from '@/features/olympiad/hooks/useOlympiads';
import { useActiveOlympiad } from '@/features/olympiad/hooks/useActiveOlympiad';
import { formatCurrency } from '@/shared/lib/utils';
import { BadgeChip } from '@/features/badges/components/BadgeChip';
import { getUserRank } from '@/features/badges/lib/rankSystem';
import { useTranslations } from 'next-intl';

function initials(name: string) {
  const parts = name.split(/[@.\s]+/).filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function profitColor(v: number) {
  if (v > 0)  return 'text-emerald-600';
  if (v < 0)  return 'text-red-500';
  return 'text-slate-400';
}

function RankChange({ value }: { value: number }) {
  if (value === 0) return (
    <span className="inline-flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 w-6 h-6 rounded-full">
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
  badgeXP: number;
  rankChange: number;
  topBadges: { slug: string; tier: string }[];
};

const PODIUM_CONFIG = [
  { rank: 2, medal: '🥈', card: 'bg-gradient-to-b from-slate-50 to-slate-100 ring-1 ring-slate-300 shadow-md',                         avatarRing: 'ring-2 ring-slate-400 ring-offset-2',  rankNum: 'text-slate-300',  order: 'order-first', h: 'h-[210px]' },
  { rank: 1, medal: '🥇', card: 'bg-gradient-to-b from-amber-50 to-amber-100 ring-2 ring-amber-400 shadow-xl shadow-amber-200/60',      avatarRing: 'ring-2 ring-amber-400 ring-offset-2',  rankNum: 'text-amber-200',  order: 'order-none',  h: 'h-[250px]' },
  { rank: 3, medal: '🥉', card: 'bg-gradient-to-b from-orange-50 to-orange-100 ring-1 ring-orange-300 shadow-lg shadow-orange-100/60',  avatarRing: 'ring-2 ring-orange-400 ring-offset-2', rankNum: 'text-orange-200', order: 'order-last',  h: 'h-[180px]' },
] as const;

function PodiumCard({ user, config }: { user: Entry; config: typeof PODIUM_CONFIG[number] }) {
  const label = user.displayName ?? user.email;
  return (
    <div className={[
      'relative flex flex-col items-center rounded-2xl overflow-hidden',
      config.card, config.h,
    ].join(' ')}>
      {/* Background rank number */}
      <span className={['absolute bottom-1 right-3 text-7xl font-black select-none pointer-events-none leading-none', config.rankNum].join(' ')}>
        {config.rank}
      </span>

      <div className="relative flex flex-col items-center justify-center gap-2 flex-1 px-4 py-3 text-center min-w-0 w-full">
        <span className="text-3xl leading-none">{config.medal}</span>

        <span className={['w-11 h-11 rounded-full bg-indigo-700 text-white text-sm font-bold flex items-center justify-center shrink-0', config.avatarRing].join(' ')}>
          {initials(label)}
        </span>

        <div className="min-w-0 w-full">
          <p className="text-sm font-semibold text-slate-900 truncate">{label}</p>
          {user.displayName && (
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          )}
        </div>

        <p className={['text-base font-bold tabular-nums', profitColor(user.totalProfit)].join(' ')}>
          {formatCurrency(user.totalProfit)}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 tabular-nums">
            {user.itemCount} Items · {user.soldCount} verk.
          </span>
          <RankChange value={user.rankChange} />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const tb = useTranslations('badges');
  const { data: me } = useCurrentDbUser();
  const isMasterAdmin = me?.role === 'MASTER_ADMIN';

  const [masterOverride, setMasterOverride] = useState<string | undefined>(undefined);
  const { data: olympiads } = useOlympiads();

  const { active } = useActiveOlympiad();
  const instanceOverride = isMasterAdmin ? masterOverride : (active?.instanceId ?? undefined);

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

      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Rangliste</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-sm text-slate-500">{subtitle}</p>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span className="inline-flex items-center justify-center text-emerald-700 bg-emerald-50 border border-emerald-100 w-5 h-5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" /></svg>
                </span>
                Aufgestiegen
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span className="inline-flex items-center justify-center text-red-600 bg-red-50 border border-red-100 w-5 h-5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" /></svg>
                </span>
                Abgestiegen
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span className="inline-flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 w-5 h-5 rounded-full">
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
              value={masterOverride ?? ''}
              onChange={e => setMasterOverride(e.target.value || undefined)}
              className="select-base w-auto"
            >
              <option value="">Meine Olympiade</option>
              {olympiads.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
          {ranked.length > 0 && (
            <span className="text-sm text-slate-400 font-medium">
              {ranked.length} Teilnehmer
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map((i) => (
            <div key={i} className="rounded-2xl border-2 border-slate-100 bg-slate-50 h-48 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-sm text-red-600 py-8 text-center">Rangliste konnte nicht geladen werden.</div>
      )}

      {ranked.length > 0 && (
        <>
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

          <div data-tutorial="leaderboard-table" className="card overflow-hidden">
            <div className="grid items-center gap-x-3 px-5 py-3 border-b border-slate-100 bg-slate-50 grid-cols-[2rem_1.5rem_2rem_1fr_5rem_5rem_7rem]">
              <span />
              <span />
              <span />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide pl-3">Name</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide text-right">Items</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide text-right">Verkauft</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide text-right">Profit</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {ranked.map((user, i) => {
                const isMe = user.id === me?.id;
                const label = user.displayName ?? user.email;
                return (
                  <li
                    key={user.id}
                    className={[
                      'grid items-center gap-x-3 px-5 py-3.5 transition-colors',
                      'grid-cols-[2rem_1.5rem_2rem_1fr_5rem_5rem_7rem]',
                      isMe ? 'bg-indigo-50' : 'hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className="text-center">
                      {i === 0 ? <span className="text-lg">🥇</span>
                       : i === 1 ? <span className="text-lg">🥈</span>
                       : i === 2 ? <span className="text-lg">🥉</span>
                       : <span className="text-sm font-semibold text-slate-400 tabular-nums">{i + 1}</span>}
                    </span>

                    <span><RankChange value={user.rankChange} /></span>

                    <span className="w-8 h-8 rounded-full bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center">
                      {initials(label)}
                    </span>

                    <div className="min-w-0 pl-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-slate-900 truncate">{label}</p>
                        {isMe && (
                          <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            Du
                          </span>
                        )}
                        {user.topBadges.map((b) => (
                          <BadgeChip key={b.slug} slug={b.slug} tier={b.tier as 'BRONZE' | 'SILVER' | 'GOLD'} label={tb(`${b.slug}.name`)} size="sm" />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {user.displayName && (
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          {(() => { const r = getUserRank(user.badgeXP); return `${r.icon} ${r.title}`; })()}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm text-slate-400 tabular-nums text-right">{user.itemCount} Items</span>
                    <span className="text-sm text-slate-400 tabular-nums text-right">{user.soldCount} verk.</span>
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
        <div className="text-sm text-slate-400 text-center py-16">Noch keine Einträge.</div>
      )}
    </div>
  );
}
