'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { BreakEvenPoint } from '../../lib/dashboardUtils';

type Props = {
  data:              BreakEvenPoint[];
  breakEvenPeriod?:  string;
};

type TooltipEntry = { dataKey: string; value: number };
type TooltipProps = { active?: boolean; payload?: TooltipEntry[]; label?: string };

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const rev  = payload.find((p) => p.dataKey === 'accRevenue')?.value ?? 0;
  const cost = payload.find((p) => p.dataKey === 'accCosts')?.value ?? 0;
  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm p-3 text-xs">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      <p className="text-emerald-600">Acc. Revenue: €{rev.toFixed(2)}</p>
      <p className="text-red-600">Acc. Costs: €{cost.toFixed(2)}</p>
      <p className={`mt-1 font-medium ${rev - cost >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        Net: €{(rev - cost).toFixed(2)}
      </p>
    </div>
  );
}

export function BreakEvenChart({ data, breakEvenPeriod }: Props) {
  const hasData = data.some((d) => d.accRevenue > 0 || d.accCosts > 0);
  if (!hasData) {
    return <p className="text-sm text-slate-400 text-center py-10">No sales in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => `€${v}`} tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={52} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        {breakEvenPeriod && (
          <ReferenceLine
            x={breakEvenPeriod}
            stroke="#6b7280"
            strokeDasharray="4 2"
            label={{ value: 'Break-Even', position: 'top', fontSize: 9, fill: '#6b7280' }}
          />
        )}
        <Line dataKey="accRevenue" name="Acc. Revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
        <Line dataKey="accCosts"   name="Acc. Costs"   stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
