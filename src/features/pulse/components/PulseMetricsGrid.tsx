import { Activity, BarChart3, Gauge, MousePointerClick } from 'lucide-react';
import AnimatedList from '@/core/components/AnimatedList';
import type { PulseMetricsTotals } from '@/data/types/pulse';
import PulseMetricOverviewCard from './PulseMetricOverviewCard';

interface PulseMetricsGridProps {
  averagePerDay: number | null;
  data: PulseMetricsTotals | undefined;
  loading: boolean;
}

interface PulseMetricItem {
  detail: string;
  detailClassName: string;
  icon: typeof Activity;
  label: string;
  tone: 'default' | 'signal' | 'success' | 'warning';
  value: string;
  valueClassName?: string;
}

function formatMetricValue(value: number | null, unit?: string) {
  if (value === null) {
    return '—';
  }

  const formatted = value.toLocaleString('es-AR');
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatDeltaDetail(delta: number | null) {
  const prefix = delta !== null ? (delta > 0 ? '+' : '') : '';
  return `${prefix}${delta ?? 0}% vs. mes anterior`;
}

function getDeltaClassName(delta: number | null) {
  if (delta === null || delta === 0) {
    return 'text-emerald-400';
  }

  return delta > 0 ? 'text-emerald-400' : 'text-rose-400';
}

export default function PulseMetricsGrid({ averagePerDay, data, loading }: PulseMetricsGridProps) {
  const cards: PulseMetricItem[] = [
    {
      detail: formatDeltaDetail(data?.visitsDelta ?? 0),
      detailClassName: getDeltaClassName(data?.visitsDelta ?? 0),
      icon: Activity,
      label: 'Visitas registradas',
      tone: 'signal' as const,
      value: loading ? '...' : formatMetricValue(data?.visits ?? null),
    },
    {
      detail: formatDeltaDetail(data?.contactsDelta ?? 0),
      detailClassName: getDeltaClassName(data?.contactsDelta ?? 0),
      icon: MousePointerClick,
      label: 'Consultas recibidas',
      tone: 'success' as const,
      value: loading ? '...' : formatMetricValue(data?.contacts ?? null),
    },
    {
      detail: formatDeltaDetail(data?.consultationRateDelta ?? 0),
      detailClassName: getDeltaClassName(data?.consultationRateDelta ?? 0),
      icon: Gauge,
      label: 'Tasa de consulta',
      tone: 'warning' as const,
      value: loading ? '...' : formatMetricValue(data?.consultationRate ?? null, '%'),
    },
    {
      detail: formatDeltaDetail(data?.dailyAverageVisitsDelta ?? 0),
      detailClassName: getDeltaClassName(data?.dailyAverageVisitsDelta ?? 0),
      icon: BarChart3,
      label: 'Promedio diario',
      tone: 'default' as const,
      value: loading ? '...' : formatMetricValue(averagePerDay),
      valueClassName: 'text-[clamp(2.2rem,3vw,2.8rem)]',
    },
  ];

  return (
    <AnimatedList
      className="grid gap-[var(--cliente-grid-gap-mobile)] md:grid-cols-2 md:gap-[var(--cliente-grid-gap)] xl:grid-cols-4"
      data-tour="pulse-metrics-grid"
      disabled={loading}
      key={`${data?.period ?? 'pulse'}-${loading ? 'loading' : 'ready'}`}
      staggerMs={60}
    >
      {cards.map((card) => (
        <PulseMetricOverviewCard
          key={card.label}
          detail={card.detail}
          detailClassName={card.detailClassName}
          icon={card.icon}
          label={card.label}
          tone={card.tone}
          value={card.value}
          valueClassName={card.valueClassName}
        />
      ))}
    </AnimatedList>
  );
}
