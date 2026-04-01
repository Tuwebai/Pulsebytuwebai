import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getStatusLabel } from '../support.utils';
import type { Ticket } from '../types';

interface SupportResponseModalProps {
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  responseText: string;
  ticket: Ticket | null;
}

export default function SupportResponseModal({
  onChange,
  onClose,
  onSubmit,
  responseText,
  ticket,
}: SupportResponseModalProps) {
  if (!ticket) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_24px_64px_rgba(0,0,0,0.6)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Responder ticket</p>
            <h2 className="mt-2 text-xl font-medium text-slate-50">Seguimos la conversación</h2>
            <p className="mt-1 text-sm text-slate-400">Tu mensaje se suma al mismo hilo para que no se pierda contexto.</p>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[var(--bg-elevated)] text-slate-400 transition-colors hover:border-white/15 hover:text-slate-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-5 rounded-[18px] border border-white/10 bg-[var(--bg-elevated)]/55 px-4 py-4">
          <p className="text-[15px] font-medium text-slate-100">{ticket.title}</p>
          <p className="mt-2 text-[13px] leading-5 text-slate-400">{ticket.description}</p>
          <p className="mt-3 text-[12px] text-slate-500">Estado actual: {getStatusLabel(ticket.status)}</p>
        </div>

        <div className="mt-5 space-y-2">
          <label className="text-[13px] font-medium text-slate-400" htmlFor="support-response">
            Tu respuesta
          </label>
          <Textarea
            className="min-h-[160px] resize-none border-white/10 bg-[var(--bg-elevated)]/55 text-slate-100 placeholder:text-slate-500 focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)] focus-visible:ring-offset-0"
            id="support-response"
            placeholder="Escribe tu respuesta o una aclaración adicional"
            required
            rows={6}
            value={responseText}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button className="h-10 rounded-full border border-white/10 bg-transparent text-slate-400 hover:border-white/15 hover:bg-[var(--bg-elevated)] hover:text-slate-100" onClick={onClose} type="button" variant="outline">
            Cancelar
          </Button>
          <Button className="h-10 rounded-full bg-signal text-white hover:bg-[var(--signal-dim)]" disabled={!responseText.trim()} onClick={onSubmit} type="button">
            Enviar respuesta
          </Button>
        </div>
      </div>
    </div>
  );
}
