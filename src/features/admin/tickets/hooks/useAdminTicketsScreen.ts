import { useEffect, useMemo, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { useAdminTicketMutations } from '@/features/admin/tickets/hooks/useAdminTicketMutations';
import { useAdminTicketsRealtime } from '@/features/admin/tickets/hooks/useAdminTicketsRealtime';
import type { AdminTicket, AdminTicketsScreenProps, TicketFormData } from '@/features/admin/tickets/types/adminTicket.types';
import {
  INITIAL_TICKET_FILTERS,
  INITIAL_TICKET_FORM,
  INITIAL_TICKET_STATS,
  buildFormDataFromTicket,
  calculateTicketStats,
  filterAndSortTickets,
} from '@/features/admin/tickets/utils/adminTicket.utils';
import { ticketService } from '@/features/support/services/ticket.service';
import { toast } from '@/hooks/use-toast';

export function useAdminTicketsScreen({ tickets: externalTickets, refreshData }: AdminTicketsScreenProps) {
  const { user } = useApp();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<AdminTicket | null>(null);
  const [formData, setFormData] = useState<TicketFormData>(INITIAL_TICKET_FORM);
  const [filters, setFilters] = useState(INITIAL_TICKET_FILTERS);

  useEffect(() => {
    if (externalTickets) {
      setTickets(externalTickets);
      setLoading(false);
      return;
    }

    void loadTickets();
  }, [externalTickets]);

  useAdminTicketsRealtime({ enabled: !externalTickets, onRefresh: () => void loadTickets() });

  const filteredTickets = useMemo(() => filterAndSortTickets(tickets, filters), [tickets, filters]);
  const stats = useMemo(() => calculateTicketStats(tickets), [tickets]);
  const isEmpty = !loading && tickets.length === 0;

  async function loadTickets() {
    try {
      setLoading(true);
      const ticketsData = await ticketService.getTickets();
      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: 'No pudimos cargar los tickets',
        description: 'Volvé a intentar en unos segundos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  function resetFormState() {
    setShowForm(false);
    setEditingTicket(null);
    setFormData(INITIAL_TICKET_FORM);
  }

  async function refreshTickets() {
    if (refreshData) {
      refreshData();
      return;
    }

    await loadTickets();
  }

  const mutations = useAdminTicketMutations({
    editingTicket,
    formData,
    refreshTickets,
    setTickets,
  });

  async function handleSubmit() {
    const saved = await mutations.submitTicket();
    if (saved) {
      resetFormState();
    }
    return saved;
  }

  async function handleDelete(ticketId: string) {
    await mutations.deleteTicket(ticketId);
  }

  async function handleStatusChange(ticketId: string, newStatus: string) {
    await mutations.updateTicketStatus(ticketId, newStatus);
  }

  async function handleTakeTicket(ticketId: string) {
    await mutations.takeTicket(ticketId);
  }

  return {
    editingTicket,
    filteredTickets,
    filters,
    formData,
    currentAdminId: user?.id ?? null,
    isEmpty,
    loading,
    showForm,
    stats: stats || INITIAL_TICKET_STATS,
    tickets,
    setFilters,
    setFormData,
    setShowForm,
    handleDelete,
    handleStatusChange,
    handleTakeTicket,
    handleSubmit,
    loadTickets,
    openCreateForm: () => {
      setEditingTicket(null);
      setFormData(INITIAL_TICKET_FORM);
      setShowForm(true);
    },
    openEditForm: (ticket: AdminTicket) => {
      setEditingTicket(ticket);
      setFormData(buildFormDataFromTicket(ticket));
      setShowForm(true);
    },
    resetFormState,
  };
}
