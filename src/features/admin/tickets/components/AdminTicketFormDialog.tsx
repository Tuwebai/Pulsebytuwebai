import type { FormEvent } from 'react';

import { Button } from '@/core/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/core/ui/dialog';
import { Input } from '@/core/ui/input';
import { Label } from '@/core/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/ui/select';
import { Textarea } from '@/core/ui/textarea';
import type { TicketFormData, TicketPriority, TicketStatus } from '@/features/admin/tickets/types/adminTicket.types';

interface AdminTicketFormDialogProps {
  editing: boolean;
  formData: TicketFormData;
  open: boolean;
  onChange: (updates: Partial<TicketFormData>) => void;
  onClose: () => void;
  onSubmit: () => Promise<boolean>;
}

export function AdminTicketFormDialog({
  editing,
  formData,
  open,
  onChange,
  onClose,
  onSubmit,
}: AdminTicketFormDialogProps) {
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const saved = await onSubmit();
    if (saved) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-3xl border-white/10 bg-[var(--bg-surface)] p-0 text-slate-100">
        <div className="rounded-[inherit] border border-white/10 bg-[linear-gradient(180deg,rgba(59,158,245,0.12),rgba(8,15,30,0.97)_28%)] p-6">
          <DialogHeader className="mb-6 space-y-2 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">Pulse admin · tickets</p>
            <DialogTitle className="text-2xl text-slate-50">{editing ? 'Editar ticket' : 'Nuevo ticket'}</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-400">
              Dejá claro el contexto inicial. La asignación del admin sucede cuando alguien toma o responde el ticket.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ticket-title" className="text-slate-200">Asunto</Label>
                <Input
                  id="ticket-title"
                  required
                  value={formData.title}
                  onChange={(event) => onChange({ title: event.target.value })}
                  className="border-white/10 bg-[var(--bg-base)] text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(value: TicketPriority) => onChange({ priority: value })}>
                  <SelectTrigger className="border-white/10 bg-[var(--bg-base)] text-slate-100 [&_svg]:text-slate-400"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-slate-100">
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Estado</Label>
                <Select value={formData.status} onValueChange={(value: TicketStatus) => onChange({ status: value })}>
                  <SelectTrigger className="border-white/10 bg-[var(--bg-base)] text-slate-100 [&_svg]:text-slate-400"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-slate-100">
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En progreso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ticket-description" className="text-slate-200">Mensaje</Label>
                <Textarea
                  id="ticket-description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(event) => onChange({ description: event.target.value })}
                  className="border-white/10 bg-[var(--bg-base)] text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="border-white/10 bg-transparent text-slate-200 hover:bg-slate-900">
                Cancelar
              </Button>
              <Button type="submit" className="bg-sky-500 text-slate-950 hover:bg-sky-400">
                {editing ? 'Guardar cambios' : 'Crear ticket'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
