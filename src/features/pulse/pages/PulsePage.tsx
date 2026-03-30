import PulseChart from '../components/PulseChart';
import PulseDomainRequestGate from '../components/PulseDomainRequestGate';
import PulseMetricsGrid from '../components/PulseMetricsGrid';
import PulsePageHeader from '../components/PulsePageHeader';
import PulseSummaryCard from '../components/PulseSummaryCard';
import PulseTopPagesCard from '../components/PulseTopPagesCard';
import { usePulsePageState } from '../hooks/usePulsePageState';

export default function PulsePage() {
  const {
    averagePerDay,
    canViewMetrics,
    connectionState,
    data,
    domain,
    ga4PropertyId,
    hasProject,
    isBootstrapping,
    loading,
    onOpenSettings,
    onOpenSite,
    onRefreshMetrics,
    period,
    setPeriod,
  } = usePulsePageState();
  const dateRangeLabel = data ? `${data.dateRange.from} -> ${data.dateRange.to}` : 'sin datos todavía';

  return (
    <div className="space-y-6">
      <PulsePageHeader
        dateRangeLabel={dateRangeLabel}
        domain={domain}
        hasProject={canViewMetrics}
        isRefreshing={isBootstrapping}
        onOpenSite={onOpenSite}
        onRefreshMetrics={() => {
          void onRefreshMetrics();
        }}
        period={period}
        setPeriod={setPeriod}
      />

      {connectionState !== 'connected_with_data' && (!loading || isBootstrapping) ? (
        <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <PulseDomainRequestGate ga4PropertyId={ga4PropertyId} hasProject={hasProject} syncingMetrics={isBootstrapping} />
        </div>
      ) : null}

      <PulseMetricsGrid averagePerDay={averagePerDay} data={data} loading={loading} />

      <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5" data-tour="pulse-chart">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">Visitas por día</p>
        <div className="mt-4">
          <PulseChart data={data?.chartData ?? []} height={180} loading={loading} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PulseTopPagesCard loading={loading} topPages={data?.topPages ?? []} />
        <PulseSummaryCard data={data} onOpenSettings={onOpenSettings} />
      </section>
    </div>
  );
}
