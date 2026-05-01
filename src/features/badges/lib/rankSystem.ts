export type UserRank = {
  title:         string;
  icon:          string;
  nextThreshold: number | null;
  level:         number;
};

const RANKS = [
  { title: 'Einsteiger',         icon: '⚪', threshold: 0,      level: 1 },
  { title: 'Händler',            icon: '🟤', threshold: 100,    level: 2 },
  { title: 'Erfahrener Händler', icon: '🟡', threshold: 500,    level: 3 },
  { title: 'Profi',              icon: '🟠', threshold: 2_000,  level: 4 },
  { title: 'Elite',              icon: '🔴', threshold: 5_000,  level: 5 },
  { title: 'Legende',            icon: '💎', threshold: 15_000, level: 6 },
] as const;

export function getUserRank(totalProfit: number): UserRank {
  let current: typeof RANKS[number] = RANKS[0];
  for (const rank of RANKS) {
    if (totalProfit >= rank.threshold) current = rank;
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
