import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useApp } from '@/contexts/AppContext';
import { AdminInboxCounters } from '@/features/admin/notifications/components/AdminInboxCounters';
import { AdminInboxFilters, type InboxSegmentId } from '@/features/admin/notifications/components/AdminInboxFilters';
import { AdminInboxEventDetail } from '@/features/admin/notifications/components/AdminInboxEventDetail';
import { AdminInboxEventRow } from '@/features/admin/notifications/components/AdminInboxEventRow';
import { useAdminNotificationsInbox } from '@/features/admin/notifications/hooks/useAdminNotificationsInbox';
import { useInboxRealtime } from '@/features/admin/notifications/hooks/useInboxRealtime';
import type { EventFilters, OperationalEvent } from '@/features/admin/notifications/services/adminNotifications.service';

type CounterFilterId = 'all' | 'critical' | 'unassigned' | 'in_progress' | 'resolved_today';

const EMPTY_COUNTS = { open_total: 0, critical_open: 0, unassigned: 0, in_progress: 0, resolved_today: 0 };

function buildFilters(counter: CounterFilterId, segment: InboxSegmentId, search: string): EventFilters {
  const filters: EventFilters = {
    status: counter === 'resolved_today' ? ['resolved'] : ['open', 'in_progress'],
    search,
  };

  if (counter === 'critical' || segment === 'critical') filters.severity = ['critical'];
  if (counter === 'unassigned' || segment === 'unassigned') filters.owner_id = 'unassigned';
  if (counter === 'in_progress') filters.status = ['in_progress'];
  if (segment === 'payments') filters.source_type = ['payment'];
  if (segment === 'support') filters.source_type = ['ticket'];
  if (segment === 'domain') filters.source_type = ['domain'];
  if (segment === 'approvals') filters.source_type = ['project'];

  return filters;
}

function getPrimaryActionLabel(event: OperationalEvent) {
  switch (event.source_type) {
    case 'payment':
      return 'Abrir pago';
    case 'ticket':
      return 'Abrir ticket';
    case 'project':
      return 'Abrir proyecto';
    case 'onboarding':
      return 'Ver cliente';
    case 'domain':
      return 'Configurar GA4';
    default:
      return 'Abrir operación';
  }
}

function openPrimaryAction(navigate: ReturnType<typeof useNavigate>, event: OperationalEvent) {
  switch (event.source_type) {
    case 'payment':
      navigate('/admin#pagos');
      return;
    case 'ticket':
      navigate('/admin#tickets');
      return;
    case 'project':
    case 'domain':
      navigate('/admin#proyectos');
      return;
    case 'onboarding':
      navigate(`/perfil/${event.client_id}`);
      return;
    default:
      navigate('/admin');
  }
}

export function AdminNotificationsInboxScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  useInboxRealtime();
  const [activeCounter, setActiveCounter] = useState<CounterFilterId>('all');
  const [activeSegment, setActiveSegment] = useState<InboxSegmentId>('all');
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const {
    events,
    counts,
    admins,
    isLoading,
    adminsLoading,
    setFilters,
    syncSources,
    assign,
    markInProgress,
    snooze,
    resolve,
    isSyncingSources,
    isAssigning,
    isMarkingInProgress,
    isSnoozing,
    isResolving,
  } = useAdminNotificationsInbox();

  useEffect(() => {
    setFilters(buildFilters(activeCounter, activeSegment, deferredSearch));
  }, [activeCounter, activeSegment, deferredSearch, setFilters]);

  useEffect(() => {
    if (!events.length) {
      setSelectedEventId(null);
      return;
    }
    if (!events.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const selectedEvent = useMemo(() => events.find((event) => event.id === selectedEventId) ?? null, [events, selectedEventId]);

  return (
    <div className="space-y-4">
      <AdminInboxCounters counts={counts ?? EMPTY_COUNTS} activeCounter={activeCounter} onSelect={setActiveCounter} />
      <AdminInboxFilters
        activeSegment={activeSegment}
        search={search}
        isSyncing={isSyncingSources}
        onSearchChange={setSearch}
        onSelectSegment={setActiveSegment}
        onSync={() => syncSources()}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,55%)_minmax(0,45%)]">
        <div className="space-y-3">
          {isLoading || isSyncingSources
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="rounded-2xl border border-border/70 bg-card/60 p-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-3 h-3 w-1/3" />
                  <Skeleton className="mt-4 h-3 w-full" />
                </div>
              ))
            : null}

          {!isLoading && events.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/70 px-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
              <p className="mt-3 text-sm font-medium text-foreground">No hay eventos activos con estos filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajustá el filtro o esperá el próximo refresh operativo.</p>
            </div>
          ) : null}

          {!isLoading
            ? events.map((event) => (
                <AdminInboxEventRow
                  key={event.id}
                  event={event}
                  selected={selectedEventId === event.id}
                  onSelect={() => setSelectedEventId(event.id)}
                />
              ))
            : null}
        </div>

        <AdminInboxEventDetail
          event={selectedEvent}
          admins={admins}
          currentUserId={user?.id ?? null}
          adminsLoading={adminsLoading}
          isAssigning={isAssigning || isMarkingInProgress}
          isSnoozing={isSnoozing}
          isResolving={isResolving}
          onAssign={(ownerId) => selectedEvent && assign({ id: selectedEvent.id, ownerId })}
          onMarkInProgress={() => selectedEvent && markInProgress(selectedEvent.id)}
          onSnooze={(days) => {
            if (!selectedEvent) return;
            const until = new Date();
            until.setDate(until.getDate() + days);
            snooze({ id: selectedEvent.id, until });
          }}
          onResolve={() => {
            if (!selectedEvent) return;
            if (selectedEvent.severity === 'critical' && !window.confirm('Este evento es crítico. ¿Querés marcarlo como resuelto?')) {
              return;
            }
            resolve(selectedEvent.id);
          }}
          onOpenPrimaryAction={() => selectedEvent && openPrimaryAction(navigate, selectedEvent)}
          primaryActionLabel={selectedEvent ? getPrimaryActionLabel(selectedEvent) : 'Abrir operación'}
        />
      </div>
    </div>
  );
}
