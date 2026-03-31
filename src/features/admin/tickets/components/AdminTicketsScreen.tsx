import { Ticket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminTicketFormDialog } from '@/features/admin/tickets/components/AdminTicketFormDialog';
import { AdminTicketResponseDialog } from '@/features/admin/tickets/components/AdminTicketResponseDialog';
import { AdminTicketsFilters } from '@/features/admin/tickets/components/AdminTicketsFilters';
import { AdminTicketsHeader } from '@/features/admin/tickets/components/AdminTicketsHeader';
import { AdminTicketsList } from '@/features/admin/tickets/components/AdminTicketsList';
import { AdminTicketsStats } from '@/features/admin/tickets/components/AdminTicketsStats';
import { useAdminTicketsScreen } from '@/features/admin/tickets/hooks/useAdminTicketsScreen';
import type { AdminTicketsScreenProps } from '@/features/admin/tickets/types/adminTicket.types';

export default function AdminTicketsScreen(props: AdminTicketsScreenProps) {
  const screen = useAdminTicketsScreen(props);

  return (
    <div className="space-y-6">
      <AdminTicketsHeader
        lastUpdate={props.lastUpdate}
        onCreate={screen.openCreateForm}
        onRefresh={props.refreshData}
      />

      <AdminTicketsStats stats={screen.stats} />

      <AdminTicketsFilters
        filters={screen.filters}
        onChange={(updates) => screen.setFilters((current) => ({ ...current, ...updates }))}
      />

      {screen.loading ? (
        <section className="rounded-3xl border border-white/10 bg-slate-900/50 px-6 py-16 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
          <p className="text-sm text-slate-400">Cargando tickets del equipo...</p>
        </section>
      ) : screen.isEmpty ? (
        <section className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 px-6 py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-950/70">
            <Ticket className="h-8 w-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-50">Todavía no hay tickets en la bandeja</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Cuando un cliente abra una consulta, la vas a ver acá con su estado, prioridad y seguimiento.
          </p>
          <Button onClick={screen.openCreateForm} className="mt-6 bg-sky-500 text-slate-950 hover:bg-sky-400">
            Crear primer ticket
          </Button>
        </section>
      ) : (
        <AdminTicketsList
          tickets={screen.filteredTickets}
          onDelete={(ticketId) => void screen.handleDelete(ticketId)}
          onEdit={screen.openEditForm}
          onRespond={screen.openResponseForm}
          onStatusChange={(ticketId, status) => void screen.handleStatusChange(ticketId, status)}
        />
      )}

      <AdminTicketFormDialog
        editing={Boolean(screen.editingTicket)}
        formData={screen.formData}
        open={screen.showForm}
        onChange={(updates) => screen.setFormData((current) => ({ ...current, ...updates }))}
        onClose={screen.resetFormState}
        onSubmit={screen.handleSubmit}
      />

      <AdminTicketResponseDialog
        open={Boolean(screen.respondingTicket)}
        responseText={screen.responseText}
        ticket={screen.respondingTicket}
        onChange={screen.setResponseText}
        onClose={screen.resetResponseState}
        onSubmit={screen.handleSubmitResponse}
      />
    </div>
  );
}
