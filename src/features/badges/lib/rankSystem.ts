export type UserRank = {
  title:         string;
  icon:          string;
  nextThreshold: number | null;
  level:         number;
};

export const RANKS = [
  { title: 'Neuling',               icon: '⚪', threshold: 0,     level: 1 },
  { title: 'Bronzehändler',         icon: '🟤', threshold: 100,   level: 2 },
  { title: 'Silberhändler',         icon: '🟡', threshold: 400,   level: 3 },
  { title: 'Goldmakler',            icon: '🟠', threshold: 950,   level: 4 },
  { title: 'Platin-Guru',           icon: '🔴', threshold: 2_000, level: 5 },
  { title: 'Flohmarkt-Olympier',    icon: '💎', threshold: 4_500, level: 6 },
] as const;

export function getUserRank(totalXP: number): UserRank {
  let current: typeof RANKS[number] = RANKS[0];
  for (const rank of RANKS) {
    if (totalXP >= rank.threshold) current = rank;
  }
  const nextIdx = RANKS.findIndex((r) => r.level === current.level) + 1;
  const next = nextIdx < RANKS.length ? RANKS[nextIdx] : null;
  return {
    title:         current.title,
    icon:          current.icon,
    level:         current.level,
    nextThreshold: next?.threshold ?? null,
  };
}
