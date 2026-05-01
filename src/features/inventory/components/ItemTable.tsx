'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useItems } from '../hooks/useItems';
import { ItemCard } from './ItemCard';
import { SaleManager } from '@/features/sales/services/SaleManager';
import { formatCurrency } from '@/shared/lib/utils';
import type { ItemWithCosts } from '../types/inventory.types';
import { useTutorial } from '@/features/tutorial/context/TutorialContext';
import { GhostItemCard } from '@/features/tutorial/components/GhostItemCard';

type FilterTab = 'ALL' | 'IN_STOCK' | 'RESERVED' | 'SOLD';

type Props = {
  onRecordSale:       (item: ItemWithCosts) => void;
  onPreMarkSale:      (item: ItemWithCosts) => void;
  onConfirmSale:      (item: ItemWithCosts) => void;
  onCancelPendingSale:(item: ItemWithCosts) => void;
};

export function ItemTable({ onRecordSale, onPreMarkSale, onConfirmSale, onCancelPendingSale }: Props) {
  const t = useTranslations('inventory');
  const { data: allItems, isLoading, isError } = useItems();
  const { step: tutorialStep } = useTutorial();
  const searchParams = useSearchParams();
  const pathname     = usePathname();
  const router       = useRouter();

  const TABS = useMemo(() => [
    { label: t('filterAll'),     value: 'ALL'      as FilterTab },
    { label: t('filterInStock'), value: 'IN_STOCK' as FilterTab },
    { label: 'Inseriert',        value: 'RESERVED' as FilterTab },
    { label: t('filterSold'),    value: 'SOLD'     as FilterTab },
  ], [t]);

  const activeFilter = (searchParams.get('status') as FilterTab) ?? 'ALL';

  const items = allItems && activeFilter !== 'ALL'
    ? allItems.filter((i) => i.status === activeFilter)
    : allItems;

  function setFilter(value: FilterTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') params.delete('status');
    else                 params.set('status', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const stats = useMemo(() => allItems ? {
    total:    allItems.length,
    inStock:  allItems.filter((i) => i.status === 'IN_STOCK').length,
    reserved: allItems.filter((i) => i.status === 'RESERVED').length,
    sold:     allItems.filter((i) => i.status === 'SOLD').length,
    profit:   allItems.reduce((sum, i) => {
      const p = SaleManager.calculateProfit(i);
      return p !== null ? sum + p : sum;
    }, 0),
  } : null, [allItems]);

  return (
    <div className="space-y-5">

      {/* ── Stats strip ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('totalItems'), value: String(stats.total) },
            { label: t('inStock'),    value: String(stats.inStock) },
            { label: 'Inseriert',     value: String(stats.reserved), color: stats.reserved > 0 ? 'text-amber-600' : undefined },
            {
              label: t('profit'),
              value: formatCurrency(stats.profit),
              color: stats.profit > 0 ? 'text-emerald-600' : stats.profit < 0 ? 'text-red-500' : 'text-slate-500',
            },
          ].map((s) => (
            <div key={s.label} className="stat-tile">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={['text-xl font-bold mt-0.5', s.color ?? 'text-slate-900'].join(' ')}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Item list card ── */}
      <div className="card overflow-hidden">

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-slate-100">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={[
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeFilter === tab.value
                  ? 'tab-active'
                  : 'tab-inactive',
              ].join(' ')}
            >
              {tab.label}
              {stats && tab.value === 'ALL'      && <span className="ml-1.5 text-xs text-slate-400">{stats.total}</span>}
              {stats && tab.value === 'IN_STOCK' && <span className="ml-1.5 text-xs text-slate-400">{stats.inStock}</span>}
              {stats && tab.value === 'RESERVED' && <span className="ml-1.5 text-xs text-amber-500">{stats.reserved}</span>}
              {stats && tab.value === 'SOLD'     && <span className="ml-1.5 text-xs text-slate-400">{stats.sold}</span>}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="py-12 text-center text-sm text-red-500">{t('loadError')}</div>
        )}

        {!isLoading && !isError && (!items || items.length === 0) && tutorialStep !== 'inventory-sell' && (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-400">{t('noItems')}</p>
            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setFilter('ALL')}
                className="mt-2 text-xs text-slate-500 underline underline-offset-2"
              >
                {t('resetFilter')}
              </button>
            )}
          </div>
        )}

        {tutorialStep === 'inventory-sell' && (!items || items.length === 0) && (
          <ul className="divide-y divide-slate-100">
            <GhostItemCard />
          </ul>
        )}

        {items && items.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/dashboard/inventory/${item.id}`} className="block">
                  <ItemCard
                    item={item}
                    onRecordSale={onRecordSale}
                    onPreMarkSale={onPreMarkSale}
                    onConfirmSale={onConfirmSale}
                    onCancelPendingSale={onCancelPendingSale}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
