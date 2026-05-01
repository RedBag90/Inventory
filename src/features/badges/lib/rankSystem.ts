export type UserRank = {
  title:         string;
  icon:          string;
  description:   string;
  nextThreshold: number | null;
  level:         number;
};

export const RANKS = [
  { title: 'Neuling',            icon: '⚪', threshold: 0,     level: 1, description: 'Dein Einstieg in den Flohmarkt' },
  { title: 'Bronzehändler',      icon: '🟤', threshold: 100,   level: 2, description: 'Du hast deine ersten Abzeichen verdient' },
  { title: 'Silberhändler',      icon: '🟡', threshold: 400,   level: 3, description: 'Ein erfahrener Händler mit Stil' },
  { title: 'Goldmakler',         icon: '🟠', threshold: 950,   level: 4, description: 'Meisterhafte Handelsroutinen' },
  { title: 'Platin-Guru',        icon: '🔴', threshold: 2_000, level: 5, description: 'Legendäre Kontrolle über den Markt' },
  { title: 'Flohmarkt-Olympier', icon: '💎', threshold: 4_500, level: 6, description: 'Du hast alles erreicht — Olymp-Status' },
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
    description:   current.description,
    level:         current.level,
    nextThreshold: next?.threshold ?? null,
  };
}
