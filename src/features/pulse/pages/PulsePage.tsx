import PulseChart from '../components/PulseChart';
import PulseConnectionBanner from '../components/PulseConnectionBanner';
import PulseDomainRequestGate from '../components/PulseDomainRequestGate';
import PulseMetricsGrid from '../components/PulseMetricsGrid';
import PulsePageHeader from '../components/PulsePageHeader';
import PulseSummaryCard from '../components/PulseSummaryCard';
import PulseTopPagesCard from '../components/PulseTopPagesCard';
import { usePulsePageState } from '../hooks/usePulsePageState';

export default function PulsePage() {
  const {
    averagePerDay,
    data,
    domain,
    ga4PropertyId,
    hasGa4,
    hasProject,
    loading,
    onOpenSettings,
    onOpenSite,
    period,
    setPeriod,
    websiteApprovedWithoutData,
    websitePendingReview,
  } = usePulsePageState();

  return (
    <div className="space-y-6">
      <PulsePageHeader
        dateRangeLabel={data ? `${data.dateRange.from} -> ${data.dateRange.to}` : 'sin datos todavía'}
        domain={hasProject ? domain : null}
        hasProject={hasProject}
        onOpenSite={onOpenSite}
        period={period}
        setPeriod={setPeriod}
      />

      {!hasProject && !loading ? (
        <div className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <PulseDomainRequestGate ga4PropertyId={ga4PropertyId} hasProject={false} />
        </div>
      ) : null}

      {hasProject && !hasGa4 ? (
        <PulseConnectionBanner
          websiteApprovedWithoutData={websiteApprovedWithoutData}
          websitePendingReview={websitePendingReview}
        />
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
