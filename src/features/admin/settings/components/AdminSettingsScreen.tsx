import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminPageActionsBar } from '@/features/admin/components/AdminPageActionsBar';
import { AdminSettingsAccountCard } from '@/features/admin/settings/components/AdminSettingsAccountCard';
import { AdminSettingsGuardrailsCard } from '@/features/admin/settings/components/AdminSettingsGuardrailsCard';
import { AdminSettingsMetrics } from '@/features/admin/settings/components/AdminSettingsMetrics';
import { AdminSettingsPanelCard } from '@/features/admin/settings/components/AdminSettingsPanelCard';
import { AdminSettingsReferenceCard } from '@/features/admin/settings/components/AdminSettingsReferenceCard';
import { useAdminSettingsPreferences } from '@/features/admin/settings/hooks/useAdminSettingsPreferences';
import { toast } from '@/hooks/use-toast';

interface AdminSettingsScreenProps {
  onSaveReference: () => void;
}

export function AdminSettingsScreen({ onSaveReference }: AdminSettingsScreenProps) {
  const {
    hasUnsavedChanges,
    preferences,
    resetToSaved,
    restoreDefaults,
    savePreferences,
    summary,
    updatePreference,
  } = useAdminSettingsPreferences();

  const handleSave = () => {
    savePreferences();
    onSaveReference();
  };

  const handleRestoreDefaults = () => {
    restoreDefaults();
    toast({
      title: 'Valores base listos',
      description: 'Restauramos la configuración sugerida para el panel admin.',
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
              Restaurar base
            </Button>
            <Button
              className="bg-sky-500 text-slate-950 hover:bg-sky-400"
              disabled={!hasUnsavedChanges}
              onClick={handleSave}
              type="button"
            >
              Guardar preferencias
            </Button>
          </>
        )}
      >
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Ajustes del panel</p>
          <p className="text-sm text-slate-300">
            Ordená cómo responde el admin, qué señales prioriza y qué referencia usa el equipo al operar Pulse.
          </p>
        </div>
      </AdminPageActionsBar>

      <AdminSettingsMetrics
        guardrails={summary.guardrails}
        liveSignals={summary.liveSignals}
        productLabel={summary.productLabel}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminSettingsPanelCard onPreferenceChange={updatePreference} preferences={preferences} />
        <AdminSettingsGuardrailsCard onPreferenceChange={updatePreference} preferences={preferences} />
        <AdminSettingsAccountCard />
        <AdminSettingsReferenceCard onPreferenceChange={updatePreference} preferences={preferences} />
      </div>
    </div>
  );
}
