import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignInboxEvent,
  getInboxAdmins,
  getInboxCounts,
  getInboxEvents,
  markInboxEventInProgress,
  resolveInboxEvent,
  snoozeInboxEvent,
  type EventFilters,
  type EventCounts,
  type InboxAdminAssignee,
  type OperationalEvent,
} from '@/features/admin/notifications/services/adminNotifications.service';
import {
  eventMatchesFilters,
  type AdminInboxSnapshot,
  updateCountsFromTransition,
} from '@/features/admin/notifications/hooks/useAdminNotificationsInbox.optimistic';
import { syncOperationalEvents, type OperationalEventSyncSummary } from '@/features/admin/notifications/services/adminOperationalEventSyncAction.service';
import { toast } from '@/core/notifications/hooks/useToast';

const DEFAULT_FILTERS: EventFilters = { status: ['open', 'in_progress'] };

const ADMIN_INBOX_QUERY_KEY = ['admin-inbox'] as const;
const ADMIN_INBOX_COUNTS_QUERY_KEY = ['admin-inbox-counts'] as const;
const ADMIN_INBOX_ADMINS_QUERY_KEY = ['admin-inbox-admins'] as const;

function buildSyncDescription(summary: OperationalEventSyncSummary) {
  return `Creados ${summary.created} · actualizados ${summary.updated} · cerrados ${summary.deleted} · vigentes ${summary.desired}`;
}

export function useAdminNotificationsInbox() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const eventsQueryKey = [...ADMIN_INBOX_QUERY_KEY, filters] as const;

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY }),
    ]);
  };

  const readSnapshot = (): AdminInboxSnapshot => ({
    counts: queryClient.getQueryData<EventCounts>(ADMIN_INBOX_COUNTS_QUERY_KEY),
    events: queryClient.getQueryData<OperationalEvent[]>(eventsQueryKey) ?? [],
  });

  const writeSnapshot = (snapshot: AdminInboxSnapshot) => {
    queryClient.setQueryData(eventsQueryKey, snapshot.events);
    queryClient.setQueryData(ADMIN_INBOX_COUNTS_QUERY_KEY, snapshot.counts);
  };

  const applyEventUpdate = (eventId: string, updater: (event: OperationalEvent) => OperationalEvent): AdminInboxSnapshot | null => {
    const previous = readSnapshot();
    const target = previous.events.find((event) => event.id === eventId);

    if (!target) {
      return null;
    }

    const nextEvent = updater(target);
    const nextEvents = previous.events
      .map((event) => (event.id === eventId ? nextEvent : event))
      .filter((event) => event.id !== eventId || eventMatchesFilters(nextEvent, filters));

    writeSnapshot({
      events: nextEvents,
      counts: updateCountsFromTransition(previous.counts, target, nextEvent),
    });

    return previous;
  };

  const { data: events, isLoading } = useQuery({
    queryKey: eventsQueryKey,
    queryFn: () => getInboxEvents(filters),
    refetchInterval: 30_000,
    staleTime: 1000 * 20,
  });

  const { data: counts } = useQuery({
    queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY,
    queryFn: getInboxCounts,
    refetchInterval: 15_000,
    staleTime: 1000 * 10,
  });

  const { data: admins, isLoading: adminsLoading } = useQuery({
    queryKey: ADMIN_INBOX_ADMINS_QUERY_KEY,
    queryFn: getInboxAdmins,
    staleTime: 1000 * 60 * 5,
  });

  const assign = useMutation({
    mutationFn: ({ id, ownerId }: { id: string; ownerId: string | null }) => assignInboxEvent(id, ownerId),
    onMutate: async ({ id, ownerId }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });

      const adminList = queryClient.getQueryData<InboxAdminAssignee[]>(ADMIN_INBOX_ADMINS_QUERY_KEY) ?? [];
      const snapshot = applyEventUpdate(id, (event) => ({
        ...event,
        owner_id: ownerId,
        owner_name: adminList.find((admin) => admin.id === ownerId)?.name ?? null,
        updated_at: new Date().toISOString(),
      }));

      return snapshot ? { previous: snapshot } : undefined;
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeSnapshot(context.previous);
      }
    },
    onSettled: invalidate,
  });

  const snooze = useMutation({
    mutationFn: ({ id, until }: { id: string; until: Date }) => snoozeInboxEvent(id, until),
    onMutate: async ({ id, until }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });

      const snapshot = applyEventUpdate(id, (event) => ({
        ...event,
        status: 'snoozed',
        snoozed_until: until.toISOString(),
        resolved_at: null,
        updated_at: new Date().toISOString(),
      }));

      return snapshot ? { previous: snapshot } : undefined;
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeSnapshot(context.previous);
      }
    },
    onSettled: invalidate,
  });

  const resolve = useMutation({
    mutationFn: (id: string) => resolveInboxEvent(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });

      const resolvedAt = new Date().toISOString();
      const snapshot = applyEventUpdate(id, (event) => ({
        ...event,
        status: 'resolved',
        resolved_at: resolvedAt,
        updated_at: resolvedAt,
      }));

      return snapshot ? { previous: snapshot } : undefined;
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeSnapshot(context.previous);
      }
    },
    onSettled: invalidate,
  });

  const markInProgress = useMutation({
    mutationFn: (id: string) => markInboxEventInProgress(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });

      const snapshot = applyEventUpdate(id, (event) => ({
        ...event,
        status: 'in_progress',
        resolved_at: null,
        updated_at: new Date().toISOString(),
      }));

      return snapshot ? { previous: snapshot } : undefined;
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        writeSnapshot(context.previous);
      }
    },
    onSettled: invalidate,
  });

  const syncSources = useMutation({
    mutationFn: syncOperationalEvents,
    onSuccess: async (summary) => {
      await invalidate();
      toast({
        title: 'Inbox operativa actualizada',
        description: buildSyncDescription(summary),
      });
    },
    onError: (error) => {
      toast({
        title: 'No pudimos actualizar la inbox operativa',
        description: error instanceof Error ? error.message : 'Reintentá en unos segundos.',
        variant: 'destructive',
      });
    },
  });

  return {
    events: events ?? [],
    counts,
    admins: admins ?? [],
    isLoading,
    adminsLoading,
    filters,
    setFilters,
    syncSources: syncSources.mutate,
    assign: assign.mutate,
    markInProgress: markInProgress.mutate,
    snooze: snooze.mutate,
    resolve: resolve.mutate,
    isSyncingSources: syncSources.isPending,
    isAssigning: assign.isPending,
    isMarkingInProgress: markInProgress.isPending,
    isSnoozing: snooze.isPending,
    isResolving: resolve.isPending,
  };
}
