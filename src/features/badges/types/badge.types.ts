import { z } from 'zod';

export type BadgeCategory = 'SALES' | 'PROFIT' | 'EFFICIENCY' | 'INVENTORY' | 'LEADERBOARD' | 'ENGAGEMENT' | 'SPECIAL' | 'STREAK' | 'PORTFOLIO' | 'BIG_DEAL';
export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD';

export const BadgeCriteriaSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('items_sold'),         threshold: z.number() }),
  z.object({ type: z.literal('total_profit'),       threshold: z.number() }),
  z.object({ type: z.literal('items_bought'),       threshold: z.number() }),
  z.object({ type: z.literal('speed_days'),         threshold: z.number() }),
  z.object({ type: z.literal('leaderboard_rank'),   threshold: z.number() }),
  z.object({ type: z.literal('engagement'),         event:     z.string() }),
  z.object({ type: z.literal('manual') }),
  z.object({ type: z.literal('sales_streak'),       threshold: z.number() }),
  z.object({ type: z.literal('single_deal_profit'), threshold: z.number() }),
  z.object({ type: z.literal('portfolio_size'),     threshold: z.number() }),
]);

export type BadgeCriteria = z.infer<typeof BadgeCriteriaSchema>;

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
  all:    BadgeDefinition[];
  earned: UserBadgeWithDefinition[];
};
