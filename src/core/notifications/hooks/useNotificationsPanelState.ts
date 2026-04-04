import { useSessionStorageState } from '@/core/hooks/useSessionStorageState';
import { useNotificationsRealtime } from './useNotificationsRealtime';

export function useNotificationsPanelState(storageKey: string, userId: string | null) {
  const [panelOpen, setPanelOpen] = useSessionStorageState(storageKey, false);

  useNotificationsRealtime(userId);

  return {
    panelOpen,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false)
  };
}
