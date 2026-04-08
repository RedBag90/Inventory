'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useItems } from '../hooks/useItems';
import { ItemCard } from './ItemCard';
import { inventoryKeys } from '../hooks/inventoryKeys';
import { getItems } from '../services/ItemRepository';
import { SaleManager } from '@/features/sales/services/SaleManager';
import { formatCurrency } from '@/shared/lib/utils';
import type { ItemWithCosts } from '../types/inventory.types';

type FilterTab = 'ALL' | 'IN_STOCK' | 'SOLD';

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'Alle',     value: 'ALL' },
  { label: 'Lagernd',  value: 'IN_STOCK' },
  { label: 'Verkauft', value: 'SOLD' },
];

type Props = {
  onRecordSale: (item: ItemWithCosts) => void;
};

export function ItemTable({ onRecordSale }: Props) {
  const { data: items, isLoading, isError } = useItems();
  const searchParams = useSearchParams();
  const pathname     = usePathname();
  const router       = useRouter();

  // Always fetch all items for stats (shared cache when no filter active)
  const { data: allItems } = useQuery({
    queryKey: inventoryKeys.list({}),
    queryFn:  () => getItems({}),
    staleTime: 60_000,
  });

  const activeFilter = (searchParams.get('status') as FilterTab) ?? 'ALL';

  function setFilter(value: FilterTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') params.delete('status');
    else                 params.set('status', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  // Derive stats from all items
  const stats = allItems ? {
    total:   allItems.length,
    inStock: allItems.filter((i) => i.status === 'IN_STOCK').length,
    sold:    allItems.filter((i) => i.status === 'SOLD').length,
    profit:  allItems.reduce((sum, i) => {
      const p = SaleManager.calculateProfit(i);
      return p !== null ? sum + p : sum;
    }, 0),
  } : null;

  return (
    <div className="space-y-5">

      {/* ── Stats strip ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Artikel gesamt', value: String(stats.total) },
            { label: 'Im Lager',       value: String(stats.inStock) },
            { label: 'Verkauft',       value: String(stats.sold) },
            {
              label: 'Realisierter Gewinn',
              value: formatCurrency(stats.profit),
              color: stats.profit > 0 ? 'text-emerald-600' : stats.profit < 0 ? 'text-red-500' : 'text-gray-500',
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              <p className={['text-xl font-bold mt-0.5', s.color ?? 'text-gray-900'].join(' ')}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Item list card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

        {/* Filter tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={[
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeFilter === tab.value
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600',
              ].join(' ')}
            >
              {tab.label}
              {stats && tab.value === 'ALL'      && <span className="ml-1.5 text-xs text-gray-400">{stats.total}</span>}
              {stats && tab.value === 'IN_STOCK' && <span className="ml-1.5 text-xs text-gray-400">{stats.inStock}</span>}
              {stats && tab.value === 'SOLD'     && <span className="ml-1.5 text-xs text-gray-400">{stats.sold}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading && (
          <div className="py-12 text-center text-sm text-gray-400">Laden…</div>
        )}

        {isError && (
          <div className="py-12 text-center text-sm text-red-500">Inventar konnte nicht geladen werden.</div>
        )}

        {!isLoading && !isError && (!items || items.length === 0) && (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">Keine Artikel gefunden.</p>
            {activeFilter !== 'ALL' && (
              <button
                onClick={() => setFilter('ALL')}
                className="mt-2 text-xs text-gray-500 underline underline-offset-2"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        {items && items.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/dashboard/inventory/${item.id}`} className="block">
                  <ItemCard item={item} onRecordSale={onRecordSale} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
