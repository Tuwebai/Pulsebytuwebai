import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { EventCounts, EventFilters, OperationalEvent } from '@/features/admin/notifications/services/adminNotifications.service';
import { eventMatchesFilters, updateCountsFromTransition } from '@/features/admin/notifications/hooks/useAdminNotificationsInbox.optimistic';
import { supabase } from '@/lib/supabase';

type InboxRealtimeStatus = OperationalEvent['status'];
type InboxRealtimeSeverity = OperationalEvent['severity'];
type InboxRealtimeSourceType = OperationalEvent['source_type'];

interface OperationalEventRealtimeRow {
  client_id: string;
  created_at: string;
  description: string | null;
  id: string;
  impact: string | null;
  owner_id: string | null;
  resolved_at: string | null;
  severity: InboxRealtimeSeverity;
  snoozed_until: string | null;
  source_id: string | null;
  source_type: InboxRealtimeSourceType;
  status: InboxRealtimeStatus;
  suggested_action: string | null;
  title: string;
  type: OperationalEvent['type'];
  updated_at: string;
}

const ADMIN_INBOX_QUERY_KEY = ['admin-inbox'] as const;
const ADMIN_INBOX_COUNTS_QUERY_KEY = ['admin-inbox-counts'] as const;

function toEventStub(row: OperationalEventRealtimeRow): OperationalEvent {
  return {
    id: row.id,
    client_id: row.client_id,
    client_name: '',
    client_email: '',
    type: row.type,
    severity: row.severity,
    status: row.status,
    title: row.title,
    description: row.description,
    impact: row.impact,
    suggested_action: row.suggested_action,
    owner_id: row.owner_id,
    owner_name: null,
    source_type: row.source_type,
    source_id: row.source_id,
    snoozed_until: row.snoozed_until,
    resolved_at: row.resolved_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mergeRealtimeRow(current: OperationalEvent, row: OperationalEventRealtimeRow): OperationalEvent {
  return {
    ...current,
    client_id: row.client_id,
    type: row.type,
    severity: row.severity,
    status: row.status,
    title: row.title,
    description: row.description,
    impact: row.impact,
    suggested_action: row.suggested_action,
    owner_id: row.owner_id,
    owner_name: current.owner_name,
    source_type: row.source_type,
    source_id: row.source_id,
    snoozed_until: row.snoozed_until,
    resolved_at: row.resolved_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function updateCountsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  previousRow: OperationalEventRealtimeRow,
  nextRow: OperationalEventRealtimeRow,
) {
  const previousEvent = toEventStub(previousRow);
  const nextEvent = toEventStub(nextRow);

  queryClient.setQueryData<EventCounts | undefined>(ADMIN_INBOX_COUNTS_QUERY_KEY, (current) =>
    updateCountsFromTransition(current, previousEvent, nextEvent),
  );
}

export function useInboxRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-inbox-operational-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'operational_events',
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
          void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'operational_events',
        },
        (payload) => {
          const previousRow = payload.old as OperationalEventRealtimeRow | null;
          const nextRow = payload.new as OperationalEventRealtimeRow | null;

          if (!previousRow || !nextRow) {
            void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });
            return;
          }

          updateCountsCache(queryClient, previousRow, nextRow);
          let shouldInvalidateInbox = previousRow.owner_id !== nextRow.owner_id;

          const cachedLists = queryClient.getQueriesData<OperationalEvent[]>({ queryKey: ADMIN_INBOX_QUERY_KEY });

          cachedLists.forEach(([queryKey, currentEvents]) => {
            if (!currentEvents) {
              return;
            }

            const filters = (Array.isArray(queryKey) ? queryKey[1] : undefined) as EventFilters | undefined;
            const activeFilters = filters ?? {};
            const target = currentEvents.find((event) => event.id === nextRow.id);

            if (!target) {
              shouldInvalidateInbox = true;
              return;
            }

            const nextEvent = mergeRealtimeRow(target, nextRow);
            const nextEvents = currentEvents
              .map((event) => (event.id === nextRow.id ? nextEvent : event))
              .filter((event) => event.id !== nextRow.id || eventMatchesFilters(nextEvent, activeFilters));

            queryClient.setQueryData(queryKey, nextEvents);
          });

          if (shouldInvalidateInbox) {
            void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'operational_events',
        },
        (payload) => {
          const deletedRow = payload.old as OperationalEventRealtimeRow | null;

          if (!deletedRow) {
            void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });
            return;
          }

          queryClient.setQueriesData<OperationalEvent[]>({ queryKey: ADMIN_INBOX_QUERY_KEY }, (current = []) =>
            current.filter((event) => event.id !== deletedRow.id),
          );
          void queryClient.invalidateQueries({ queryKey: ADMIN_INBOX_COUNTS_QUERY_KEY });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
