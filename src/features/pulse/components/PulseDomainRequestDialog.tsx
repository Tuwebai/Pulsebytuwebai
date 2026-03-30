import { MessageCircle, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  getPulseDomainRequestDialogDescription,
  getPulseDomainRequestDialogTitle,
} from './pulseDomainRequestDialog.utils';

interface PulseDomainRequestDialogProps {
  canSubmit: boolean;
  domain: string;
  hasReachedLimit: boolean;
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

export default function PulseDomainRequestDialog({
  canSubmit,
  domain,
  hasReachedLimit,
  open,
  onDomainChange,
  onOpenChange,
  onSubmit,
  status,
  submitting,
  website,
  websiteReviewNotes,
}: PulseDomainRequestDialogProps) {
  const title = getPulseDomainRequestDialogTitle({ hasReachedLimit, status });
  const description = getPulseDomainRequestDialogDescription({ hasReachedLimit, status });
  const canEdit = canSubmit && (status === 'missing' || status === 'rejected');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-medium text-[var(--text-primary)]">{title}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[var(--text-secondary)]">{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {website ? (
            <div className="rounded-[16px] border border-[var(--signal-border)] bg-[color:var(--signal-glow)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">Dominio actual</p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{website}</p>
            </div>
          ) : null}

          {canEdit ? (
            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]" htmlFor="pulse-domain-request-input">
                Dominio a revisar
              </label>
              <Input
                ariaLabel="Dominio a revisar"
                className="h-12 rounded-[12px] border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                id="pulse-domain-request-input"
                onChange={(event) => onDomainChange(event.target.value)}
                placeholder="tuempresa.com"
                value={domain}
              />
              <p className="text-xs leading-5 text-[var(--text-secondary)]">
                Aceptamos dominios como <span className="font-medium text-[var(--text-primary)]">tuempresa.com</span> o <span className="font-medium text-[var(--text-primary)]">tienda.tuempresa.com</span>.
              </p>
            </div>
          ) : null}

          {websiteReviewNotes ? (
            <div className="rounded-[16px] border border-[color:rgba(245,158,11,0.24)] bg-[color:rgba(245,158,11,0.12)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">Observación del equipo</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{websiteReviewNotes}</p>
            </div>
          ) : null}

          <div className="rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <ShieldCheck className="h-4 w-4 text-[var(--signal)]" />
              <span>Qué pasa después</span>
            </div>
            <p className="mt-2 leading-6">
              Cuando compartís tu dominio, el equipo lo valida y termina la conexión para que Pulse te muestre datos reales de tu web.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:justify-between">
          <a
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--signal)]"
            href={WHATSAPP_SUPPORT_URL}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" />
            Hablar con el equipo
          </a>
          <div className="flex gap-3">
            <Button className="border border-[var(--border-default)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]" onClick={() => onOpenChange(false)} type="button" variant="ghost">
              Cerrar
            </Button>
            {canEdit ? (
              <Button
                className="bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
                disabled={submitting || !domain.trim()}
                leftIcon={<Send className="h-4 w-4" />}
                onClick={() => void onSubmit()}
                type="button"
              >
                {status === 'rejected' ? 'Corregir dominio' : 'Compartir dominio'}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
