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
} from '@/features/admin/notifications/services/adminNotifications.service';
import { syncOperationalEvents } from '@/features/admin/notifications/services/adminOperationalEventSyncAction.service';

const DEFAULT_FILTERS: EventFilters = {
  status: ['open', 'in_progress'],
};

export function useAdminNotificationsInbox() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-inbox'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-inbox-counts'] }),
    ]);
  };

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-inbox', filters],
    queryFn: () => getInboxEvents(filters),
    refetchInterval: 30_000,
    staleTime: 1000 * 20,
  });

  const { data: counts } = useQuery({
    queryKey: ['admin-inbox-counts'],
    queryFn: getInboxCounts,
    refetchInterval: 15_000,
    staleTime: 1000 * 10,
  });

  const { data: admins, isLoading: adminsLoading } = useQuery({
    queryKey: ['admin-inbox-admins'],
    queryFn: getInboxAdmins,
    staleTime: 1000 * 60 * 5,
  });

  const assign = useMutation({
    mutationFn: ({ id, ownerId }: { id: string; ownerId: string | null }) =>
      assignInboxEvent(id, ownerId),
    onSuccess: invalidate,
  });

  const snooze = useMutation({
    mutationFn: ({ id, until }: { id: string; until: Date }) =>
      snoozeInboxEvent(id, until),
    onSuccess: invalidate,
  });

  const resolve = useMutation({
    mutationFn: (id: string) => resolveInboxEvent(id),
    onSuccess: invalidate,
  });

  const markInProgress = useMutation({
    mutationFn: (id: string) => markInboxEventInProgress(id),
    onSuccess: invalidate,
  });

  const syncSources = useMutation({
    mutationFn: syncOperationalEvents,
    onSuccess: invalidate,
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
