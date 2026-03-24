import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import React, { useEffect } from 'react';
import { motion } from '@/components/OptimizedMotion';
import { Tabs } from '@/components/ui/tabs';
import { PulseFeedbackState } from '@/core/components';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import {
  GeneralSettingsTab,
  PerformanceSettingsTab,
  SecuritySettingsTab,
  SettingsNotificationsTab,
  SettingsPageHeader,
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
    performanceDirty,
    performanceSettings,
    securityDirty,
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
      <PulseFeedbackState
        className="min-h-screen bg-[var(--bg-base)] px-5"
        description="Estamos cargando tus preferencias y el estado actual de tu cuenta."
        surfaceClassName="max-w-[560px]"
        title="Cargando configuracion"
        variant="loading"
      />
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
              dirty={performanceDirty}
              loading={loading}
              settings={performanceSettings}
              setSettings={setPerformanceSettings}
              onSave={handleSavePerformanceSettings}
            />

            <SettingsNotificationsTab />

            <SecuritySettingsTab
              dirty={securityDirty}
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
