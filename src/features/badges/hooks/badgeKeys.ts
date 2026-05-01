export const badgeKeys = {
  all:        ['badges'] as const,
  myBadges:   () => ['badges', 'mine'] as const,
  myCount:    () => ['badges', 'count'] as const,
  pageData:   () => ['badges', 'page'] as const,
  unnotified: () => ['badges', 'unnotified'] as const,
};
