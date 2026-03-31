import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AdminTicket } from '@/features/admin/tickets/types/adminTicket.types';
import { getTicketContact, getTicketDescription, getTicketTitle } from '@/features/admin/tickets/utils/adminTicket.utils';

interface AdminTicketResponseDialogProps {
  open: boolean;
  responseText: string;
  ticket: AdminTicket | null;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export function AdminTicketResponseDialog({
  open,
  responseText,
  ticket,
  onChange,
  onClose,
  onSubmit,
}: AdminTicketResponseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-3xl border-white/10 bg-slate-950 p-0 text-slate-100">
        <div className="rounded-[inherit] border border-white/10 bg-[linear-gradient(180deg,rgba(123,76,212,0.10),rgba(8,15,30,0.96)_24%)] p-6">
          <DialogHeader className="mb-6 space-y-2 text-left">
            <DialogTitle className="text-2xl text-slate-50">Responder ticket</DialogTitle>
            <DialogDescription className="text-slate-400">
              Dejá una respuesta clara y accionable para que el cliente entienda el próximo paso.
            </DialogDescription>
          </DialogHeader>

          {ticket ? (
            <div className="mb-5 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-base font-semibold text-slate-100">{getTicketTitle(ticket)}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{getTicketDescription(ticket) || 'Sin descripción adicional.'}</p>
              <p className="mt-3 text-xs text-slate-400">Cliente: {getTicketContact(ticket)}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="ticket-response" className="text-slate-200">Tu respuesta</Label>
            <Textarea
              id="ticket-response"
              rows={7}
              value={responseText}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Explicá qué revisó el equipo y qué sigue ahora."
              className="border-white/10 bg-slate-900 text-slate-100"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/10 bg-transparent text-slate-200 hover:bg-slate-900">
              Cancelar
            </Button>
            <Button type="button" onClick={() => void onSubmit()} disabled={!responseText.trim()} className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Enviar respuesta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
