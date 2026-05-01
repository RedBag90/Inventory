'use client';

import { useTranslations } from 'next-intl';

export function GhostItemCard() {
  const t = useTranslations('inventory');

  return (
    <li
      data-tutorial="ghost-item"
      className="relative group px-5 py-4 opacity-60 pointer-events-none select-none"
    >
      <div className="absolute top-2 right-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
        {t('ghostItemBadge')}
      </div>

      <div className="flex items-center gap-4">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 shrink-0">
          Kleinanzeigen
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{t('ghostItemName')}</p>
          <p className="text-xs text-slate-400 mt-0.5">{t('ghostItemBoughtFor')}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500 font-medium">{t('statusInStock')}</span>
        </div>

        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          {t('sellButton')}
        </div>
      </div>
    </li>
  );
}
