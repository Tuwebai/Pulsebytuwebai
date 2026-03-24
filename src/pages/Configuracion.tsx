import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import React, { useEffect, useState } from 'react';
import { Bell, Save } from 'lucide-react';
import { motion } from '@/components/OptimizedMotion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { NotificationSettingsSection } from '@/features/notifications/components/NotificationSettingsSection';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import {
  AdminSettingsTab,
  GeneralSettingsTab,
  PerformanceSettingsTab,
  SecuritySettingsTab,
  SettingsPageHeader,
  SettingsSectionCard,
  SettingsTabsNav,
} from '@/features/settings/components';
import type {
  PerformanceSettings,
  SecuritySettings,
  SystemSettings,
} from '@/features/settings/components';

const Configuracion = React.memo(() => {
  const { user, updateUserSettings, getUserProjects } = useApp() as AppContextType;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useSessionStorageState(`pulse:configuracion:${user?.id ?? 'anon'}:active-tab`, 'general');

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

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    system_name: 'Pulse by TuWebAI',
    system_timezone: 'UTC',
    system_language: 'es',
    maintenance_mode: false,
    debug_mode: false,
    log_level: 'info',
    backup_frequency: 'daily',
    auto_updates: true,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setPerformanceSettings({
      animations_enabled: user.animations_enabled !== false,
      low_bandwidth_mode: user.low_bandwidth_mode || false,
    });

    setSecuritySettings({
      two_factor_auth: user.two_factor_auth || false,
      session_timeout: user.session_timeout || 30,
      login_notifications: user.login_notifications !== false,
      device_management: user.device_management !== false,
    });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'privacidad') {
      setActiveTab('seguridad');
    }
  }, [activeTab, setActiveTab]);

  const runSettingsSave = async ({
    request,
    successDescription,
    errorDescription,
    successTitle = 'Configuracion guardada',
  }: {
    request: Promise<unknown>;
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
  };

  const handleSavePerformanceSettings = () =>
    runSettingsSave({
      request: updateUserSettings(performanceSettings),
      successDescription: 'Los cambios de rendimiento se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de rendimiento.',
    });

  const handleSaveSecuritySettings = () =>
    runSettingsSave({
      request: updateUserSettings(securitySettings),
      successDescription: 'Los cambios de seguridad se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de seguridad.',
    });

  const handleSaveSystemSettings = () =>
    runSettingsSave({
      request: new Promise((resolve) => setTimeout(resolve, 1000)),
      successTitle: 'Configuracion del sistema guardada',
      successDescription: 'Los cambios del sistema se guardaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios del sistema.',
    });

  const handleSaveAllSettings = () =>
    runSettingsSave({
      request: updateUserSettings({
        ...performanceSettings,
        ...securitySettings,
      }),
      successDescription: 'Todas las configuraciones se guardaron correctamente.',
      errorDescription: 'No se pudieron guardar todas las configuraciones.',
    });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--signal)]" />
          <p className="mt-4 text-[14px] text-[var(--text-secondary)]">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 md:p-6">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <SettingsPageHeader projectsCount={getUserProjects().length} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <SettingsTabsNav isAdmin={user?.role === 'admin'} />

            <GeneralSettingsTab
              user={user}
              projectsCount={getUserProjects().length}
            />

            <PerformanceSettingsTab
              loading={loading}
              settings={performanceSettings}
              setSettings={setPerformanceSettings}
              onSave={handleSavePerformanceSettings}
            />

            <TabsContent value="notificaciones" className="space-y-6">
              <SettingsSectionCard
                icon={<Bell className="h-5 w-5" />}
                title="Notificaciones"
                description="Elegí que novedades queres recibir de Pulse y del seguimiento de tu proyecto."
                tone="signal"
              >
                <NotificationSettingsSection />
              </SettingsSectionCard>
            </TabsContent>

            <SecuritySettingsTab
              loading={loading}
              settings={securitySettings}
              setSettings={setSecuritySettings}
              onSave={handleSaveSecuritySettings}
            />

            {user?.role === 'admin' ? (
              <AdminSettingsTab
                loading={loading}
                settings={systemSettings}
                setSettings={setSystemSettings}
                onSave={handleSaveSystemSettings}
              />
            ) : null}

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleSaveAllSettings}
                disabled={loading}
                size="lg"
                className="bg-[var(--signal)] px-8 text-white hover:bg-[var(--signal-dim)] shadow-[0_14px_34px_var(--signal-glow)]"
              >
                <Save className="h-5 w-5" />
                Guardar ajustes
              </Button>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
});

Configuracion.displayName = 'Configuracion';

export default Configuracion;
