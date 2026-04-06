import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/core/ui/button';
import { Skeleton } from '@/core/ui/skeleton';
import { useApp } from '@/contexts/AppContext';
import {
  buildInboxFilters,
  EMPTY_COUNTS,
  getInboxPrimaryActionLabel,
  openInboxPrimaryAction,
  type CounterFilterId,
} from '@/features/admin/notifications/adminInbox.utils';
import { AdminPageActionsBar } from '@/features/admin/components/AdminPageActionsBar';
import { AdminInboxCounters } from '@/features/admin/notifications/components/AdminInboxCounters';
import { AdminInboxEventDetail } from '@/features/admin/notifications/components/AdminInboxEventDetail';
import { AdminInboxEventRow } from '@/features/admin/notifications/components/AdminInboxEventRow';
import {
  AdminInboxFilters,
  type InboxSegmentId,
} from '@/features/admin/notifications/components/AdminInboxFilters';
import { useAdminNotificationsInbox } from '@/features/admin/notifications/hooks/useAdminNotificationsInbox';
import { useInboxRealtime } from '@/features/admin/notifications/hooks/useInboxRealtime';

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
    setFilters(buildInboxFilters(activeCounter, activeSegment, deferredSearch));
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
  const safeCounts = counts ?? EMPTY_COUNTS;

  return (
    <div className="space-y-4 sm:space-y-5">
      <AdminPageActionsBar
        actions={(
          <Button
            variant="outline"
            onClick={() => syncSources()}
            disabled={isSyncingSources}
            className="border-white/10 bg-slate-950/55 text-slate-100 hover:border-sky-400/25 hover:bg-slate-900 disabled:opacity-60"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingSources ? 'animate-spin' : ''}`} />
            {isSyncingSources ? 'Actualizando eventos' : 'Actualizar eventos'}
          </Button>
        )}
      />

      <AdminInboxCounters counts={safeCounts} activeCounter={activeCounter} onSelect={setActiveCounter} />
      <AdminInboxFilters activeSegment={activeSegment} search={search} onSearchChange={setSearch} onSelectSegment={setActiveSegment} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,55%)_minmax(0,45%)]">
        <section className="space-y-3 rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bandeja activa</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
            Eventos visibles ({events.length})
          </h2>

          <div className="space-y-3">
            {isLoading || isSyncingSources
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="rounded-[22px] border border-white/10 bg-[var(--bg-base)]/40 p-4">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="mt-3 h-3 w-1/3" />
                    <Skeleton className="mt-4 h-3 w-full" />
                  </div>
                ))
              : null}

            {!isLoading && events.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(8,15,30,0.86))] px-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <p className="mt-3 text-sm font-medium text-slate-100">No hay eventos activos con estos filtros</p>
                <p className="mt-1 text-sm text-slate-400">Ajustá la vista o esperá el próximo refresh operativo.</p>
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
        </section>

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
          onOpenPrimaryAction={() => selectedEvent && openInboxPrimaryAction(navigate, selectedEvent)}
          primaryActionLabel={selectedEvent ? getInboxPrimaryActionLabel(selectedEvent) : 'Abrir operación'}
        />
      </div>
    </div>
  );
}
