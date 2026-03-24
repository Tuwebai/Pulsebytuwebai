import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import type { PerformanceSettings, SecuritySettings } from '@/features/settings/components/settings.types';
import {
  getInitialPerformanceSettings,
  getInitialSecuritySettings,
  savePerformanceSettings,
  saveSecuritySettings,
} from '@/features/settings/services/settings.service';

export function useClientSettings() {
  const { user } = useApp() as AppContextType;
  const [loading, setLoading] = useState(false);
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    animations_enabled: true,
    low_bandwidth_mode: false,
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_auth: false,
    session_timeout: 30,
    login_notifications: true,
    device_management: true,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setPerformanceSettings(getInitialPerformanceSettings(user));
    setSecuritySettings(getInitialSecuritySettings(user));
  }, [user]);

  const runSettingsSave = useCallback(
    async ({
      request,
      successDescription,
      errorDescription,
      successTitle = 'Configuracion guardada',
    }: {
      request: Promise<void>;
      successDescription: string;
      errorDescription: string;
      successTitle?: string;
    }) => {
      setLoading(true);
      try {
        await request;
        toast({
          title: successTitle,
          description: successDescription,
        });
      } catch {
        toast({
          title: 'Error',
          description: errorDescription,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSavePerformanceSettings = useCallback(async () => {
    if (!user) {
      return;
    }

    await runSettingsSave({
      request: savePerformanceSettings(user.id, performanceSettings),
      successDescription: 'Los cambios de experiencia se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de experiencia.',
    });
  }, [performanceSettings, runSettingsSave, user]);

  const handleSaveSecuritySettings = useCallback(async () => {
    if (!user) {
      return;
    }

    await runSettingsSave({
      request: saveSecuritySettings(user.id, securitySettings),
      successDescription: 'Los cambios de seguridad se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de seguridad.',
    });
  }, [runSettingsSave, securitySettings, user]);

  return {
    loading,
    performanceSettings,
    securitySettings,
    setPerformanceSettings,
    setSecuritySettings,
    handleSavePerformanceSettings,
    handleSaveSecuritySettings,
  };
}
