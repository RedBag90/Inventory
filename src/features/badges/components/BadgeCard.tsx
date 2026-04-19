'use client';

import { useTranslations } from 'next-intl';
import type { BadgeDefinition, UserBadgeWithDefinition } from '../types/badge.types';

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

const TIER_RING: Record<string, string> = {
  BRONZE: 'ring-amber-400',
  SILVER: 'ring-gray-400',
  GOLD:   'ring-yellow-400',
};

const TIER_BG: Record<string, string> = {
  BRONZE: 'bg-amber-50',
  SILVER: 'bg-gray-50',
  GOLD:   'bg-yellow-50',
};

type Props = {
  badge:        BadgeDefinition;
  earnedRecord?: UserBadgeWithDefinition;
};

export function BadgeCard({ badge, earnedRecord }: Props) {
  const t  = useTranslations('badges');
  const isEarned = !!earnedRecord;
  const icon = BADGE_ICONS[badge.slug] ?? '🏅';

  return (
    <div className={[
      'rounded-xl border p-4 flex flex-col items-center text-center gap-2 transition-opacity',
      isEarned ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50',
    ].join(' ')}>
      <div className={[
        'w-14 h-14 rounded-full flex items-center justify-center text-3xl ring-2',
        isEarned ? TIER_RING[badge.tier] : 'ring-gray-200',
        isEarned ? TIER_BG[badge.tier]  : 'bg-gray-100',
      ].join(' ')}>
        {icon}
      </div>

      <div>
        <p className={`text-sm font-semibold ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
          {t(`${badge.slug}.name`)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {t(`${badge.slug}.description`)}
        </p>
      </div>

      {isEarned && earnedRecord ? (
        <p className="text-xs text-green-600 font-medium">
          {new Date(earnedRecord.unlockedAt).toLocaleDateString()}
        </p>
      ) : (
        <p className="text-xs text-gray-400 italic">{t('locked')}</p>
      )}
    </div>
  );
}
