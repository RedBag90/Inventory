'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMyBadgesPageData } from '../hooks/useBadges';
import { BadgeCard } from './BadgeCard';
import type { BadgeCategory } from '../types/badge.types';

const CATEGORY_ORDER: BadgeCategory[] = ['SALES', 'PROFIT', 'BIG_DEAL', 'EFFICIENCY', 'STREAK', 'INVENTORY', 'PORTFOLIO', 'LEADERBOARD', 'ENGAGEMENT', 'SPECIAL'];

export function BadgePage() {
  const t = useTranslations('badges');
  const { data, isLoading } = useMyBadgesPageData();
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'ALL'>('ALL');

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 animate-pulse h-36" />
        ))}
      </div>
    );
  }

  const earnedMap   = useMemo(() => new Map(data.earned.map((e) => [e.badge.id, e])), [data.earned]);
  const earnedCount = data.earned.length;

  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => data.all.some((b) => b.category === c)),
    [data.all]
  );

  const filteredBadges = useMemo(
    () => activeCategory === 'ALL' ? data.all : data.all.filter((b) => b.category === activeCategory),
    [data.all, activeCategory]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{t('pageTitle')}</h1>
          <p className="page-subtitle">
            {earnedCount} / {data.all.length} {t('earned')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            activeCategory === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50',
          ].join(' ')}
        >
          {t('categoryAll')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50',
            ].join(' ')}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earnedRecord={earnedMap.get(badge.id)}
          />
        ))}
      </div>
    </div>
  );
}
