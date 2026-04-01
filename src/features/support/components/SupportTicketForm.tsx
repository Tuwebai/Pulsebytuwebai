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
  'border-white/10 bg-[var(--bg-elevated)]/55 text-slate-100 placeholder:text-slate-500 focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)] focus-visible:ring-offset-0';

export default function SupportTicketForm({ formData, onChange, onSubmit }: SupportTicketFormProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal/15 text-signal">
          <Plus className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Nuevo ticket</p>
          <h2 className="mt-2 text-lg font-medium text-slate-100">Cuéntanos qué necesitas</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Enviá tu consulta y te respondemos por este mismo canal para que no pierdas el hilo.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-slate-400" htmlFor="support-title">
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
          <label className="text-[13px] font-medium text-slate-400" htmlFor="support-description">
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
          <label className="text-[13px] font-medium text-slate-400" htmlFor="support-priority">
            Prioridad
          </label>
          <Select value={formData.priority} onValueChange={(value: SupportPriority) => onChange({ ...formData, priority: value })}>
            <SelectTrigger ariaLabel="Prioridad del ticket" className={`${fieldClassName} h-11`} id="support-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[var(--bg-surface)] text-slate-100">
              <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-slate-100" value="low">
                Baja
              </SelectItem>
              <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-slate-100" value="medium">
                Media
              </SelectItem>
              <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-slate-100" value="high">
                Alta
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="h-11 w-full rounded-full bg-signal text-white hover:bg-[var(--signal-dim)]" type="submit">
          <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Enviar ticket
        </Button>
      </form>
    </section>
  );
}
