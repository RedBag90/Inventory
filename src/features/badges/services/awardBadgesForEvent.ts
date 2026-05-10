'use server';

import { checkAndAwardBadges } from './BadgeAwardService';
import { checkLeaderboardBadges } from './leaderboardBadgeService';
import { checkStreakBadges } from './streakBadgeService';
import type { AwardedBadge } from '../types/badge.types';

export type BadgeEvent =
  | { type: 'sale_recorded'; userId: string; storageDays: number; singleItemProfit: number; isQuickSell?: boolean }
  | { type: 'item_created'; userId: string; currentStockCount: number }
  | { type: 'engagement'; userId: string; event: string };

export async function awardBadgesForEvent(event: BadgeEvent): Promise<AwardedBadge[]> {
  switch (event.type) {
    case 'sale_recorded': {
      const [sale, leaderboard, streak] = await Promise.all([
        checkAndAwardBadges({ type: 'sale_recorded', userId: event.userId, storageDays: event.storageDays, singleItemProfit: event.singleItemProfit, isQuickSell: event.isQuickSell }),
        checkLeaderboardBadges(event.userId),
        checkStreakBadges(event.userId),
      ]);
      return [...sale, ...leaderboard, ...streak];
    }
    case 'item_created':
      return checkAndAwardBadges({ type: 'item_created', userId: event.userId, currentStockCount: event.currentStockCount });
    case 'engagement':
      return checkAndAwardBadges({ type: 'engagement', userId: event.userId, event: event.event });
  }
}
