export type LeaderboardBadge = {
  slug: string;
  tier: string;
};

export type LeaderboardEntry = {
  id:          string;
  email:       string;
  displayName: string | null;
  itemCount:   number;
  soldCount:   number;
  totalProfit: number;
  /** Positions gained (+) or lost (−) vs last Sunday midnight. 0 = unchanged. */
  rankChange:  number;
  topBadges:   LeaderboardBadge[];
};

export type LeaderboardResult = {
  entries:      LeaderboardEntry[];
  instanceName: string | null;
  startsAt:     Date | null;
  endsAt:       Date | null;
};
