import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useSessionStorageState } from '@/core/hooks/useSessionStorageState';
import { useNotificationsRealtime } from './useNotificationsRealtime';

export function useNotificationsPanelState(storageKey: string, userId: string | null) {
  const [panelOpen, setPanelOpen] = useSessionStorageState(storageKey, false);
  const location = useLocation();

  useNotificationsRealtime(userId);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    setPanelOpen(false);
  }, [location.key, panelOpen, setPanelOpen]);

  return {
    panelOpen,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false)
  };
}
