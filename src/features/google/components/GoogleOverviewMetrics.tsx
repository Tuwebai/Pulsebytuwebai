import { MetricCard } from '@/core/components';
import type { GoogleSearchConsoleOverview } from '@/data/types/google';

interface GoogleOverviewMetricsProps {
  data: GoogleSearchConsoleOverview | undefined;
  loading?: boolean;
}

export default function GoogleOverviewMetrics({ data, loading = false }: GoogleOverviewMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MetricCard
        delta={data?.clicksDelta ?? undefined}
        label="Clics"
        loading={loading}
        period="Últimos 28 días"
        value={data?.clicks ?? null}
      />
      <MetricCard
        delta={data?.impressionsDelta ?? undefined}
        label="Impresiones"
        loading={loading}
        period="Veces que Google mostró tu web"
        value={data?.impressions ?? null}
      />
      <MetricCard
        delta={data?.ctrDelta ?? undefined}
        label="CTR"
        loading={loading}
        period="Porcentaje de impresiones que terminan en clic"
        unit="%"
        value={data?.ctr ?? null}
      />
      <MetricCard
        delta={data?.positionDelta ?? undefined}
        label="Posición promedio"
        loading={loading}
        period="Más bajo es mejor"
        value={data?.position ?? null}
      />
    </div>
  );
}
