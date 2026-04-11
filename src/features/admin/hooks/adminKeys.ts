export const adminKeys = {
  all:              ['admin'] as const,
  users:            () => ['admin', 'users']            as const,
  leaderboard:      () => ['admin', 'leaderboard']      as const,
  joinRequests:     () => ['admin', 'joinRequests']     as const,
  joinRequestCount: () => ['admin', 'joinRequestCount'] as const,
};
