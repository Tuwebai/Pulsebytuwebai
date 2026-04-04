import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CircleAlert, CircleCheckBig } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startGoogleSearchConsoleConnect } from '@/api/googleSearchConsole.api';
import GoogleConnectionCard from '../components/GoogleConnectionCard';
import GoogleModulePreviewCard from '../components/GoogleModulePreviewCard';
import GooglePageHeader from '../components/GooglePageHeader';
import { useGooglePageState } from '../hooks/useGooglePageState';

type GoogleFeedbackStatus = 'connected' | 'property-not-found' | 'error' | null;

function getGoogleFeedback(status: GoogleFeedbackStatus) {
  if (status === 'connected') {
    return {
      className: 'border-[var(--success)]/25 bg-[var(--success-dim)] text-[var(--text-primary)]',
      description: 'Pulse ya puede usar esta conexión para traer datos del proyecto.',
      icon: CircleCheckBig,
      title: 'Google ya quedó conectado',
    };
  }

  if (status === 'property-not-found') {
    return {
      className: 'border-[var(--warning)]/25 bg-[var(--warning-dim)] text-[var(--text-primary)]',
      description: 'La cuenta se conectó, pero no devolvió una propiedad que coincida con tu dominio.',
      icon: CircleAlert,
      title: 'No encontramos la propiedad correcta',
    };
  }

  if (status === 'error') {
    return {
      className: 'border-[var(--danger)]/25 bg-[var(--danger-dim)] text-[var(--text-primary)]',
      description: 'Probá de nuevo en unos minutos. Si persiste, revisamos la conexión desde soporte.',
      icon: CircleAlert,
      title: 'No pudimos conectar Google',
    };
  }

  return null;
}

export default function GooglePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<GoogleFeedbackStatus>(null);
  const { connectionCopy, connectionRecord, connectionState, domain, hasProject, projectId } = useGooglePageState();
  const feedback = useMemo(() => getGoogleFeedback(feedbackStatus), [feedbackStatus]);

  useEffect(() => {
    const status = searchParams.get('google') as GoogleFeedbackStatus;

    if (!status) {
      return;
    }

    if (status === 'connected') {
      void queryClient.invalidateQueries({ queryKey: ['google-search-console-connection', projectId] });
    }

    setFeedbackStatus(status);

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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GoogleConnectionCard
          actionLabel={connectionCopy.actionLabel}
          description={connectionCopy.description}
          isLoading={isConnecting}
          onAction={handlePrimaryAction}
          secondaryText={secondaryText}
          title={connectionCopy.title}
        />
        <GoogleModulePreviewCard />
      </div>
    </div>
  );
}
