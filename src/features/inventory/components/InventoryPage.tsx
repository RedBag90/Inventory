'use client';

// US-011 — Inventory list page with "Add item" slide-over panel.

import { useState, Suspense } from 'react';
import { ItemTable } from './ItemTable';
import { ItemForm } from './ItemForm';

export function InventoryPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Inventory</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Add item
        </button>
      </div>

      {/* List — wrapped in Suspense because useSearchParams suspends */}
      <Suspense fallback={<div className="text-sm text-gray-500 py-8 text-center">Loading…</div>}>
        <ItemTable />
      </Suspense>

      {/* Create item panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/30"
            onClick={() => setShowForm(false)}
          />
          {/* Panel */}
          <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Add item</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <ItemForm onSuccess={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
