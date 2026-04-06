import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/core/notifications/hooks/useToast';
import { useApp } from '@/contexts/useApp';
import type { AppContextType } from '@/contexts/appContext.types';
import type { SecuritySettings } from '@/features/settings/components/settings.types';
import { getInitialSecuritySettings } from '@/features/settings/services/settings.service';

export function useClientSettings() {
  const { updateUserSettings, user } = useApp() as AppContextType;
  const [loading, setLoading] = useState(false);
  const [securityBaseline, setSecurityBaseline] = useState<SecuritySettings>({
    session_timeout: 30,
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    session_timeout: 30,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const nextSecurity = getInitialSecuritySettings(user);

    setSecurityBaseline(nextSecurity);
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

  const securityDirty =
    securitySettings.session_timeout !== securityBaseline.session_timeout;

  return {
    loading,
    securityDirty,
    securitySettings,
    setSecuritySettings,
    handleSaveSecuritySettings,
  };
}
