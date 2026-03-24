import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion } from '@/components/OptimizedMotion';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
import { useClientSettings } from '@/features/settings/hooks/useClientSettings';

const Configuracion = React.memo(() => {
  const { user, getUserProjects } = useApp() as AppContextType;
  const [activeTab, setActiveTab] = useSessionStorageState(
    `pulse:configuracion:${user?.id ?? 'anon'}:active-tab`,
    'general',
  );
  const {
    loading,
    performanceSettings,
    securitySettings,
    setPerformanceSettings,
    setSecuritySettings,
    handleSavePerformanceSettings,
    handleSaveSecuritySettings,
  } = useClientSettings();

  useEffect(() => {
    if (activeTab === 'privacidad' || activeTab === 'admin') {
      setActiveTab('seguridad');
    }
  }, [activeTab, setActiveTab]);

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
