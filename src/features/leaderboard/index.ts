// Public API — only import from here, never from internal paths.

// Types
export type { LeaderboardEntry, LeaderboardBadge, LeaderboardResult } from './types/leaderboard.types';

// Services
export { computeLeaderboardForInstance, thisSundayMidnightUTC, lastSundayMidnightUTC } from './services/computeLeaderboard';

// Token helpers
export { signOptOutToken, verifyOptOutToken } from './services/digestToken';

// Email builder
export { buildWeeklyDigestEmail } from './emails/weeklyDigestEmail';
