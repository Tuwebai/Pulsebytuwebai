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

export default function PulseMetricsGrid({ averagePerDay, data, loading }: PulseMetricsGridProps) {
  const cards: PulseMetricItem[] = [
    {
      detail:
        data?.visitsDelta !== null && data?.visitsDelta !== undefined
          ? `${data.visitsDelta > 0 ? '+' : ''}${data.visitsDelta}% vs. período anterior`
          : 'base de lectura',
      icon: Activity,
      label: 'Visitas registradas',
      tone: 'signal' as const,
      value: loading ? '...' : formatMetricValue(data?.visits ?? null),
    },
    {
      detail:
        data?.contactsDelta !== null && data?.contactsDelta !== undefined
          ? `${data.contactsDelta > 0 ? '+' : ''}${data.contactsDelta}% vs. período anterior`
          : 'contactos detectados',
      icon: MousePointerClick,
      label: 'Consultas recibidas',
      tone: 'success' as const,
      value: loading ? '...' : formatMetricValue(data?.contacts ?? null),
    },
    {
      detail: 'señal comercial del período',
      icon: Gauge,
      label: 'Tasa de consulta',
      tone: 'warning' as const,
      value: loading ? '...' : formatMetricValue(data?.consultationRate ?? null, '%'),
    },
    {
      detail: 'visitas por día',
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
