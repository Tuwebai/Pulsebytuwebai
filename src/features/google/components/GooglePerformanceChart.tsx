import { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FadeIn, Skeleton } from '@/core/components';
import type { GoogleSearchConsoleChartPoint } from '@/data/types/google';

interface GooglePerformanceChartProps {
  data: GoogleSearchConsoleChartPoint[];
  loading?: boolean;
}

function GooglePerformanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ color?: string; dataKey?: string; value?: number; payload: GoogleSearchConsoleChartPoint }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-[12px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-3 shadow-lg">
      <p className="text-[12px] text-[var(--text-tertiary)]">{point.date}</p>
      <div className="mt-2 space-y-1">
        <p className="text-[13px] text-[#78B7FF]">Clics: {point.clicks.toLocaleString('es-AR')}</p>
        <p className="text-[13px] text-[#8D78FF]">Impresiones: {point.impressions.toLocaleString('es-AR')}</p>
      </div>
    </div>
  );
}

export default function GooglePerformanceChart({ data, loading = false }: GooglePerformanceChartProps) {
  const hasData = useMemo(() => data.some((point) => point.clicks > 0 || point.impressions > 0), [data]);

  if (loading) {
    return <Skeleton height="280px" rounded="md" />;
  }

  if (!hasData || data.length < 2) {
    return (
      <FadeIn>
        <div className="flex h-[280px] items-center justify-center text-[13px] italic text-[var(--text-tertiary)]">
          Todavía no hay suficiente movimiento para dibujar la curva de Google.
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="h-[280px]">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={{ left: 4, right: 12, top: 12, bottom: 8 }}>
            <XAxis axisLine={false} dataKey="date" minTickGap={24} tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} tickLine={false} />
            <YAxis axisLine={false} orientation="left" tick={{ fill: '#78B7FF', fontSize: 11 }} tickLine={false} width={36} />
            <YAxis axisLine={false} orientation="right" tick={{ fill: '#8D78FF', fontSize: 11 }} tickLine={false} width={44} yAxisId="right" />
            <Tooltip content={<GooglePerformanceTooltip />} />
            <Line
              dataKey="clicks"
              dot={false}
              isAnimationActive={false}
              stroke="#78B7FF"
              strokeWidth={2.5}
              type="monotone"
            />
            <Line
              dataKey="impressions"
              dot={false}
              isAnimationActive={false}
              stroke="#8D78FF"
              strokeWidth={2.5}
              type="monotone"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
}
