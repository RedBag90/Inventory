// Public API — only import from here, never from internal paths.

// Components
export { BadgeCard }  from './components/BadgeCard';
export { BadgeChip }  from './components/BadgeChip';
export { BadgePage }  from './components/BadgePage';
export { BadgeToast } from './components/BadgeToast';

// Hooks
export { useMyBadgesPageData, useMyBadgeCount, useMarkBadgesNotified } from './hooks/useBadges';
export { badgeKeys } from './hooks/badgeKeys';

// Types
export type {
  AwardedBadge,
  BadgeDefinition,
  BadgeTier,
  BadgeCategory,
  BadgeCriteria,
  BadgesPageData,
  UserBadgeWithDefinition,
} from './types/badge.types';
