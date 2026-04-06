import { Button } from '@/core/ui/button';
import { PulseLogo } from './PulseLogo';

export interface PulseEmptyStateProps {
  hasProject?: boolean;
  onConnect?: () => void;
  website?: string | null;
  websiteStatus?: 'missing' | 'pending_review' | 'approved' | 'rejected' | null;
  ga4PropertyId?: string | null;
  connectLabel?: string;
  syncingMetrics?: boolean;
}

const WHATSAPP_SUPPORT_URL = 'https://wa.me/5491130187377?text=Necesito%20ayuda%20con%20Pulse';

export default function PulseEmptyState({
  hasProject = true,
  onConnect,
  website,
  websiteStatus,
  ga4PropertyId,
  connectLabel,
  syncingMetrics = false,
}: PulseEmptyStateProps) {
  const isPendingReview = websiteStatus === 'pending_review' && Boolean(website);
  const isApprovedWebsite = websiteStatus === 'approved' && Boolean(website);
  const isApprovedWithoutTracking = isApprovedWebsite && !ga4PropertyId;
  const isApprovedWaitingForData = isApprovedWebsite && Boolean(ga4PropertyId);
  const isWebsiteReadyWithoutProject = !hasProject && isApprovedWithoutTracking;
  const isWebsitePendingWithoutProject = !hasProject && isPendingReview;

  const title = isWebsiteReadyWithoutProject
    ? 'Tu dominio ya quedó confirmado'
    : isWebsitePendingWithoutProject
      ? 'Tu dominio ya está en revisión'
      : isPendingReview
        ? 'Tu URL ya está en revisión'
        : isApprovedWithoutTracking
          ? 'Tu dominio ya quedó aprobado'
          : isApprovedWaitingForData && syncingMetrics
            ? 'Estamos trayendo tus primeros datos'
            : isApprovedWaitingForData
              ? 'Estamos terminando de conectar tu web'
              : 'Los datos de tu web aparecen acá';

  const description = isWebsiteReadyWithoutProject
    ? 'Ya confirmamos tu dominio. Ahora estamos terminando de preparar tu espacio Pulse para mostrarte datos reales apenas quede listo.'
    : isWebsitePendingWithoutProject
      ? 'Tu dominio ya entró en revisión. Cuando quede confirmado, vamos a terminar de preparar tu espacio Pulse.'
      : isPendingReview
        ? 'Ya recibimos tu dominio y lo estamos revisando antes de conectar tus datos reales.'
        : isApprovedWithoutTracking
          ? 'Ya confirmamos tu dominio. El siguiente paso es terminar la conexión para que Pulse te muestre actividad real.'
          : isApprovedWaitingForData && syncingMetrics
            ? 'La conexión ya está hecha. Ahora estamos sincronizando el historial reciente de tu web para poblar tu tablero de Pulse.'
            : isApprovedWaitingForData
              ? 'Tu dominio ya quedó aprobado. Apenas termine la conexión de datos, vas a empezar a ver movimiento acá.'
              : 'Conectá tu dominio para ver cuántas personas te están visitando cada día.';

  const buttonLabel =
    connectLabel ??
    (isPendingReview || isApprovedWebsite ? 'Ver estado del dominio ->' : 'Enviar dominio ->');
  const helpLabel =
    isPendingReview || isApprovedWebsite ? '¿Querés avisarnos algo? Escribinos' : '¿Necesitás ayuda? Escribinos';

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div
        className="pulse-empty-float flex h-20 w-20 items-center justify-center rounded-full bg-[color:rgba(59,158,245,0.08)]"
        style={{ filter: 'drop-shadow(0 0 16px rgba(59,158,245,0.3))' }}
      >
        <PulseLogo animated size={56} variant="night" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-[var(--text-primary)]">{title}</h2>
        <p className="max-w-xl text-sm text-[var(--text-secondary)]">{description}</p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button
          className="rounded-[10px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
          onClick={onConnect}
        >
          {buttonLabel}
        </Button>

        <a
          className="text-sm text-[var(--text-secondary)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--signal)]"
          href={WHATSAPP_SUPPORT_URL}
          rel="noreferrer"
          target="_blank"
        >
          {helpLabel}
        </a>
      </div>
    </div>
  );
}
