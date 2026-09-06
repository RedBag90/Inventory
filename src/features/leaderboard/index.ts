// Public API — only import from here, never from internal paths.

// Types
export type { LeaderboardEntry, LeaderboardBadge, LeaderboardResult } from './types/leaderboard.types';

// Server action — client-facing, GUARDED (membership or MASTER_ADMIN required).
export { getLeaderboardData } from './actions/getLeaderboardData';

// System path — UNGUARDED. Only for callers that carry their own authorization
// (weekly-digest cron via CRON_SECRET, admin preview which resolves membership itself).
// Not a server action, so it can never be reached from the browser.
export { computeLeaderboardForInstance } from './services/computeLeaderboard';

// Client hook
export { useLeaderboard } from './hooks/useLeaderboard';
export { leaderboardKeys } from './hooks/leaderboardKeys';

// Time helpers (used by cron + emails)
export { thisSundayMidnightUTC, lastSundayMidnightUTC } from './services/computeLeaderboard';

// Token helpers
export { signOptOutToken, verifyOptOutToken } from './services/digestToken';

// Email builder
export { buildWeeklyDigestEmail } from './emails/weeklyDigestEmail';
