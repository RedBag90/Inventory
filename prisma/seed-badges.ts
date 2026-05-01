import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BADGES = [
  // INVENTORY
  { slug: 'first-item',  category: 'INVENTORY', tier: 'BRONZE', sortOrder: 1,  criteria: { type: 'items_bought', threshold: 1  } },
  { slug: 'buyer-10',    category: 'INVENTORY', tier: 'BRONZE', sortOrder: 2,  criteria: { type: 'items_bought', threshold: 10 } },
  { slug: 'buyer-25',    category: 'INVENTORY', tier: 'SILVER', sortOrder: 3,  criteria: { type: 'items_bought', threshold: 25 } },
  { slug: 'buyer-50',    category: 'INVENTORY', tier: 'GOLD',   sortOrder: 4,  criteria: { type: 'items_bought', threshold: 50 } },
  // SALES
  { slug: 'first-sale',  category: 'SALES',     tier: 'BRONZE', sortOrder: 10, criteria: { type: 'items_sold', threshold: 1  } },
  { slug: 'seller-10',   category: 'SALES',     tier: 'BRONZE', sortOrder: 11, criteria: { type: 'items_sold', threshold: 10 } },
  { slug: 'seller-25',   category: 'SALES',     tier: 'SILVER', sortOrder: 12, criteria: { type: 'items_sold', threshold: 25 } },
  { slug: 'seller-50',   category: 'SALES',     tier: 'GOLD',   sortOrder: 13, criteria: { type: 'items_sold', threshold: 50 } },
  // PROFIT
  { slug: 'profit-100',  category: 'PROFIT',    tier: 'BRONZE', sortOrder: 20, criteria: { type: 'total_profit', threshold: 100   } },
  { slug: 'profit-500',  category: 'PROFIT',    tier: 'SILVER', sortOrder: 21, criteria: { type: 'total_profit', threshold: 500   } },
  { slug: 'profit-1000', category: 'PROFIT',    tier: 'GOLD',   sortOrder: 22, criteria: { type: 'total_profit', threshold: 1000  } },
  { slug: 'profit-5000', category: 'PROFIT',    tier: 'GOLD',   sortOrder: 23, criteria: { type: 'total_profit', threshold: 5000  } },
  // EFFICIENCY
  { slug: 'speed-3d',    category: 'EFFICIENCY', tier: 'BRONZE', sortOrder: 30, criteria: { type: 'speed_days', threshold: 3 } },
  { slug: 'speed-1d',    category: 'EFFICIENCY', tier: 'SILVER', sortOrder: 31, criteria: { type: 'speed_days', threshold: 1 } },
  // LEADERBOARD
  { slug: 'top-3',       category: 'LEADERBOARD', tier: 'SILVER', sortOrder: 40, criteria: { type: 'leaderboard_rank', threshold: 3 } },
  { slug: 'champion',    category: 'LEADERBOARD', tier: 'GOLD',   sortOrder: 41, criteria: { type: 'leaderboard_rank', threshold: 1 } },
  // ENGAGEMENT
  { slug: 'display-name', category: 'ENGAGEMENT', tier: 'BRONZE', sortOrder: 50, criteria: { type: 'engagement', event: 'display_name_set' } },
  { slug: 'tutorial-done', category: 'ENGAGEMENT', tier: 'BRONZE', sortOrder: 51, criteria: { type: 'engagement', event: 'tutorial_done' } },
  // STREAK
  { slug: 'streak-2w',  category: 'STREAK', tier: 'BRONZE', sortOrder: 60, criteria: { type: 'sales_streak', threshold: 2 } },
  { slug: 'streak-4w',  category: 'STREAK', tier: 'SILVER', sortOrder: 61, criteria: { type: 'sales_streak', threshold: 4 } },
  { slug: 'streak-8w',  category: 'STREAK', tier: 'GOLD',   sortOrder: 62, criteria: { type: 'sales_streak', threshold: 8 } },
  // BIG_DEAL
  { slug: 'deal-50',   category: 'BIG_DEAL', tier: 'BRONZE', sortOrder: 70, criteria: { type: 'single_deal_profit', threshold: 50   } },
  { slug: 'deal-100',  category: 'BIG_DEAL', tier: 'SILVER', sortOrder: 71, criteria: { type: 'single_deal_profit', threshold: 100  } },
  { slug: 'deal-250',  category: 'BIG_DEAL', tier: 'GOLD',   sortOrder: 72, criteria: { type: 'single_deal_profit', threshold: 250  } },
  // PORTFOLIO
  { slug: 'stock-5',   category: 'PORTFOLIO', tier: 'BRONZE', sortOrder: 80, criteria: { type: 'portfolio_size', threshold: 5  } },
  { slug: 'stock-10',  category: 'PORTFOLIO', tier: 'SILVER', sortOrder: 81, criteria: { type: 'portfolio_size', threshold: 10 } },
  { slug: 'stock-25',  category: 'PORTFOLIO', tier: 'GOLD',   sortOrder: 82, criteria: { type: 'portfolio_size', threshold: 25 } },
] as const;

export async function seedBadges() {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where:  { slug: badge.slug },
      update: { category: badge.category as any, tier: badge.tier as any, criteria: badge.criteria, sortOrder: badge.sortOrder },
      create: { slug: badge.slug, category: badge.category as any, tier: badge.tier as any, criteria: badge.criteria, sortOrder: badge.sortOrder },
    });
  }
  console.log(`Seeded ${BADGES.length} badges.`);
}

seedBadges()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
