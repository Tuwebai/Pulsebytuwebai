import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startGoogleSearchConsoleConnect } from '@/api/googleSearchConsole.api';
import type { GoogleSearchConsoleMetricKey, GoogleSearchConsolePeriod } from '@/data/types/google';
import GoogleConnectionCard from '../components/GoogleConnectionCard';
import GoogleFiltersBar from '../components/GoogleFiltersBar';
import GoogleOverviewCard from '../components/GoogleOverviewCard';
import GooglePageHeader from '../components/GooglePageHeader';
import GoogleTopTableCard from '../components/GoogleTopTableCard';
import { useGoogleSearchConsoleOverview } from '../hooks/useGoogleSearchConsoleOverview';
import { useGooglePageState } from '../hooks/useGooglePageState';
import {
  getGoogleFeedback,
  type GoogleFeedbackReason,
  type GoogleFeedbackStatus,
} from '../services/googleFeedback.service';

export default function GooglePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [period, setPeriod] = useState<GoogleSearchConsolePeriod>('last_28_days');
  const [activeMetrics, setActiveMetrics] = useState<GoogleSearchConsoleMetricKey[]>(['clicks', 'impressions', 'ctr', 'position']);
  const [feedbackStatus, setFeedbackStatus] = useState<GoogleFeedbackStatus>(null);
  const [feedbackReason, setFeedbackReason] = useState<GoogleFeedbackReason>(null);
  const { connectionCopy, connectionRecord, connectionState, domain, hasProject, projectId } = useGooglePageState();
  const overviewQuery = useGoogleSearchConsoleOverview(projectId, connectionRecord, period);
  const feedback = useMemo(() => getGoogleFeedback(feedbackStatus, feedbackReason), [feedbackReason, feedbackStatus]);
  const isConnected = connectionRecord?.connectionStatus === 'connected';

  useEffect(() => {
    const status = searchParams.get('google') as GoogleFeedbackStatus;
    const reason = searchParams.get('reason') as GoogleFeedbackReason;

    if (!status) {
      return;
    }

    if (status === 'connected') {
      void queryClient.invalidateQueries({ queryKey: ['google-search-console-connection', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['google-search-console-overview', projectId] });
    }

    setFeedbackStatus(status);
    setFeedbackReason(reason ?? null);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('google');
    setSearchParams(nextParams, { replace: true });
  }, [projectId, queryClient, searchParams, setSearchParams]);

  const handlePrimaryAction = () => {
    if (connectionState === 'missing_site' || !hasProject) {
      navigate('/dashboard/configuracion');
      return;
    }

    if (connectionState === 'pending_review') {
      navigate('/dashboard/soporte');
      return;
    }

    if (!projectId) {
      return;
    }

    setIsConnecting(true);
    const returnToOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    void startGoogleSearchConsoleConnect(projectId, returnToOrigin)
      .then(({ authorizationUrl }) => {
        window.location.assign(authorizationUrl);
      })
      .catch((error) => {
        setIsConnecting(false);
        console.error('[GooglePage] connect', error);
        setFeedbackStatus('error');
      });
  };

  const secondaryText =
    connectionRecord?.siteUrl && connectionRecord.googleAccountEmail
      ? `Propiedad activa: ${connectionRecord.siteUrl} · Cuenta: ${connectionRecord.googleAccountEmail}`
      : connectionRecord?.siteUrl
        ? `Propiedad activa: ${connectionRecord.siteUrl}`
        : null;

  const toggleMetric = (metric: GoogleSearchConsoleMetricKey) => {
    setActiveMetrics((current) => {
      if (current.includes(metric)) {
        return current.length === 1 ? current : current.filter((item) => item !== metric);
      }

      return [...current, metric];
    });
  };

  return (
    <div className="space-y-6">
      <GooglePageHeader
        badgeLabel={connectionCopy.badgeLabel}
        badgeVariant={connectionCopy.badgeVariant}
        domain={domain}
        googleAccountEmail={connectionRecord?.googleAccountEmail ?? null}
      />

      {feedback ? (
        <section className={`rounded-[20px] border p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] ${feedback.className}`}>
          <div className="flex items-start gap-3">
            <feedback.icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-medium">{feedback.title}</p>
              <p className="mt-1 text-[14px] leading-6 text-[var(--text-secondary)]">{feedback.description}</p>
            </div>
          </div>
        </section>
      ) : null}

      {isConnected ? (
        <>
          <GoogleFiltersBar onPeriodChange={setPeriod} period={period} />
          <GoogleOverviewCard
            activeMetrics={activeMetrics}
            data={overviewQuery.data}
            isLoading={overviewQuery.isLoading}
            onToggleMetric={toggleMetric}
          />
          <GoogleTopTableCard
            pages={overviewQuery.data?.topPages ?? []}
            queries={overviewQuery.data?.topQueries ?? []}
            topDays={overviewQuery.data?.topDays ?? []}
          />
        </>
      ) : (
        <GoogleConnectionCard
          actionLabel={connectionCopy.actionLabel}
          description={connectionCopy.description}
          isLoading={isConnecting}
          onAction={handlePrimaryAction}
          secondaryText={secondaryText}
          title={connectionCopy.title}
        />
      )}
    </div>
  );
}
