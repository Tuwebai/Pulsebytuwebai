import { useEffect, useMemo, useState } from 'react';
import type { Project, User } from '@/contexts/appContext.types';
import { ticketService } from '@/features/support/services/ticket.service';
import { getUserPayments } from '@/lib/services/paymentService';

interface NormalizedPayment {
  amount: number | null;
  createdAt: string | null;
  currency: string | null;
  description: string | null;
  status: string | null;
}

interface HomeOverviewCardsState {
  latestPayment: NormalizedPayment | null;
  openTickets: number;
  paymentsCount: number;
  remainingTasks: number | null;
  secondaryLoading: boolean;
  ticketsCount: number;
}

const EMPTY_STATE: HomeOverviewCardsState = {
  latestPayment: null,
  openTickets: 0,
  paymentsCount: 0,
  remainingTasks: null,
  secondaryLoading: true,
  ticketsCount: 0,
};

const normalizePayment = (payment: Record<string, unknown>): NormalizedPayment => ({
  amount: typeof payment.amount === 'number' ? payment.amount : null,
  createdAt:
    typeof payment.createdAt === 'string'
      ? payment.createdAt
      : typeof payment.created_at === 'string'
        ? payment.created_at
        : null,
  currency: typeof payment.currency === 'string' ? payment.currency : null,
  description: typeof payment.description === 'string' ? payment.description : null,
  status: typeof payment.status === 'string' ? payment.status : null,
});

const countPendingTasks = (project: Project | null): number | null => {
  if (!project) {
    return null;
  }

  const phaseTasks = Array.isArray(project.fases)
    ? project.fases.flatMap((phase) => {
        if (!phase || typeof phase !== 'object') {
          return [];
        }

        const maybeTasks = 'tareas' in phase ? phase.tareas : [];
        return Array.isArray(maybeTasks) ? maybeTasks : [];
      })
    : [];

  const projectTasks = Array.isArray(project.tareas) ? project.tareas : [];
  const allTasks = [...phaseTasks, ...projectTasks];

  if (allTasks.length === 0) {
    return null;
  }

  return allTasks.filter((task) => {
    if (!task || typeof task !== 'object') {
      return false;
    }

    const status = 'status' in task && typeof task.status === 'string' ? task.status : '';
    const normalizedStatus = status.trim().toLowerCase();

    return normalizedStatus !== 'done' && normalizedStatus !== 'completed' && normalizedStatus !== 'terminado';
  }).length;
};

export function useHomeOverviewCards(user: User | null, primaryProject: Project | null) {
  const [latestPayment, setLatestPayment] = useState<NormalizedPayment | null>(EMPTY_STATE.latestPayment);
  const [openTickets, setOpenTickets] = useState(EMPTY_STATE.openTickets);
  const [paymentsCount, setPaymentsCount] = useState(EMPTY_STATE.paymentsCount);
  const [secondaryLoading, setSecondaryLoading] = useState(EMPTY_STATE.secondaryLoading);
  const [ticketsCount, setTicketsCount] = useState(EMPTY_STATE.ticketsCount);

  useEffect(() => {
    if (!user?.email) {
      setLatestPayment(null);
      setPaymentsCount(0);
      setSecondaryLoading(false);
      return;
    }

    setSecondaryLoading(true);

    const unsubscribe = getUserPayments(user.id, user.email, (payments) => {
      const normalizedPayments = payments
        .map((payment) => normalizePayment(payment as unknown as Record<string, unknown>))
        .sort((a, b) => {
          const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return right - left;
        });

      setLatestPayment(normalizedPayments[0] ?? null);
      setPaymentsCount(normalizedPayments.length);
      setSecondaryLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setOpenTickets(0);
      setTicketsCount(0);
      setSecondaryLoading(false);
      return;
    }

    let active = true;

    const loadTickets = async () => {
      try {
        const tickets = await ticketService.getTicketsByClient(user.id);

        if (!active) {
          return;
        }

        setTicketsCount(tickets.length);
        setOpenTickets(
          tickets.filter((ticket) => {
            const status = typeof ticket.status === 'string' ? ticket.status : typeof ticket.estado === 'string' ? ticket.estado : '';
            const normalizedStatus = status.trim().toLowerCase();
            return normalizedStatus === 'open' || normalizedStatus === 'new';
          }).length
        );
      } catch {
        if (!active) {
          return;
        }

        setOpenTickets(0);
        setTicketsCount(0);
      } finally {
        if (active) {
          setSecondaryLoading(false);
        }
      }
    };

    void loadTickets();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const remainingTasks = useMemo(() => countPendingTasks(primaryProject), [primaryProject]);

  return {
    latestPayment,
    openTickets,
    paymentsCount,
    remainingTasks,
    secondaryLoading,
    ticketsCount,
  };
}
