import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/core/ui/button';
import { Input } from '@/core/ui/input';
import { Textarea } from '@/core/ui/textarea';
import type { SupportDraftState } from '@/features/support';

interface SupportConversationComposerViewProps {
  draft: SupportDraftState;
  fieldClassName: string;
  onBack: () => void;
  onCreateTicket: () => void;
  onDraftChange: (next: SupportDraftState) => void;
}

export default function SupportConversationComposerView({
  draft,
  fieldClassName,
  onBack,
  onCreateTicket,
  onDraftChange,
}: SupportConversationComposerViewProps) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-4">
        <button
          aria-label="Volver a conversaciones"
          className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-2 text-[var(--text-secondary)] transition-colors hover:border-[var(--signal-border)] hover:text-[var(--text-primary)]"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Nuevo ticket</p>
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Abrir conversacion</h3>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-base)] px-4 py-4">
        <div className="space-y-4">
          <Input
            ariaLabel="Asunto del ticket"
            className={fieldClassName}
            placeholder="Asunto"
            value={draft.title}
            onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
          />
          <Textarea
            className={`${fieldClassName} min-h-[180px] resize-none`}
            placeholder="Escribe tu mensaje inicial"
            value={draft.description}
            onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
          />
        </div>
      </div>

      <div className="border-t border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
        <Button
          className="h-11 w-full rounded-full bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
          type="button"
          onClick={onCreateTicket}
        >
          <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Enviar ticket
        </Button>
      </div>
    </>
  );
}
