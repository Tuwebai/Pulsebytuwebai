import { MessageSquareText, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Skeleton from '@/core/components/Skeleton';
import type { Ticket } from '../types';
import SupportTicketCard from './SupportTicketCard';

interface SupportTicketsPanelProps {
  error: string | null;
  loading: boolean;
  onReply: (ticketId: string) => void;
  onRetry: () => void;
  tickets: Ticket[];
  userEmail: string;
}

export default function SupportTicketsPanel({
  error,
  loading,
  onReply,
  onRetry,
  tickets,
  userEmail,
}: SupportTicketsPanelProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/92 p-4 shadow-2xl sm:p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          Bandeja activa
        </p>
        <h2 className="mt-2 text-xl font-medium text-[var(--text-primary)]">Historial de tickets</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Seguimiento de tus consultas y respuestas del equipo.
        </p>
      </div>

      <div className="mt-5">
        {loading ? <SupportTicketsSkeleton /> : null}
        {!loading && error ? <SupportTicketsError error={error} onRetry={onRetry} /> : null}
        {!loading && !error && tickets.length === 0 ? <SupportTicketsEmptyState /> : null}
        {!loading && !error && tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <SupportTicketCard key={ticket.id} onReply={onReply} ticket={ticket} userEmail={userEmail} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SupportTicketsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          className="rounded-[22px] border border-[var(--border-default)] bg-[var(--bg-surface)]/92 p-4 shadow-2xl"
          key={index}
        >
          <Skeleton height="16px" rounded="sm" width="180px" />
          <div className="mt-3 space-y-2">
            <Skeleton height="14px" rounded="sm" width="100%" />
            <Skeleton height="14px" rounded="sm" width="85%" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SupportTicketsError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="rounded-[22px] border border-rose-500/20 bg-rose-500/10 px-4 py-5">
      <p className="text-[14px] font-medium text-[var(--text-primary)]">No pudimos cargar tus tickets</p>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{error}</p>
      <Button
        className="mt-4 h-10 rounded-full bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
        type="button"
        onClick={onRetry}
      >
        <RefreshCcw className="mr-2 h-4 w-4" strokeWidth={1.5} />
        Reintentar
      </Button>
    </div>
  );
}

function SupportTicketsEmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
        <MessageSquareText className="h-7 w-7 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-[16px] font-medium text-[var(--text-primary)]">Todavía no tienes tickets</p>
      <p className="mt-1 max-w-[320px] text-[13px] leading-5 text-[var(--text-secondary)]">
        Cuando envíes tu primera consulta, la vas a ver acá con su estado y las respuestas del equipo.
      </p>
    </div>
  );
}
