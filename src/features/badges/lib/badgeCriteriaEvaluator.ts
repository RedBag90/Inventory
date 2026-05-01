import type { BadgeCriteria } from '../types/badge.types';
import type { BadgeTrigger } from '../services/BadgeAwardService';

type UserStats = {
  itemsBought: number;
  itemsSold:   number;
  totalProfit: number;
};

export function evaluateCriteria(
  criteria: BadgeCriteria,
  trigger:  BadgeTrigger,
  stats:    UserStats,
): boolean {
  if (criteria.type === 'items_bought' && trigger.type === 'item_created') {
    return stats.itemsBought >= criteria.threshold;
  }
  if (criteria.type === 'items_sold' && trigger.type === 'sale_recorded') {
    return stats.itemsSold >= criteria.threshold;
  }
  if (criteria.type === 'total_profit' && trigger.type === 'sale_recorded') {
    return stats.totalProfit >= criteria.threshold;
  }
  if (criteria.type === 'speed_days' && trigger.type === 'sale_recorded' && !trigger.isQuickSell) {
    return trigger.storageDays !== undefined && trigger.storageDays <= criteria.threshold;
  }
  if (criteria.type === 'leaderboard_rank' && trigger.type === 'leaderboard_check') {
    return trigger.rank <= criteria.threshold;
  }
  if (criteria.type === 'engagement' && trigger.type === 'engagement') {
    return trigger.event === criteria.event;
  }
  if (criteria.type === 'sales_streak' && trigger.type === 'streak_check') {
    return trigger.streak >= criteria.threshold;
  }
  if (criteria.type === 'single_deal_profit' && trigger.type === 'sale_recorded') {
    return trigger.singleItemProfit !== undefined && trigger.singleItemProfit >= criteria.threshold;
  }
  if (criteria.type === 'portfolio_size' && trigger.type === 'item_created') {
    return trigger.currentStockCount !== undefined && trigger.currentStockCount >= criteria.threshold;
  }
  return false;
}
