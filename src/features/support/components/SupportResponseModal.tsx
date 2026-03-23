import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getStatusLabel } from '../support.utils';
import type { Ticket } from '../types';

interface SupportResponseModalProps {
  ticket: Ticket | null;
  responseText: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SupportResponseModal({
  ticket,
  responseText,
  onChange,
  onClose,
  onSubmit
}: SupportResponseModalProps) {
  if (!ticket) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-medium text-[var(--text-primary)]">Responder al equipo</h2>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              Seguimos la conversación desde este mismo ticket.
            </p>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            type="button"
            onClick={onClose}
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-5 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4">
          <p className="text-[15px] font-medium text-[var(--text-primary)]">{ticket.title}</p>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{ticket.description}</p>
          <p className="mt-3 text-[12px] text-[var(--text-tertiary)]">Estado actual: {getStatusLabel(ticket.status)}</p>
        </div>

        <div className="mt-5 space-y-2">
          <label className="text-[13px] font-medium text-[var(--text-secondary)]" htmlFor="support-response">
            Tu respuesta
          </label>
          <Textarea
            className="min-h-[160px] resize-none border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--signal)] focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)] focus-visible:ring-offset-0"
            id="support-response"
            placeholder="Escribí tu respuesta o una consulta adicional"
            required
            rows={6}
            value={responseText}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            className="rounded-[10px] border border-[var(--border-default)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="rounded-[10px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
            disabled={!responseText.trim()}
            type="button"
            onClick={onSubmit}
          >
            Enviar respuesta
          </Button>
        </div>
      </div>
    </div>
  );
}
