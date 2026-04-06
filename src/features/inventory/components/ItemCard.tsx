'use client';

// US-011, US-013, US-016 — Single inventory item card used in the list.

import { ItemManager } from '../services/ItemManager';
import { SaleManager } from '@/features/sales/services/SaleManager';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import type { ItemWithCosts } from '../types/inventory.types';

type Props = {
  item: ItemWithCosts;
  onRecordSale?: (item: ItemWithCosts) => void;
};

const STATUS_STYLES: Record<string, string> = {
  IN_STOCK: 'bg-green-100 text-green-800',
  SOLD:     'bg-gray-100 text-gray-600',
};

export function ItemCard({ item, onRecordSale }: Props) {
  const storageDays = ItemManager.calculateStorageDays(item);
  const profit = SaleManager.calculateProfit(item);

  const profitColor = profit === null
    ? ''
    : profit < 0
    ? 'text-red-600'
    : profit === 0
    ? 'text-gray-500'
    : 'text-green-700';

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors rounded-md">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {item.purchasePlatform.charAt(0) + item.purchasePlatform.slice(1).toLowerCase()} · {formatDate(new Date(item.purchasedAt))}
        </p>
      </div>

      <div className="flex items-center gap-4 ml-4 shrink-0">
        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.purchasePrice)}</span>

        {profit !== null ? (
          <span className={`text-sm font-medium ${profitColor}`}>
            {formatCurrency(profit)}
          </span>
        ) : (
          <span className="text-xs text-gray-500">{storageDays}d</span>
        )}

        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {item.status === 'IN_STOCK' ? 'In stock' : 'Sold'}
        </span>

        {item.status === 'IN_STOCK' && onRecordSale && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRecordSale(item);
            }}
            className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors shrink-0"
          >
            Record sale
          </button>
        )}
      </div>
    </div>
  );
}
