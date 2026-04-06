'use client';

type Trend = 'positive' | 'negative' | 'neutral';
type Props = { label: string; value: string; trend?: Trend };

const TREND_STYLES: Record<Trend, string> = {
  positive: 'text-green-700',
  negative: 'text-red-600',
  neutral:  'text-gray-900',
};

export function KPICard({ label, value, trend = 'neutral' }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${TREND_STYLES[trend]}`}>{value}</p>
    </div>
  );
}
