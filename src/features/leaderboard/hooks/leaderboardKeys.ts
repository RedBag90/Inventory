export const leaderboardKeys = {
  all:      ['leaderboard'] as const,
  instance: (instanceId: string) => ['leaderboard', 'instance', instanceId] as const,
};
