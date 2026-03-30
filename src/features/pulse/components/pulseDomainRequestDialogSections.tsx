import { MessageCircle, Send, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PulseDialogCard({
  children,
  className = '',
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section className={`rounded-[16px] border px-4 py-4 ${className}`.trim()}>
      <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">{title}</p>
      {children}
    </section>
  );
}

export function PulseStatusRow({ accentClassName, label, value }: { accentClassName: string; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-[12px] bg-[var(--bg-surface)]/60 px-3 py-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className={`h-2 w-2 rounded-full ${accentClassName}`} />
        <span className="text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="text-sm text-[var(--text-primary)] sm:ml-auto sm:text-right">{value}</span>
    </div>
  );
}

export function PulseNextStepCard() {
  return (
    <PulseDialogCard
      className="border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
      title="Qué pasa después"
    >
      <div className="mt-3 flex items-start gap-2 text-sm text-[var(--text-secondary)]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />
        <p className="leading-6">
          Cuando compartís tu dominio, el equipo lo valida y termina la conexión para que Pulse te muestre datos reales de tu web.
        </p>
      </div>
    </PulseDialogCard>
  );
}

export function PulseDomainInputCard({
  domain,
  onDomainChange,
}: {
  domain: string;
  onDomainChange: (value: string) => void;
}) {
  return (
    <PulseDialogCard className="border-[var(--border-subtle)] bg-[var(--bg-elevated)]" title="Dominio a revisar">
      <div className="mt-3 space-y-3">
        <Input
          ariaLabel="Dominio a revisar"
          className="h-12 rounded-[12px] border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          id="pulse-domain-request-input"
          onChange={(event) => onDomainChange(event.target.value)}
          placeholder="tuempresa.com"
          value={domain}
        />
        <p className="text-xs leading-5 text-[var(--text-secondary)]">
          Aceptamos dominios como <span className="font-medium text-[var(--text-primary)]">tuempresa.com</span> o <span className="font-medium text-[var(--text-primary)]">tienda.tuempresa.com</span>.
        </p>
      </div>
    </PulseDialogCard>
  );
}

export function PulseDialogFooterActions({
  canEdit,
  domain,
  onClose,
  onSubmit,
  status,
  submitting,
  whatsappSupportUrl,
}: {
  canEdit: boolean;
  domain: string;
  onClose: () => void;
  onSubmit: () => void;
  status: 'missing' | 'pending_review' | 'approved' | 'rejected';
  submitting: boolean;
  whatsappSupportUrl: string;
}) {
  return (
    <>
      <a
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--signal)]"
        href={whatsappSupportUrl}
        rel="noreferrer"
        target="_blank"
      >
        <MessageCircle className="h-4 w-4" />
        Hablar con el equipo
      </a>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="border border-[var(--border-default)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]" onClick={onClose} type="button" variant="ghost">
          Cerrar
        </Button>
        {canEdit ? (
          <Button
            className="bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
            disabled={submitting || !domain.trim()}
            leftIcon={<Send className="h-4 w-4" />}
            onClick={onSubmit}
            type="button"
          >
            {status === 'rejected' ? 'Corregir dominio' : 'Compartir dominio'}
          </Button>
        ) : null}
      </div>
    </>
  );
}
