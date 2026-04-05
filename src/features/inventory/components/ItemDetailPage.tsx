'use client';

// US-012 — Full item detail view.
// Shows all costs, storage duration, CostEditor (IN_STOCK only), ItemEditForm (IN_STOCK only),
// and profit block for SOLD items.

import { useState } from 'react';
import Link from 'next/link';
import { useItem } from '../hooks/useItem';
import { ItemManager } from '../services/ItemManager';
import { CostEditor } from './CostEditor';
import { ItemEditForm } from './ItemEditForm';

type Props = { id: string };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function ItemDetailPage({ id }: Props) {
  const { data: item, isLoading, isError } = useItem(id);
  const [showEdit, setShowEdit] = useState(false);

  if (isLoading) return <div className="text-sm text-gray-500 py-12 text-center">Loading…</div>;
  if (isError || !item) return <div className="text-sm text-red-600 py-12 text-center">Item not found.</div>;

  const storageDays = ItemManager.calculateStorageDays(item);

  // Compute total cost
  const totalCost =
    item.purchasePrice +
    item.shippingCostIn +
    item.repairCost +
    item.costs.reduce((sum, c) => sum + c.amount, 0);

  // Compute profit for SOLD items
  const profit = item.sale
    ? item.sale.salePrice - totalCost - item.sale.shippingCostOut
    : null;

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link href="/dashboard/inventory" className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-block">
        ← Inventory
      </Link>

      {/* Title + status */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{item.name}</h1>
          {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
        </div>
        <span className={[
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
          item.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600',
        ].join(' ')}>
          {item.status === 'IN_STOCK' ? 'In stock' : 'Sold'}
        </span>
      </div>

      {/* Purchase details */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Purchase details</h2>
        <Row label="Platform"       value={item.purchasePlatform.charAt(0) + item.purchasePlatform.slice(1).toLowerCase()} />
        <Row label="Purchase date"  value={formatDate(item.purchasedAt)} />
        <Row label="Purchase price" value={formatCurrency(item.purchasePrice)} />
        <Row label="Shipping in"    value={formatCurrency(item.shippingCostIn)} />
        <Row label="Repair cost"    value={formatCurrency(item.repairCost)} />
        {item.costs.map(c => (
          <Row key={c.id} label={c.label} value={formatCurrency(c.amount)} />
        ))}
        <Row label="Storage"        value={`${storageDays} day${storageDays !== 1 ? 's' : ''}`} />
        <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Total cost</span>
          <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalCost)}</span>
        </div>
      </section>

      {/* Sale details (SOLD only) */}
      {item.status === 'SOLD' && item.sale && (
        <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Sale</h2>
          <Row label="Platform"        value={item.sale.salePlatform.charAt(0) + item.sale.salePlatform.slice(1).toLowerCase()} />
          <Row label="Sale date"       value={formatDate(item.sale.soldAt)} />
          <Row label="Sale price"      value={formatCurrency(item.sale.salePrice)} />
          <Row label="Shipping out"    value={formatCurrency(item.sale.shippingCostOut)} />
          <div className={[
            'flex justify-between pt-2 mt-1 border-t border-gray-200',
          ].join(' ')}>
            <span className="text-sm font-semibold text-gray-700">Profit</span>
            <span className={`text-sm font-semibold ${profit! >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {formatCurrency(profit!)}
            </span>
          </div>
        </section>
      )}

      {/* Cost editor — IN_STOCK only */}
      {item.status === 'IN_STOCK' && (
        <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <CostEditor item={item} />
        </section>
      )}

      {/* Edit metadata — IN_STOCK only */}
      {item.status === 'IN_STOCK' && (
        <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          {showEdit ? (
            <ItemEditForm item={item} onSuccess={() => setShowEdit(false)} />
          ) : (
            <button
              onClick={() => setShowEdit(true)}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Edit item details
            </button>
          )}
        </section>
      )}
    </div>
  );
}
