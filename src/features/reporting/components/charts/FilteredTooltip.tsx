'use client';

// Custom Recharts tooltip that hides entries with value 0.
// Drop-in replacement for the default <Tooltip /> on item-based stacked bar charts.

import type { TooltipProps } from 'recharts';

type Entry = { name?: string; value?: number; color?: string };

export function FilteredTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const visible = (payload as Entry[]).filter((e) => (e.value ?? 0) !== 0);
  if (visible.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {visible.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 py-0.5">
          <span
            className="inline-block w-2 h-2 rounded-sm shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-slate-600">{entry.name}</span>
          <span className="ml-auto pl-3 font-medium text-slate-800">
            €{(entry.value ?? 0).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
