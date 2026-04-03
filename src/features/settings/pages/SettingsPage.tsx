import { useApp } from '@/contexts/AppContext';
import type { AppContextType } from '@/contexts/AppContext';
import React, { useEffect } from 'react';
import { motion } from '@/components/OptimizedMotion';
import { Tabs } from '@/components/ui/tabs';
import { PulseFeedbackState } from '@/core/components';
import { useSessionStorageState } from '@/core/hooks/useSessionStorageState';
import { PRODUCT_TOUR_STEP_CHANGE_EVENT } from '@/features/product-tour/services/productTour.service';
import type { ProductTourStep } from '@/features/product-tour/types/productTour.types';
import { useClientSettings } from '@/features/settings/hooks/useClientSettings';
import {
  GeneralSettingsTab,
  PerformanceSettingsTab,
  SecuritySettingsTab,
  SettingsNotificationsTab,
  SettingsPageHeader,
  SettingsTabsNav,
} from '@/features/settings/components';

const SettingsPage = React.memo(() => {
  const { user, getUserProjects } = useApp() as AppContextType;
  const [activeTab, setActiveTab] = useSessionStorageState(`pulse:configuracion:${user?.id ?? 'anon'}:active-tab`, 'general');
  const settings = useClientSettings();

  useEffect(() => {
    if (activeTab === 'privacidad' || activeTab === 'admin') setActiveTab('seguridad');
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    const handleTourStepChange = (event: Event) => {
      const step = (event as CustomEvent<ProductTourStep | null>).detail;
      if (!step || step.scope !== 'settings' || !step.tabValue) return;
      setActiveTab(step.tabValue);
    };

    window.addEventListener(PRODUCT_TOUR_STEP_CHANGE_EVENT, handleTourStepChange);
    return () => window.removeEventListener(PRODUCT_TOUR_STEP_CHANGE_EVENT, handleTourStepChange);
  }, [setActiveTab]);

  if (!user) {
    return (
      <PulseFeedbackState
        className="min-h-screen bg-[var(--bg-base)] px-5"
        description="Estamos cargando tus preferencias y el estado actual de tu cuenta."
        surfaceClassName="max-w-[560px]"
        title="Cargando configuración"
        variant="loading"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 md:p-6" data-tour="settings-root">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <SettingsPageHeader projectsCount={getUserProjects().length} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6" data-tour="settings-tabs">
            <SettingsTabsNav />
            <GeneralSettingsTab user={user} projectsCount={getUserProjects().length} />
            <PerformanceSettingsTab
              dirty={settings.performanceDirty}
              loading={settings.loading}
              settings={settings.performanceSettings}
              setSettings={settings.setPerformanceSettings}
              onSave={settings.handleSavePerformanceSettings}
            />
            <SettingsNotificationsTab />
            <SecuritySettingsTab
              dirty={settings.securityDirty}
              loading={settings.loading}
              settings={settings.securitySettings}
              setSettings={settings.setSecuritySettings}
              onSave={settings.handleSaveSecuritySettings}
            />
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
});

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;
