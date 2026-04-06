import { RotateCcw } from 'lucide-react';
import { Button } from '@/core/ui/button';
import { AdminPageActionsBar } from '@/features/admin/components/AdminPageActionsBar';
import { AdminSettingsImpactCard } from '@/features/admin/settings/components/AdminSettingsImpactCard';
import { AdminSettingsMetrics } from '@/features/admin/settings/components/AdminSettingsMetrics';
import { AdminSettingsModulesCard } from '@/features/admin/settings/components/AdminSettingsModulesCard';
import { AdminPushNotificationsCard } from '@/features/admin/settings/components/AdminPushNotificationsCard';
import { AdminSettingsViewCard } from '@/features/admin/settings/components/AdminSettingsViewCard';
import { useAdminPulseSettings } from '@/features/admin/settings/hooks/useAdminPulseSettings';
import { toast } from '@/core/notifications/hooks/useToast';

interface AdminSettingsScreenProps {
  onSaveReference: () => void;
}

export function AdminSettingsScreen({ onSaveReference }: AdminSettingsScreenProps) {
  const {
    hasUnsavedChanges,
    isSaving,
    resetToSaved,
    restoreDefaults,
    saveSettings,
    settings,
    updateSetting,
  } = useAdminPulseSettings();

  const handleSave = async () => {
    try {
      await saveSettings();
      onSaveReference();
    } catch (error) {
      toast({
        title: 'No pudimos guardar la configuración',
        description: error instanceof Error ? error.message : 'Probá de nuevo en unos minutos.',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreDefaults = () => {
    restoreDefaults();
    toast({
      title: 'Base Pulse restaurada',
      description: 'Volvimos a la configuración recomendada para la portada de Pulse.',
    });
  };

  return (
    <div className="space-y-4 text-slate-100">
      <AdminPageActionsBar
        actions={(
          <>
            <Button
              className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
              onClick={resetToSaved}
              type="button"
              variant="outline"
            >
              Descartar cambios
            </Button>
            <Button
              className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
              onClick={handleRestoreDefaults}
              type="button"
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar base Pulse
            </Button>
            <Button
              className="bg-sky-500 text-slate-950 hover:bg-sky-400"
              disabled={!hasUnsavedChanges || isSaving}
              onClick={() => {
                void handleSave();
              }}
              type="button"
            >
              {isSaving ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </>
        )}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Configuración global de Pulse</p>
          <p className="text-sm text-slate-300">
            Definí cómo abre Pulse para todos los clientes y qué módulos secundarios siguen visibles en la portada.
          </p>
        </div>
      </AdminPageActionsBar>

      <AdminSettingsMetrics settings={settings} />

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminSettingsViewCard onSettingChange={updateSetting} settings={settings} />
        <AdminSettingsModulesCard onSettingChange={updateSetting} settings={settings} />
        <AdminPushNotificationsCard />
        <AdminSettingsImpactCard settings={settings} />
      </div>
    </div>
  );
}
