import PulseChart from '../components/PulseChart';
import PulseDomainRequestDialog from '../components/PulseDomainRequestDialog';
import PulseDomainRequestGate from '../components/PulseDomainRequestGate';
import PulseMetricsGrid from '../components/PulseMetricsGrid';
import PulsePageHeader from '../components/PulsePageHeader';
import PulseRealtimeCard from '../components/PulseRealtimeCard';
import PulseSummaryCard from '../components/PulseSummaryCard';
import PulseTopPagesCard from '../components/PulseTopPagesCard';
import { usePulseDomainRequest } from '../hooks/usePulseDomainRequest';
import { usePulsePageState } from '../hooks/usePulsePageState';

function getSummaryActionLabel(status: 'missing' | 'pending_review' | 'approved' | 'rejected', hasReachedLimit: boolean) {
  if (status === 'missing') {
    return 'Conectar mi web';
  }

  if (status === 'rejected') {
    return hasReachedLimit ? 'Ver estado de la conexión' : 'Corregir dominio';
  }

  return 'Ver estado de la conexión';
}

export default function PulsePage() {
  const domainRequest = usePulseDomainRequest();
  const {
    averagePerDay,
    canViewMetrics,
    connectionState,
    data,
    defaultChartMode,
    domain,
    ga4PropertyId,
    hasProject,
    isBootstrapping,
    lastUpdatedLabel,
    loading,
    realtimeData,
    realtimeError,
    realtimeLoading,
    realtimeSampleLabel,
    settings,
    onOpenSite,
    onRefreshMetrics,
    period,
    setPeriod,
  } = usePulsePageState();
  const showTopPages = settings?.showTopPagesModule !== false;
  const showSummary = settings?.showSummaryModule !== false;
  const dateRangeLabel = data ? `${data.dateRange.from} -> ${data.dateRange.to}` : 'sin datos todavía';

  return (
    <div className="space-y-6">
      <PulsePageHeader
        dateRangeLabel={dateRangeLabel}
        domain={domain}
        hasProject={canViewMetrics}
        isRefreshing={isBootstrapping}
        lastUpdatedLabel={lastUpdatedLabel}
        onOpenSite={onOpenSite}
        onRefreshMetrics={() => {
          void onRefreshMetrics();
        }}
        period={period}
        setPeriod={setPeriod}
      />

      {connectionState !== 'connected_with_data' && (!loading || isBootstrapping) ? (
        <div className="rounded-[var(--cliente-card-radius)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--cliente-card-shadow)]">
          <PulseDomainRequestGate ga4PropertyId={ga4PropertyId} hasProject={hasProject} syncingMetrics={isBootstrapping} />
        </div>
      ) : null}

      <PulseMetricsGrid averagePerDay={averagePerDay} data={data} loading={loading} />

      {canViewMetrics && settings?.showRealtimeModule !== false ? (
        <PulseRealtimeCard data={realtimeData} domain={domain} error={realtimeError} loading={realtimeLoading} />
      ) : null}

      <section
        className="rounded-[var(--cliente-card-radius)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-[var(--cliente-card-padding-mobile)] py-[var(--cliente-card-padding-mobile)] shadow-[var(--cliente-card-shadow)] md:px-[var(--cliente-card-padding)] md:py-[var(--cliente-card-padding)]"
        data-tour="pulse-chart"
      >
        <PulseChart data={data?.chartData ?? []} defaultMode={defaultChartMode} height={180} loading={loading} />
      </section>

      {showTopPages || showSummary ? (
        <section className={`grid gap-[var(--cliente-grid-gap-mobile)] md:gap-[var(--cliente-grid-gap)] ${showTopPages && showSummary ? 'xl:grid-cols-[1.2fr_0.8fr]' : ''}`}>
          {showTopPages ? <PulseTopPagesCard domain={domain} loading={loading} topPages={data?.topPages ?? []} /> : null}
          {showSummary ? (
            <PulseSummaryCard
              actionLabel={getSummaryActionLabel(domainRequest.status, domainRequest.hasReachedLimit)}
              data={data}
              onAction={domainRequest.openDialog}
            />
          ) : null}
        </section>
      ) : null}

      <PulseDomainRequestDialog
        canSubmit={domainRequest.canSubmit}
        domain={domainRequest.domain}
        hasReachedLimit={domainRequest.hasReachedLimit}
        historicalSyncLabel={lastUpdatedLabel}
        isSyncingMetrics={isBootstrapping}
        liveSyncLabel={realtimeSampleLabel}
        onDomainChange={domainRequest.setDomain}
        onOpenChange={domainRequest.setOpen}
        onSubmit={domainRequest.submit}
        open={domainRequest.open}
        status={domainRequest.status}
        submitting={domainRequest.submitting}
        website={domainRequest.website}
        websiteReviewNotes={domainRequest.websiteReviewNotes}
      />
    </div>
  );
}
