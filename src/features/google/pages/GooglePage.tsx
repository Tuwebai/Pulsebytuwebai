import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { startGoogleSearchConsoleConnect } from '@/api/googleSearchConsole.api';
import { toast } from '@/hooks/use-toast';
import GoogleConnectionCard from '../components/GoogleConnectionCard';
import GoogleModulePreviewCard from '../components/GoogleModulePreviewCard';
import GooglePageHeader from '../components/GooglePageHeader';
import { useGooglePageState } from '../hooks/useGooglePageState';

export default function GooglePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectionCopy, connectionRecord, connectionState, domain, hasProject, projectId } = useGooglePageState();

  useEffect(() => {
    const status = searchParams.get('google');

    if (!status) {
      return;
    }

    if (status === 'connected') {
      toast({
        title: 'Google ya quedó conectado',
        description: 'Pulse ya puede usar esta conexión para traer datos del proyecto.',
      });
      void queryClient.invalidateQueries({ queryKey: ['google-search-console-connection', projectId] });
    }

    if (status === 'property-not-found') {
      toast({
        title: 'No encontramos la propiedad correcta',
        description: 'La cuenta se conectó, pero no devolvió una propiedad que coincida con tu dominio.',
        variant: 'destructive',
      });
    }

    if (status === 'error') {
      toast({
        title: 'No pudimos conectar Google',
        description: 'Probá de nuevo en unos minutos. Si persiste, revisamos la conexión desde soporte.',
        variant: 'destructive',
      });
    }

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
    void startGoogleSearchConsoleConnect(projectId)
      .then(({ authorizationUrl }) => {
        window.location.assign(authorizationUrl);
      })
      .catch((error) => {
        setIsConnecting(false);
        toast({
          title: 'No pudimos abrir Google',
          description: error instanceof Error ? error.message : 'Probá de nuevo en unos minutos.',
          variant: 'destructive',
        });
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
