'use client';

import type { BadgeTier } from '../types/badge.types';

const TIER_COLORS: Record<BadgeTier, string> = {
  BRONZE: 'text-amber-600',
  SILVER: 'text-gray-400',
  GOLD:   'text-yellow-400',
};

const TIER_BG: Record<BadgeTier, string> = {
  BRONZE: 'bg-amber-50  border-amber-200',
  SILVER: 'bg-gray-50   border-gray-200',
  GOLD:   'bg-yellow-50 border-yellow-200',
};

type Props = {
  slug:  string;
  tier:  BadgeTier;
  label: string;
  size?: 'sm' | 'md';
};

const BADGE_ICONS: Record<string, string> = {
  'first-item':   '📦',
  'buyer-10':     '🛍️',
  'buyer-25':     '🛒',
  'buyer-50':     '🏪',
  'first-sale':   '🎯',
  'seller-10':    '💼',
  'seller-25':    '⭐',
  'seller-50':    '🏆',
  'profit-100':   '💰',
  'profit-500':   '💵',
  'profit-1000':  '💎',
  'profit-5000':  '🚀',
  'speed-3d':     '⚡',
  'speed-1d':     '🔥',
  'top-3':        '🥉',
  'champion':     '🥇',
  'display-name': '🪪',
  'tutorial-done':'🎓',
};

export function BadgeChip({ slug, tier, label, size = 'sm' }: Props) {
  const icon = BADGE_ICONS[slug] ?? '🏅';
  const color = TIER_COLORS[tier];
  const bg    = TIER_BG[tier];

  if (size === 'sm') {
    return (
      <span
        title={label}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-sm ${bg} ${color}`}
      >
        {icon}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${bg} ${color}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
