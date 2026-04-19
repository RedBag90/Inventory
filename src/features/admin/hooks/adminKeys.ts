export const adminKeys = {
  all:                  ['admin'] as const,
  users:                () => ['admin', 'users']                as const,
  leaderboard:          () => ['admin', 'leaderboard']          as const,
  joinRequests:         () => ['admin', 'joinRequests']         as const,
  joinRequestCount:     () => ['admin', 'joinRequestCount']     as const,
  instanceRequests:     (status?: string) => status
    ? ['admin', 'instanceRequests', status] as const
    : ['admin', 'instanceRequests'] as const,
  instanceRequestCount: () => ['admin', 'instanceRequests', 'count'] as const,
  instanceRequestMine:  () => ['admin', 'instanceRequests', 'mine'] as const,
  instances:            () => ['admin', 'instances']            as const,
  instancesByOwner:     (ownerId: string) => ['admin', 'instances', 'byOwner', ownerId] as const,
};
