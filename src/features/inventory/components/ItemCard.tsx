'use client';

// US-011, US-013 — Single inventory item card used in the list.

import { ItemManager } from '../services/ItemManager';
import type { ItemWithCosts } from '../types/inventory.types';

type Props = { item: ItemWithCosts };

const STATUS_STYLES: Record<string, string> = {
  IN_STOCK: 'bg-green-100 text-green-800',
  SOLD:     'bg-gray-100 text-gray-600',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
}

export function ItemCard({ item }: Props) {
  const storageDays = ItemManager.calculateStorageDays(item);

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors rounded-md">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {item.purchasePlatform.charAt(0) + item.purchasePlatform.slice(1).toLowerCase()} · {formatDate(item.purchasedAt)}
        </p>
      </div>

      <div className="flex items-center gap-4 ml-4 shrink-0">
        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.purchasePrice)}</span>

        <span className="text-xs text-gray-500">{storageDays}d</span>

        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {item.status === 'IN_STOCK' ? 'In stock' : 'Sold'}
        </span>
      </div>
    </div>
  );
}
