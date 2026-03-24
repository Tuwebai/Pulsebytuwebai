import { useMemo } from 'react';
import { useNotificationPreferences } from '@/features/notifications/hooks/useNotificationPreferences';

export function useSettingsNotifications() {
  const { prefs, isLoading, isSaving, updatePreference } = useNotificationPreferences();

  const statusLabel = useMemo(() => {
    if (isLoading) {
      return 'Cargando tus preferencias de notificaciones.';
    }

    if (isSaving) {
      return 'Guardando cambios al instante.';
    }

    return 'Los cambios se aplican al instante en tu cuenta.';
  }, [isLoading, isSaving]);

  return {
    prefs,
    isLoading,
    isSaving,
    statusLabel,
    updatePreference,
  };
}
