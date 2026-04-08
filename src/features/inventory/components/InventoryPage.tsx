'use client';

// US-011 — Inventory list page with "Add item" panel and "Record sale" modal.

import { useState, Suspense } from 'react';
import { ItemTable } from './ItemTable';
import { ItemForm } from './ItemForm';
import { SaleModal }      from '@/features/sales/components/SaleModal';
import { QuickSellModal } from '@/features/sales/components/QuickSellModal';
import type { ItemWithCosts } from '../types/inventory.types';

export function InventoryPage() {
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [showQuickSell,  setShowQuickSell]  = useState(false);
  const [sellingItem,    setSellingItem]    = useState<ItemWithCosts | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Inventory</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gray-900 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Jetzt kaufen und später verkaufen
          </button>
          <button
            onClick={() => setShowQuickSell(true)}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Schnell verkaufen
          </button>
        </div>
      </div>

      {/* List — wrapped in Suspense because useSearchParams suspends */}
      <Suspense fallback={<div className="text-sm text-gray-500 py-8 text-center">Loading…</div>}>
        <ItemTable onRecordSale={setSellingItem} />
      </Suspense>

      {/* Add item panel */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowAddForm(false)}
          />
          <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Add item</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <ItemForm onSuccess={() => setShowAddForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Quick sell modal */}
      {showQuickSell && (
        <QuickSellModal onClose={() => setShowQuickSell(false)} />
      )}

      {/* Record sale modal */}
      {sellingItem && (
        <SaleModal
          item={sellingItem}
          onClose={() => setSellingItem(null)}
        />
      )}
    </div>
  );
}
