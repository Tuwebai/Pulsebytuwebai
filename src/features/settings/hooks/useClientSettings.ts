import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import type { PerformanceSettings, SecuritySettings } from '@/features/settings/components/settings.types';
import {
  getInitialPerformanceSettings,
  getInitialSecuritySettings,
} from '@/features/settings/services/settings.service';

export function useClientSettings() {
  const { updateUserSettings, user } = useApp() as AppContextType;
  const [loading, setLoading] = useState(false);
  const [performanceBaseline, setPerformanceBaseline] = useState<PerformanceSettings>({
    animations_enabled: true,
    low_bandwidth_mode: false,
  });
  const [securityBaseline, setSecurityBaseline] = useState<SecuritySettings>({
    session_timeout: 30,
  });
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    animations_enabled: true,
    low_bandwidth_mode: false,
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    session_timeout: 30,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const nextPerformance = getInitialPerformanceSettings(user);
    const nextSecurity = getInitialSecuritySettings(user);

    setPerformanceBaseline(nextPerformance);
    setSecurityBaseline(nextSecurity);
    setPerformanceSettings(nextPerformance);
    setSecuritySettings(nextSecurity);
  }, [user]);

  const runSettingsSave = useCallback(
    async ({
      request,
      successDescription,
      errorDescription,
      successTitle = 'Configuración guardada',
    }: {
      request: Promise<void>;
      successDescription: string;
      errorDescription: string;
      successTitle?: string;
    }): Promise<boolean> => {
      setLoading(true);
      try {
        await request;
        toast({
          title: successTitle,
          description: successDescription,
        });
        return true;
      } catch {
        toast({
          title: 'Error',
          description: errorDescription,
          variant: 'destructive',
        });
        return false;
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

    const saved = await runSettingsSave({
      request: updateUserSettings(performanceSettings).then((success) => {
        if (!success) {
          throw new Error('settings_update_failed');
        }
      }),
      successDescription: 'Los cambios de experiencia se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de experiencia.',
    });
    if (saved) {
      setPerformanceBaseline(performanceSettings);
    }
  }, [performanceSettings, runSettingsSave, updateUserSettings, user]);

  const handleSaveSecuritySettings = useCallback(async () => {
    if (!user) {
      return;
    }

    const saved = await runSettingsSave({
      request: updateUserSettings(securitySettings).then((success) => {
        if (!success) {
          throw new Error('settings_update_failed');
        }
      }),
      successDescription: 'Los cambios de seguridad se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de seguridad.',
    });
    if (saved) {
      setSecurityBaseline(securitySettings);
    }
  }, [runSettingsSave, securitySettings, updateUserSettings, user]);

  const performanceDirty =
    performanceSettings.animations_enabled !== performanceBaseline.animations_enabled ||
    performanceSettings.low_bandwidth_mode !== performanceBaseline.low_bandwidth_mode;

  const securityDirty =
    securitySettings.session_timeout !== securityBaseline.session_timeout;

  return {
    loading,
    performanceDirty,
    performanceSettings,
    securityDirty,
    securitySettings,
    setPerformanceSettings,
    setSecuritySettings,
    handleSavePerformanceSettings,
    handleSaveSecuritySettings,
  };
}
