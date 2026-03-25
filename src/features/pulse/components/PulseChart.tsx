import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FadeIn, Skeleton } from '@/core/components';
import { useBreakpoint } from '@/lib/config/breakpoints';
import type { ChartDataPoint } from '@/data/types/pulse';

interface PulseChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  height?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
}

function PulseChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div
      className="rounded-[8px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 shadow-lg"
      style={{ minWidth: 140 }}
    >
      <p className="text-[12px] text-[var(--text-tertiary)]">{point.date}</p>
      <p className="font-data text-[20px] font-light text-[var(--text-primary)]">{point.visits.toLocaleString('es-AR')} visitas</p>
      {point.contacts > 0 ? <p className="text-[11px] text-[var(--signal)]">{point.contacts} consultas</p> : null}
    </div>
  );
}

export default function PulseChart({ data, loading = false, height = 180 }: PulseChartProps) {
  const { isMobile } = useBreakpoint();

  if (loading) {
    return (
      <div className="transition-opacity duration-150 ease-out">
        <Skeleton height={`${height}px`} rounded="md" />
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <FadeIn>
        <div className="flex items-center justify-center text-[12px] italic text-[var(--text-tertiary)]" style={{ height }}>
          No hay suficientes datos para mostrar el gráfico.
        </div>
      </FadeIn>
    );
  }

  const chartData = isMobile ? data.filter((_, index) => index % 3 === 0 || index === data.length - 1) : data;

  return (
    <FadeIn>
      <div style={{ height }}>
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="pulse-area-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3B9EF5" stopOpacity={0.08} />
                <stop offset="40%" stopColor="#7B4CD4" stopOpacity={0.05} />
                <stop offset="75%" stopColor="#E040A0" stopOpacity={0.03} />
                <stop offset="100%" stopColor="#FF9D00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid horizontal stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
            <XAxis axisLine={false} dataKey="date" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<PulseChartTooltip />} cursor={{ stroke: 'var(--signal)', strokeDasharray: '4 4' }} />
            <Area
              activeDot={{ fill: 'var(--signal)', r: 4, strokeWidth: 0 }}
              dataKey="visits"
              dot={false}
              fill="url(#pulse-area-gradient)"
              stroke="var(--signal)"
              strokeWidth={1.5}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
}
