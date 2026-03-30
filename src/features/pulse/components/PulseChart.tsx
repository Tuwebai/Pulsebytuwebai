import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FadeIn, Skeleton } from '@/core/components';
import type { ChartDataPoint } from '@/data/types/pulse';

type ChartMode = 'visits' | 'contacts';

interface PulseChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  height?: number;
}

interface TooltipProps {
  active?: boolean;
  mode: ChartMode;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
}

function formatMetricLabel(mode: ChartMode, value: number) {
  return mode === 'contacts' ? `${value.toLocaleString('es-AR')} consultas` : `${value.toLocaleString('es-AR')} visitas`;
}

function getExecutiveInsight(mode: ChartMode, point: ChartDataPoint) {
  const currentValue = mode === 'contacts' ? point.contacts : point.visits;
  const previousValue = mode === 'contacts' ? point.previousContacts : point.previousVisits;

  if (mode === 'visits' && point.contacts > 0) {
    return point.contacts === 1 ? 'Ese día llegó una consulta.' : `Ese día llegaron ${point.contacts} consultas.`;
  }

  if (previousValue === null) {
    return mode === 'contacts' ? 'Todavía no hay comparación para este punto.' : 'Todavía no hay referencia anterior para comparar.';
  }

  if (currentValue > previousValue) {
    return 'Mejor que el período anterior.';
  }

  if (currentValue < previousValue) {
    return 'Por debajo del período anterior.';
  }

  return 'Se mantuvo en línea con el período anterior.';
}

function PulseChartTooltip({ active, mode, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  const currentValue = mode === 'contacts' ? point.contacts : point.visits;
  const previousValue = mode === 'contacts' ? point.previousContacts : point.previousVisits;

  return (
    <div
      className="rounded-[12px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-3 shadow-lg"
      style={{ minWidth: 220 }}
    >
      <p className="text-[12px] text-[var(--text-tertiary)]">{point.date}</p>
      <p className="mt-2 font-data text-[20px] font-light text-[var(--text-primary)]">{formatMetricLabel(mode, currentValue)}</p>
      <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
        {previousValue === null ? 'Sin comparación anterior' : `Período anterior: ${formatMetricLabel(mode, previousValue)}`}
      </p>
      {mode === 'visits' && point.contacts > 0 ? <p className="mt-1 text-[12px] text-[var(--success)]">{formatMetricLabel('contacts', point.contacts)}</p> : null}
      <p className="mt-3 text-[12px] leading-5 text-[var(--text-secondary)]">{getExecutiveInsight(mode, point)}</p>
    </div>
  );
}

function ToggleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? 'border-[var(--signal-border)] bg-[color:var(--signal-glow)] text-[var(--signal)]'
          : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default function PulseChart({ data, loading = false, height = 180 }: PulseChartProps) {
  const [mode, setMode] = useState<ChartMode>('visits');

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
          Todavía no hay suficiente movimiento para mostrar este gráfico.
        </div>
      </FadeIn>
    );
  }

  const maxVisits = Math.max(...data.map((point) => point.visits), 0);
  const maxContacts = Math.max(...data.map((point) => point.contacts), 0);
  const currentKey = mode === 'contacts' ? 'contacts' : 'visits';
  const previousKey = mode === 'contacts' ? 'previousContacts' : 'previousVisits';

  return (
    <FadeIn>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">Lectura del período</p>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Compará el movimiento actual contra el período anterior y detectá días con señales reales.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 p-1">
            <ToggleButton active={mode === 'visits'} onClick={() => setMode('visits')}>
              Visitas
            </ToggleButton>
            <ToggleButton active={mode === 'contacts'} onClick={() => setMode('contacts')}>
              Consultas
            </ToggleButton>
          </div>
        </div>

        <div style={{ height }}>
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="pulse-area-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3B9EF5" stopOpacity={0.12} />
                  <stop offset="40%" stopColor="#7B4CD4" stopOpacity={0.07} />
                  <stop offset="75%" stopColor="#E040A0" stopOpacity={0.04} />
                  <stop offset="100%" stopColor="#FF9D00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid horizontal stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                minTickGap={24}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<PulseChartTooltip mode={mode} />} cursor={{ stroke: 'var(--signal)', strokeDasharray: '4 4' }} />
              <Line
                dataKey={previousKey}
                dot={false}
                isAnimationActive={false}
                stroke="rgba(240,244,255,0.28)"
                strokeDasharray="5 5"
                strokeWidth={1}
                type="monotone"
              />
              <Area
                activeDot={{ fill: 'var(--signal)', r: 4, strokeWidth: 0 }}
                dataKey={currentKey}
                dot={false}
                fill="url(#pulse-area-gradient)"
                isAnimationActive={false}
                stroke="var(--signal)"
                strokeWidth={1.8}
                type="monotone"
              />
              {data.map((point) => {
                const value = mode === 'contacts' ? point.contacts : point.visits;
                const isPeak = mode === 'contacts' ? point.contacts === maxContacts && point.contacts > 0 : point.visits === maxVisits && point.visits > 0;
                const hasContacts = point.contacts > 0;
                const showMarker = isPeak || (mode === 'visits' && hasContacts) || (mode === 'contacts' && point.contacts > 0);

                if (!showMarker) {
                  return null;
                }

                return (
                  <ReferenceDot
                    key={`${mode}-${point.date}`}
                    fill={hasContacts ? 'var(--success)' : 'var(--signal)'}
                    isFront
                    r={isPeak ? 4 : 3}
                    stroke="var(--bg-surface)"
                    strokeWidth={1.5}
                    x={point.date}
                    y={value}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </FadeIn>
  );
}
