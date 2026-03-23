import type { FormEvent } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { SupportDraftState } from '../types';

interface SupportTicketFormProps {
  formData: SupportDraftState;
  onChange: (next: SupportDraftState) => void;
  onSubmit: (event: FormEvent) => void;
}

const fieldClassName =
  'border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--signal)] focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)] focus-visible:ring-offset-0';

export default function SupportTicketForm({ formData, onChange, onSubmit }: SupportTicketFormProps) {
  return (
    <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[color:rgba(59,158,245,0.25)] bg-[color:rgba(59,158,245,0.14)]">
          <Plus className="h-5 w-5 text-[var(--signal)]" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[16px] font-medium text-[var(--text-primary)]">Nuevo ticket</h2>
          <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
            Enviá tu consulta y el equipo te responde por este mismo canal.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-[var(--text-secondary)]" htmlFor="support-title">
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
          <label className="text-[13px] font-medium text-[var(--text-secondary)]" htmlFor="support-description">
            Mensaje
          </label>
          <Textarea
            className={`${fieldClassName} min-h-[132px] resize-none`}
            id="support-description"
            placeholder="Contanos el contexto para poder ayudarte mejor"
            required
            rows={5}
            value={formData.description}
            onChange={(event) => onChange({ ...formData, description: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-medium text-[var(--text-secondary)]" htmlFor="support-priority">
            Prioridad
          </label>
          <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => onChange({ ...formData, priority: value })}>
            <SelectTrigger
              ariaLabel="Prioridad del ticket"
              className={`${fieldClassName} h-11`}
              id="support-priority"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
              <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)]" value="low">
                Baja
              </SelectItem>
              <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)]" value="medium">
                Media
              </SelectItem>
              <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)]" value="high">
                Alta
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="h-11 w-full rounded-[12px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]" type="submit">
          <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Enviar ticket
        </Button>
      </form>
    </section>
  );
}
