import { Button } from '@/components/ui/button';
import { PulseLogo } from './PulseLogo';

export interface PulseEmptyStateProps {
  onConnect?: () => void;
  website?: string | null;
  websiteStatus?: 'missing' | 'pending_review' | 'approved' | 'rejected' | null;
}

const WHATSAPP_SUPPORT_URL = 'https://wa.me/5491130187377?text=Necesito%20ayuda%20con%20Pulse';

export default function PulseEmptyState({ onConnect, website, websiteStatus }: PulseEmptyStateProps) {
  const isPendingReview = websiteStatus === 'pending_review' && Boolean(website);
  const isApprovedWithoutData = websiteStatus === 'approved' && Boolean(website);

  const title = isPendingReview
    ? 'Tu URL ya esta en revision'
    : isApprovedWithoutData
      ? 'Estamos terminando de conectar tu web'
      : 'Los datos de tu web aparecen aca';

  const description = isPendingReview
    ? 'Tu equipo de TuWebAI ya recibio la URL y la esta revisando antes de conectar los datos reales.'
    : isApprovedWithoutData
      ? 'Tu dominio ya quedo aprobado. Apenas termine la conexion de datos, vas a empezar a ver movimiento aca.'
      : 'Conecta tu dominio para ver cuantas personas te estan visitando cada dia.';

  const buttonLabel = isPendingReview || isApprovedWithoutData ? 'Revisar configuracion ->' : 'Conectar mi web ->';
  const helpLabel = isPendingReview || isApprovedWithoutData ? 'Quieres avisarnos algo? Escribinos' : 'Necesitas ayuda? Escribinos';

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
