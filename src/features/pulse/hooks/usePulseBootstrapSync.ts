import { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Period } from '@/data/types/pulse';
import { bootstrapPulseGa4Sync } from '../services/pulseGa4Sync.service';
import type { PulseConnectionState } from './usePulseConnectionState';

interface UsePulseBootstrapSyncParams {
  connectionState: PulseConnectionState;
  manualSyncDays: number;
  period: Period;
  projectId: string | null;
  shouldAutoSync: boolean;
  syncDays: number;
}

const AUTO_SYNC_STORAGE_KEY = 'pulse:auto-sync';
const AUTO_SYNC_COOLDOWN_MS = 1000 * 60 * 10;

function buildSyncKey(projectId: string, period: Period, syncDays: number) {
  return `${projectId}:${period}:${syncDays}`;
}

function readSyncRegistry(): Record<string, number> {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = window.sessionStorage.getItem(AUTO_SYNC_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSyncRegistry(registry: Record<string, number>) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(AUTO_SYNC_STORAGE_KEY, JSON.stringify(registry));
}

function markSyncAttempt(syncKey: string) {
  const registry = readSyncRegistry();
  registry[syncKey] = Date.now();
  writeSyncRegistry(registry);
}

function canAutoSync(syncKey: string) {
  const lastAttempt = readSyncRegistry()[syncKey];
  return !lastAttempt || Date.now() - lastAttempt >= AUTO_SYNC_COOLDOWN_MS;
}

export function usePulseBootstrapSync({
  connectionState,
  manualSyncDays,
  period,
  projectId,
  shouldAutoSync,
  syncDays,
}: UsePulseBootstrapSyncParams) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ nextProjectId, nextSyncDays }: { nextProjectId: string; nextSyncDays: number }) =>
      bootstrapPulseGa4Sync(nextProjectId, nextSyncDays),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['pulse-metrics', variables.nextProjectId],
        refetchType: 'active',
      });
    },
  });

  const refreshPulseData = useCallback(
    async (mode: 'auto' | 'manual' = 'manual') => {
      if (!projectId) {
        return null;
      }

      const syncKey = buildSyncKey(projectId, period, syncDays);

      if (mode === 'auto' && !canAutoSync(syncKey)) {
        return null;
      }

      markSyncAttempt(syncKey);

      return mutateAsync({
        nextProjectId: projectId,
        nextSyncDays: mode === 'manual' ? manualSyncDays : syncDays,
      });
    },
    [manualSyncDays, mutateAsync, period, projectId, syncDays],
  );

  useEffect(() => {
    const canSyncConnectedRange =
      connectionState === 'connected_no_data' || connectionState === 'connected_with_data';

    if (!projectId || !shouldAutoSync || !canSyncConnectedRange || isPending) {
      return;
    }

    void refreshPulseData('auto').catch(() => null);
  }, [connectionState, isPending, period, projectId, refreshPulseData, shouldAutoSync]);

  useEffect(() => {
    const canSyncConnectedRange =
      connectionState === 'connected_no_data' || connectionState === 'connected_with_data';

    if (!projectId || !shouldAutoSync || !canSyncConnectedRange) {
      return;
    }

    const handleVisibilityRefresh = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      void refreshPulseData('auto').catch(() => null);
    };

    const handleWindowFocus = () => {
      void refreshPulseData('auto').catch(() => null);
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityRefresh);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityRefresh);
    };
  }, [connectionState, projectId, refreshPulseData, shouldAutoSync]);

  return {
    isBootstrapping: isPending,
    refreshPulseData,
  };
}
