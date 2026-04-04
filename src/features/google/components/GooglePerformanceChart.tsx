import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FadeIn, Skeleton } from '@/core/components';
import type { GoogleSearchConsoleChartPoint, GoogleSearchConsoleMetricKey } from '@/data/types/google';

interface GooglePerformanceChartProps {
  activeMetrics: GoogleSearchConsoleMetricKey[];
  data: GoogleSearchConsoleChartPoint[];
  loading?: boolean;
}

const metricConfig: Record<GoogleSearchConsoleMetricKey, { color: string; formatter: (value: number | null) => string; yAxisId: string }> = {
  clicks: {
    color: '#5AA7FF',
    formatter: (value) => `${Math.round(value ?? 0).toLocaleString('es-AR')}`,
    yAxisId: 'clicks',
  },
  impressions: {
    color: '#7F64FF',
    formatter: (value) => `${Math.round(value ?? 0).toLocaleString('es-AR')}`,
    yAxisId: 'impressions',
  },
  ctr: {
    color: '#10B981',
    formatter: (value) => `${(value ?? 0).toLocaleString('es-AR')} %`,
    yAxisId: 'ctr',
  },
  position: {
    color: '#F59E0B',
    formatter: (value) => `${(value ?? 0).toLocaleString('es-AR')}`,
    yAxisId: 'position',
  },
};

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
        {payload.map((item) => {
          const key = item.dataKey as GoogleSearchConsoleMetricKey;
          const config = metricConfig[key];
          return (
            <p key={key} className="text-[13px]" style={{ color: config.color }}>
              {key === 'clicks' ? 'Clics' : key === 'impressions' ? 'Impresiones' : key === 'ctr' ? 'CTR' : 'Posición'}: {config.formatter(item.value ?? null)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function GooglePerformanceChart({
  activeMetrics,
  data,
  loading = false,
}: GooglePerformanceChartProps) {
  const hasData = data.some((point) => point.clicks > 0 || point.impressions > 0);

  if (loading) {
    return <Skeleton height="320px" rounded="md" />;
  }

  if (!hasData || data.length < 2) {
    return (
      <FadeIn>
        <div className="flex h-[320px] items-center justify-center text-[13px] italic text-[var(--text-tertiary)]">
          Todavía no hay suficiente movimiento para dibujar el rendimiento de Google.
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="h-[320px]">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={data} margin={{ left: 4, right: 8, top: 12, bottom: 8 }}>
            <XAxis axisLine={false} dataKey="date" minTickGap={24} tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} tickLine={false} />
            <YAxis hide yAxisId="clicks" />
            <YAxis hide yAxisId="impressions" />
            <YAxis hide yAxisId="ctr" />
            <YAxis hide reversed yAxisId="position" />
            <Tooltip content={<GooglePerformanceTooltip />} />
            {activeMetrics.map((metricKey) => (
              <Line
                key={metricKey}
                dataKey={metricKey}
                dot={false}
                isAnimationActive={false}
                stroke={metricConfig[metricKey].color}
                strokeWidth={2.25}
                type="monotone"
                yAxisId={metricConfig[metricKey].yAxisId}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
}
