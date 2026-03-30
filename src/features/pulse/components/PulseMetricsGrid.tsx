import AnimatedList from '@/core/components/AnimatedList';
import { MetricCard } from '@/core/components';
import type { PulseMetricsTotals } from '@/data/types/pulse';

interface PulseMetricsGridProps {
  averagePerDay: number | null;
  data: PulseMetricsTotals | undefined;
  loading: boolean;
}

export default function PulseMetricsGrid({ averagePerDay, data, loading }: PulseMetricsGridProps) {
  return (
    <AnimatedList
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      data-tour="pulse-metrics-grid"
      disabled={loading}
      key={`${data?.period ?? 'pulse'}-${loading ? 'loading' : 'ready'}`}
      staggerMs={60}
    >
      <MetricCard
        delta={data?.visitsDelta === null ? undefined : data?.visitsDelta}
        label="Visitas este mes"
        loading={loading}
        value={data?.visits ?? null}
      />
      <MetricCard
        delta={data?.contactsDelta === null ? undefined : data?.contactsDelta}
        label="Consultas recibidas"
        loading={loading}
        value={data?.contacts ?? null}
      />
      <MetricCard
        label="Tasa de consulta"
        loading={loading}
        period="Qué parte de las visitas terminó en contacto"
        unit="%"
        value={data?.consultationRate ?? null}
      />
      <MetricCard label="Promedio por día" loading={loading} unit="visitas/día" value={averagePerDay} />
    </AnimatedList>
  );
}
