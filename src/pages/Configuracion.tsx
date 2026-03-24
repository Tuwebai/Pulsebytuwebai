import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { motion } from '@/components/OptimizedMotion';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { NotificationSettingsSection } from '@/features/notifications/components/NotificationSettingsSection';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import {
  GeneralSettingsTab,
  PerformanceSettingsTab,
  SecuritySettingsTab,
  SettingsPageHeader,
  SettingsSectionCard,
  SettingsTabsNav,
} from '@/features/settings/components';
import type { PerformanceSettings, SecuritySettings } from '@/features/settings/components';

const Configuracion = React.memo(() => {
  const { user, updateUserSettings, getUserProjects } = useApp() as AppContextType;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useSessionStorageState(
    `pulse:configuracion:${user?.id ?? 'anon'}:active-tab`,
    'general',
  );

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
    if (activeTab === 'privacidad' || activeTab === 'admin') {
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
      successDescription: 'Los cambios de experiencia se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de experiencia.',
    });

  const handleSaveSecuritySettings = () =>
    runSettingsSave({
      request: updateUserSettings(securitySettings),
      successDescription: 'Los cambios de seguridad se aplicaron correctamente.',
      errorDescription: 'No se pudieron guardar los cambios de seguridad.',
    });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--signal)]" />
          <p className="mt-4 text-[14px] text-[var(--text-secondary)]">Cargando configuracion...</p>
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

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <SettingsTabsNav />

            <GeneralSettingsTab user={user} projectsCount={getUserProjects().length} />

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
                description="Elegi que novedades queres recibir de Pulse y del seguimiento de tu proyecto."
                tone="signal"
              >
                <NotificationSettingsSection />
                <p className="border-t border-[var(--border-subtle)] pt-5 text-[12px] text-[var(--text-secondary)]">
                  Estos cambios se guardan al instante para que no tengas que confirmarlos manualmente.
                </p>
              </SettingsSectionCard>
            </TabsContent>

            <SecuritySettingsTab
              loading={loading}
              settings={securitySettings}
              setSettings={setSecuritySettings}
              onSave={handleSaveSecuritySettings}
            />
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
});

Configuracion.displayName = 'Configuracion';

export default Configuracion;
