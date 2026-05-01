'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

type RoiDataPoint = { period: string; Revenue: number; Costs: number };
type Props = { data: RoiDataPoint[] };

type TooltipEntry = { dataKey: string; value: number };
type TooltipProps = { active?: boolean; payload?: TooltipEntry[]; label?: string };

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p) => p.dataKey === 'Revenue')?.value ?? 0;
  const costs   = payload.find((p) => p.dataKey === 'Costs')?.value ?? 0;
  const roi     = costs > 0 ? (((revenue - costs) / costs) * 100).toFixed(1) : '—';
  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm p-3 text-xs">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      <p className="text-emerald-600">Revenue: €{revenue.toFixed(2)}</p>
      <p className="text-red-600">Costs: €{costs.toFixed(2)}</p>
      <p className="text-slate-700 mt-1">ROI: {roi}%</p>
    </div>
  );
}

export function RoiChart({ data }: Props) {
  if (data.every((d) => d.Revenue === 0 && d.Costs === 0)) {
    return <p className="text-sm text-slate-400 text-center py-10">No sales in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => `€${v}`} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Revenue" fill="#22c55e" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Costs"   fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
