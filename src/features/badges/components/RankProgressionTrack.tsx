'use client';

import { RANKS, getUserRank } from '../lib/rankSystem';

type Props = {
  totalXP: number;
};

export function RankProgressionTrack({ totalXP }: Props) {
  const current = getUserRank(totalXP);

  return (
    <div className="relative py-2">
      {/* Vertical connecting line */}
      <div className="absolute left-1/2 inset-y-0 w-px bg-slate-200 -translate-x-1/2" />

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
            className="relative grid grid-cols-[1fr_5rem_1fr] items-center gap-4 mb-10 last:mb-0"
          >
            {/* Left: requirement */}
            <div className="text-right pr-4">
              {rank.threshold === 0 ? (
                <span className="text-sm italic text-slate-400">Startpunkt</span>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">
                    Voraussetzung
                  </p>
                  <p className={`text-sm font-semibold ${isAchieved ? 'text-slate-700' : 'text-slate-400'}`}>
                    {rank.threshold} XP
                  </p>
                </>
              )}
            </div>

            {/* Center: icon circle + title */}
            <div className={`flex flex-col items-center gap-1.5 z-10 ${!isAchieved ? 'opacity-40' : ''}`}>
              <div className={[
                'w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-white ring-2 transition-all',
                isCurrent  ? 'ring-indigo-500 ring-offset-2 shadow-lg shadow-indigo-100' : '',
                isAchieved && !isCurrent ? 'ring-amber-400 shadow-md' : '',
                !isAchieved ? 'ring-slate-200' : '',
              ].join(' ')}>
                {rank.icon}
              </div>
              <p className={`text-xs font-semibold text-center leading-tight ${isAchieved ? 'text-slate-800' : 'text-slate-400'}`}>
                {rank.title}
              </p>
            </div>

            {/* Right: XP chip + description + progress */}
            <div className="pl-4 space-y-1">
              {rank.threshold > 0 && (
                <span className={[
                  'inline-block text-xs font-bold px-2 py-0.5 rounded-full',
                  isAchieved ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400',
                ].join(' ')}>
                  {rank.threshold} XP
                </span>
              )}
              <p className={`text-sm leading-snug ${isAchieved ? 'text-slate-600' : 'text-slate-400'}`}>
                {rank.description}
              </p>
              {isCurrent && nextRank && progress !== null && (
                <div className="space-y-0.5 pt-1">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden w-36">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-indigo-500 font-medium">
                    {totalXP} / {nextRank.threshold} XP
                  </p>
                </div>
              )}
              {isCurrent && !nextRank && (
                <p className="text-[10px] text-amber-600 font-medium">{totalXP} XP — Maximum erreicht!</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
