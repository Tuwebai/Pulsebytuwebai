import type { FormEvent } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { SupportDraftState, SupportPriority } from '../types';

interface SupportTicketFormProps {
  formData: SupportDraftState;
  onChange: (next: SupportDraftState) => void;
  onSubmit: (event: FormEvent) => void;
}

const fieldClassName =
  'border-[var(--cliente-border-default)] bg-[var(--cliente-bg-elevated)]/55 text-[var(--cliente-text-primary)] placeholder:text-[var(--cliente-text-tertiary)] focus-visible:border-[var(--cliente-signal)] focus-visible:ring-2 focus-visible:ring-[var(--cliente-signal-glow)] focus-visible:ring-offset-0';

export default function SupportTicketForm({ formData, onChange, onSubmit }: SupportTicketFormProps) {
  return (
    <section className="rounded-[var(--cliente-card-radius)] border border-[var(--cliente-border-default)] bg-[var(--cliente-bg-surface)]/92 p-4 shadow-[var(--cliente-card-shadow)] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cliente-signal-glow)] text-[var(--cliente-signal)]">
          <Plus className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cliente-text-tertiary)]">Nuevo ticket</p>
          <h2 className="mt-2 text-lg font-medium text-[var(--cliente-text-primary)]">Cuéntanos qué necesitas</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cliente-text-secondary)]">
            Enviá tu consulta y te respondemos por este mismo canal para que no pierdas el hilo.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-[var(--cliente-text-secondary)]" htmlFor="support-title">
            Asunto
          </label>
          <Input
            ariaLabel="Asunto del ticket"
            className={fieldClassName}
            id="support-title"
            placeholder="Describe brevemente tu consulta"
            required
            value={formData.title}
            onChange={(event) => onChange({ ...formData, title: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-[var(--cliente-text-secondary)]" htmlFor="support-description">
            Mensaje
          </label>
          <Textarea
            className={`${fieldClassName} min-h-[132px] resize-none`}
            id="support-description"
            placeholder="Cuéntanos el contexto para poder ayudarte mejor"
            required
            rows={5}
            value={formData.description}
            onChange={(event) => onChange({ ...formData, description: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-[var(--cliente-text-secondary)]" htmlFor="support-priority">
            Prioridad
          </label>
          <Select value={formData.priority} onValueChange={(value: SupportPriority) => onChange({ ...formData, priority: value })}>
            <SelectTrigger ariaLabel="Prioridad del ticket" className={`${fieldClassName} h-11`} id="support-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[var(--cliente-border-default)] bg-[var(--cliente-bg-surface)] text-[var(--cliente-text-primary)]">
              <SelectItem className="focus:bg-[var(--cliente-bg-elevated)] focus:text-[var(--cliente-text-primary)]" value="low">
                Baja
              </SelectItem>
              <SelectItem className="focus:bg-[var(--cliente-bg-elevated)] focus:text-[var(--cliente-text-primary)]" value="medium">
                Media
              </SelectItem>
              <SelectItem className="focus:bg-[var(--cliente-bg-elevated)] focus:text-[var(--cliente-text-primary)]" value="high">
                Alta
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="h-11 w-full rounded-full bg-[var(--cliente-signal)] text-white hover:bg-[var(--cliente-signal-dim)]" type="submit">
          <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Enviar ticket
        </Button>
      </form>
    </section>
  );
}
