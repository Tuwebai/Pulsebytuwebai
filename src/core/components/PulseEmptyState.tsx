import { Button } from '@/components/ui/button';
import { PulseLogo } from './PulseLogo';

export interface PulseEmptyStateProps {
  hasProject?: boolean;
  onConnect?: () => void;
  website?: string | null;
  websiteStatus?: 'missing' | 'pending_review' | 'approved' | 'rejected' | null;
  ga4PropertyId?: string | null;
  connectLabel?: string;
}

const WHATSAPP_SUPPORT_URL = 'https://wa.me/5491130187377?text=Necesito%20ayuda%20con%20Pulse';

export default function PulseEmptyState({
  hasProject = true,
  onConnect,
  website,
  websiteStatus,
  ga4PropertyId,
  connectLabel,
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
          : isApprovedWaitingForData
            ? 'Estamos terminando de conectar tu web'
            : 'Los datos de tu web aparecen acá';

  const description = isWebsiteReadyWithoutProject
    ? 'Ya validamos tu URL. Ahora estamos terminando de vincular tu espacio Pulse para mostrarte datos reales apenas quede listo.'
    : isWebsitePendingWithoutProject
      ? 'Tu URL ya entró en revisión. Cuando el equipo la confirme, vamos a terminar de preparar tu espacio Pulse.'
      : isPendingReview
        ? 'Tu equipo de TuWebAI ya recibió la URL y la está revisando antes de conectar los datos reales.'
        : isApprovedWithoutTracking
          ? 'Ya confirmamos tu URL. El siguiente paso es terminar la vinculación de datos del proyecto para que Pulse te muestre actividad real.'
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
