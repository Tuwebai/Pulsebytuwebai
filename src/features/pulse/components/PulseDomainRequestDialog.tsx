import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  PulseDialogCard,
  PulseDialogFooterActions,
  PulseDomainInputCard,
  PulseNextStepCard,
  PulseStatusRow,
} from './pulseDomainRequestDialogSections';
import {
  getPulseDomainRequestDialogDescription,
  getPulseDomainRequestDialogTitle,
} from './pulseDomainRequestDialog.utils';

interface PulseDomainRequestDialogProps {
  canSubmit: boolean;
  domain: string;
  hasReachedLimit: boolean;
  historicalSyncLabel?: string | null;
  isSyncingMetrics?: boolean;
  liveSyncLabel?: string | null;
  open: boolean;
  onDomainChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<boolean>;
  status: 'missing' | 'pending_review' | 'approved' | 'rejected';
  submitting: boolean;
  website: string | null;
  websiteReviewNotes: string | null;
}

const WHATSAPP_SUPPORT_URL = 'https://wa.me/5491130187377?text=Necesito%20ayuda%20con%20el%20dominio%20de%20Pulse';

export default function PulseDomainRequestDialog(props: PulseDomainRequestDialogProps) {
  const {
    canSubmit,
    domain,
    hasReachedLimit,
    historicalSyncLabel,
    isSyncingMetrics = false,
    liveSyncLabel,
    open,
    onDomainChange,
    onOpenChange,
    onSubmit,
    status,
    submitting,
    website,
    websiteReviewNotes,
  } = props;
  const title = getPulseDomainRequestDialogTitle({ hasReachedLimit, status });
  const description = getPulseDomainRequestDialogDescription({ hasReachedLimit, status });
  const canEdit = canSubmit && (status === 'missing' || status === 'rejected');
  const syncStatusLabel = isSyncingMetrics ? 'Actualizando ahora' : historicalSyncLabel ?? 'Todavía estamos trayendo el historial';
  const liveStatusLabel = liveSyncLabel ?? 'La actividad en vivo aparece cuando Pulse detecta movimiento reciente';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-[24px] font-medium text-[var(--text-primary)]">{title}</DialogTitle>
          <DialogDescription className="max-w-[62ch] text-sm leading-6 text-[var(--text-secondary)]">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            {website ? (
              <PulseDialogCard className="border-[var(--signal-border)] bg-[color:var(--signal-glow)]" title="Dominio actual">
                <p className="mt-3 break-all text-base font-medium text-[var(--text-primary)]">{website}</p>
              </PulseDialogCard>
            ) : null}

            <PulseDialogCard className="border-[var(--border-subtle)] bg-[var(--bg-elevated)]" title="Estado de Pulse">
              <div className="mt-3 space-y-3 text-sm">
                <PulseStatusRow accentClassName="bg-[var(--signal)]" label="Historial del tablero" value={syncStatusLabel} />
                <PulseStatusRow accentClassName="bg-[var(--success)]" label="Actividad en vivo" value={liveStatusLabel} />
              </div>
            </PulseDialogCard>
          </div>

          {canEdit ? <PulseDomainInputCard domain={domain} onDomainChange={onDomainChange} /> : null}

          {websiteReviewNotes ? (
            <PulseDialogCard className="border-[color:rgba(245,158,11,0.24)] bg-[color:rgba(245,158,11,0.12)]" title="Observación del equipo">
              <p className="mt-3 text-sm leading-6 text-[var(--text-primary)]">{websiteReviewNotes}</p>
            </PulseDialogCard>
          ) : null}

          <PulseNextStepCard />
        </div>

        <DialogFooter className="flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <PulseDialogFooterActions
            canEdit={canEdit}
            domain={domain}
            onClose={() => onOpenChange(false)}
            onSubmit={() => void onSubmit()}
            status={status}
            submitting={submitting}
            whatsappSupportUrl={WHATSAPP_SUPPORT_URL}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
