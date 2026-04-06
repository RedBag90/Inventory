'use client';

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';

type DataPoint = { period: string; cashFlow: number };
type Props = { data: DataPoint[] };

type TooltipEntry = { value: number };
type TooltipProps = { active?: boolean; payload?: TooltipEntry[]; label?: string };

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-3 text-xs">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className={v >= 0 ? 'text-green-700' : 'text-red-600'}>
        Net cash flow: €{v.toFixed(2)}
      </p>
    </div>
  );
}

export function CashFlowChart({ data }: Props) {
  const hasData = data.some((d) => d.cashFlow !== 0);
  if (!hasData) {
    return <p className="text-sm text-gray-400 text-center py-10">No sales in this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v: number) => `€${v}`} tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={52} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
        <Bar dataKey="cashFlow" name="Net Cash Flow" radius={[2, 2, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.cashFlow >= 0 ? '#22c55e' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
