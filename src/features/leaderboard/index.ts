// Public API — only import from here, never from internal paths.

// Types
export type { LeaderboardEntry, LeaderboardBadge, LeaderboardResult } from './types/leaderboard.types';

// Server action (public entry point)
export { getLeaderboardData } from './actions/getLeaderboardData';

// Client hook
export { useLeaderboard } from './hooks/useLeaderboard';
export { leaderboardKeys } from './hooks/leaderboardKeys';

// Time helpers (used by cron + emails)
export { thisSundayMidnightUTC, lastSundayMidnightUTC } from './services/computeLeaderboard';

// Token helpers
export { signOptOutToken, verifyOptOutToken } from './services/digestToken';

// Email builder
export { buildWeeklyDigestEmail } from './emails/weeklyDigestEmail';
