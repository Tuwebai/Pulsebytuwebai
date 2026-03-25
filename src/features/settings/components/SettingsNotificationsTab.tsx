import { Bell, CheckCircle2, LoaderCircle } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { NotificationSettingsSection } from '@/features/notifications/components/NotificationSettingsSection';
import { SettingsSectionCard } from './SettingsSectionCard';
import { useSettingsNotifications } from '../hooks/useSettingsNotifications';

export function SettingsNotificationsTab() {
  const { prefs, isLoading, isSaving, statusLabel, updatePreference } = useSettingsNotifications();

  return (
    <TabsContent value="notificaciones" className="space-y-6" data-tour="settings-panel-notificaciones">
      <SettingsSectionCard
        icon={<Bell className="h-5 w-5" />}
        title="Notificaciones"
        description="Elegi que novedades queres recibir de Pulse y del seguimiento de tu proyecto."
        tone="signal"
      >
        <div data-tour="settings-notifications-controls">
          <NotificationSettingsSection
            prefs={prefs}
            isLoading={isLoading}
            isSaving={isSaving}
            updatePreference={updatePreference}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[var(--text-secondary)]">{statusLabel}</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
            {isSaving ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[var(--signal)]" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
            )}
            <span>{isSaving ? 'Guardando' : 'Guardado automatico'}</span>
          </div>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
