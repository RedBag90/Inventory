'use client';

// US-011 — Inventory list with URL-based status filter.

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useItems } from '../hooks/useItems';
import { ItemCard } from './ItemCard';

type FilterTab = 'ALL' | 'IN_STOCK' | 'SOLD';

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',      value: 'ALL' },
  { label: 'In stock', value: 'IN_STOCK' },
  { label: 'Sold',     value: 'SOLD' },
];

export function ItemTable() {
  const { data: items, isLoading, isError } = useItems();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeFilter = (searchParams.get('status') as FilterTab) ?? 'ALL';

  function setFilter(value: FilterTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (isLoading) {
    return <div className="text-sm text-gray-500 py-8 text-center">Loading inventory…</div>;
  }

  if (isError) {
    return <div className="text-sm text-red-600 py-8 text-center">Failed to load inventory.</div>;
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={[
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeFilter === tab.value
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {!items || items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No items found.</p>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setFilter('ALL')}
              className="mt-2 text-xs text-gray-500 underline"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map(item => (
            <Link key={item.id} href={`/dashboard/inventory/${item.id}`} className="block">
              <ItemCard item={item} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
