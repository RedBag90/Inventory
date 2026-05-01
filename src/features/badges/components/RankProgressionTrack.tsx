'use client';

import { RANKS, getUserRank } from '../lib/rankSystem';

type Props = {
  totalXP: number;
};

export function RankProgressionTrack({ totalXP }: Props) {
  const current = getUserRank(totalXP);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {RANKS.map((rank) => {
        const isAchieved = totalXP >= rank.threshold;
        const isCurrent  = rank.level === current.level;
        const nextRank   = RANKS.find((r) => r.level === rank.level + 1);
        const progress   = isCurrent && nextRank
          ? Math.min(100, Math.round(((totalXP - rank.threshold) / (nextRank.threshold - rank.threshold)) * 100))
          : null;

        return (
          <div
            key={rank.level}
            className={[
              'rounded-xl border p-4 flex flex-col items-center text-center gap-2 transition-opacity',
              isAchieved ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-40',
              isCurrent  ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
            ].join(' ')}
          >
            <div className={[
              'w-14 h-14 rounded-full flex items-center justify-center text-3xl ring-2',
              isAchieved ? 'ring-indigo-300 bg-indigo-50' : 'ring-slate-200 bg-slate-100',
            ].join(' ')}>
              {rank.icon}
            </div>

            <p className={`text-sm font-semibold leading-tight ${isAchieved ? 'text-slate-900' : 'text-slate-400'}`}>
              {rank.title}
            </p>

            <p className="text-xs text-slate-400">
              {rank.threshold === 0 ? 'Start' : `${rank.threshold} XP`}
            </p>

            {progress !== null && (
              <div className="w-full space-y-0.5">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-indigo-500 font-medium">{totalXP} / {nextRank!.threshold} XP</p>
              </div>
            )}

            {isCurrent && !nextRank && (
              <p className="text-[10px] text-indigo-500 font-medium">{totalXP} XP</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
