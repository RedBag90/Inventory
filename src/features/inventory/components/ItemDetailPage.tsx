'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useItem } from '../hooks/useItem';
import { useDeleteItem } from '../hooks/useDeleteItem';
import { ItemManager } from '../services/ItemManager';
import { CostEditor } from './CostEditor';
import { ItemEditForm } from './ItemEditForm';
import { SaleManager } from '@/features/sales/services/SaleManager';
import { ConfirmPendingSaleModal } from '@/features/sales/components/ConfirmPendingSaleModal';
import { useCancelPendingSale } from '../hooks/usePendingSale';
import { formatCurrency, formatDate } from '@/shared/lib/utils';

type Props = { id: string };

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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();
  const { mutate: cancelPending, isPending: isCancelling } = useCancelPendingSale();
  const router = useRouter();

  function handleDelete() {
    deleteItem(id, {
      onSuccess: () => router.push('/dashboard/inventory'),
    });
  }

  if (isLoading) return (
    <div className="max-w-2xl space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-gray-100 rounded" />
      <div className="h-6 w-48 bg-gray-200 rounded" />
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-5 bg-gray-100 rounded" />
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-5 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
  if (isError || !item) return <div className="text-sm text-red-600 py-12 text-center">Item not found.</div>;

  const storageDays = ItemManager.calculateStorageDays(item);
  const totalCost =
    item.purchasePrice +
    item.shippingCostIn +
    item.repairCost +
    item.costs.reduce((sum, c) => sum + c.amount, 0);

  const profit = SaleManager.calculateProfit(item);
  const profitColor = profit === null
    ? ''
    : profit < 0
    ? 'text-red-600'
    : profit === 0
    ? 'text-gray-500'
    : 'text-green-700';

  const pendingProfit = item.pendingSale
    ? SaleManager.calculateProfit({ ...item, sale: item.pendingSale })
    : null;

  const pendingProfitColor = pendingProfit === null
    ? ''
    : pendingProfit < 0
    ? 'text-red-600'
    : pendingProfit === 0
    ? 'text-gray-500'
    : 'text-emerald-700';

  const statusBadge =
    item.status === 'SOLD'     ? { label: 'Verkauft',    cls: 'bg-gray-100 text-gray-600'   } :
    item.status === 'RESERVED' ? { label: 'Inseriert',   cls: 'bg-amber-100 text-amber-700' } :
                                 { label: 'In stock',    cls: 'bg-green-100 text-green-800'  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/inventory" className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-block">
        ← Inventory
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{item.name}</h1>
          {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
        </div>
        <span className={['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', statusBadge.cls].join(' ')}>
          {statusBadge.label}
        </span>
      </div>

      {/* Purchase details */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Purchase details</h2>
        <Row label="Platform"       value={item.purchasePlatform.charAt(0) + item.purchasePlatform.slice(1).toLowerCase()} />
        <Row label="Purchase date"  value={formatDate(new Date(item.purchasedAt))} />
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

      {/* Sale details — SOLD */}
      {item.status === 'SOLD' && item.sale && (
        <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Sale</h2>
          <Row label="Platform"     value={item.sale.salePlatform.charAt(0) + item.sale.salePlatform.slice(1).toLowerCase()} />
          <Row label="Sale date"    value={formatDate(new Date(item.sale.soldAt))} />
          <Row label="Sale price"   value={formatCurrency(item.sale.salePrice)} />
          <Row label="Shipping out" value={formatCurrency(item.sale.shippingCostOut)} />
          <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Profit</span>
            <span className={`text-sm font-semibold ${profitColor}`}>
              {profit !== null ? formatCurrency(profit) : '—'}
            </span>
          </div>
        </section>
      )}

      {/* Pending sale — RESERVED */}
      {item.status === 'RESERVED' && item.pendingSale && (
        <section className="bg-amber-50 rounded-lg border border-amber-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-amber-800 mb-3">Inserierter Verkauf</h2>
          <Row label="Plattform"         value={item.pendingSale.salePlatform.charAt(0) + item.pendingSale.salePlatform.slice(1).toLowerCase()} />
          <Row label="Geplantes Datum"   value={formatDate(new Date(item.pendingSale.soldAt))} />
          <Row label="Verkaufspreis"     value={formatCurrency(item.pendingSale.salePrice)} />
          <Row label="Versandkosten (A)" value={formatCurrency(item.pendingSale.shippingCostOut)} />
          {pendingProfit !== null && (
            <div className="flex justify-between pt-2 mt-1 border-t border-amber-200">
              <span className="text-sm font-semibold text-amber-800">Erwarteter Gewinn</span>
              <span className={`text-sm font-semibold ${pendingProfitColor}`}>
                {pendingProfit > 0 ? '+' : ''}{formatCurrency(pendingProfit)}
              </span>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-500 transition-colors"
            >
              Bestätigen
            </button>
            <button
              onClick={() => cancelPending(id)}
              disabled={isCancelling}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {isCancelling ? 'Wird aufgehoben…' : 'Aufheben'}
            </button>
          </div>
        </section>
      )}

      {/* Cost editor — IN_STOCK only */}
      {item.status === 'IN_STOCK' && (
        <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <CostEditor item={item} />
        </section>
      )}

      {/* Edit metadata — IN_STOCK or RESERVED */}
      {(item.status === 'IN_STOCK' || item.status === 'RESERVED') && (
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

      {/* Delete */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Delete this item permanently?</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Delete item
          </button>
        )}
      </section>

      {showConfirmModal && (
        <ConfirmPendingSaleModal
          item={item}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
