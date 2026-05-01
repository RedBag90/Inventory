'use client';

import { useTranslations } from 'next-intl';
import type { AwardedBadge } from '../types/badge.types';

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

const TIER_COLORS: Record<string, string> = {
  BRONZE: 'text-amber-600 bg-amber-50 border-amber-200',
  SILVER: 'text-slate-600  bg-slate-50  border-slate-200',
  GOLD:   'text-yellow-600 bg-yellow-50 border-yellow-200',
};

type Props = { badge: AwardedBadge };

export function BadgeToast({ badge }: Props) {
  const t = useTranslations('badges');
  const icon = BADGE_ICONS[badge.slug] ?? '🏅';
  const colors = TIER_COLORS[badge.tier] ?? TIER_COLORS.BRONZE;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{t('newBadgeToast')}</p>
        <p className="text-sm font-bold leading-tight">{t(`${badge.slug}.name`)}</p>
        <p className="text-xs opacity-70 mt-0.5">{t(`${badge.slug}.description`)}</p>
      </div>
    </div>
  );
}
