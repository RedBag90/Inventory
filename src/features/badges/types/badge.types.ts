export type BadgeCategory = 'SALES' | 'PROFIT' | 'EFFICIENCY' | 'INVENTORY' | 'LEADERBOARD' | 'ENGAGEMENT' | 'SPECIAL';
export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD';

export type BadgeCriteria =
  | { type: 'items_sold';       threshold: number }
  | { type: 'total_profit';     threshold: number }
  | { type: 'items_bought';     threshold: number }
  | { type: 'speed_days';       threshold: number }
  | { type: 'leaderboard_rank'; threshold: number }
  | { type: 'engagement';       event: string }
  | { type: 'manual' };

export type BadgeDefinition = {
  id:        string;
  slug:      string;
  category:  BadgeCategory;
  tier:      BadgeTier;
  criteria:  BadgeCriteria;
  sortOrder: number;
};

export type AwardedBadge = BadgeDefinition & {
  unlockedAt: Date;
};

export type UserBadgeWithDefinition = {
  id:         string;
  unlockedAt: Date;
  badge:      BadgeDefinition;
};

export type BadgesPageData = {
  all:   BadgeDefinition[];
  earned: UserBadgeWithDefinition[];
};
