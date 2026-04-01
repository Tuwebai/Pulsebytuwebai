import { Gauge } from 'lucide-react';

import type { AdminSettingsPreferences } from '@/features/admin/settings/hooks/useAdminSettingsPreferences';

import { AdminSettingsToggleRow } from './AdminSettingsToggleRow';

interface AdminSettingsPanelCardProps {
  preferences: AdminSettingsPreferences;
  onPreferenceChange: <Key extends keyof AdminSettingsPreferences>(
    key: Key,
    value: AdminSettingsPreferences[Key],
  ) => void;
}

export function AdminSettingsPanelCard({
  preferences,
  onPreferenceChange,
}: AdminSettingsPanelCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Operación del panel</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-50">Cómo responde el admin</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)]">
          <Gauge className="h-4 w-4 text-[var(--signal)]" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <AdminSettingsToggleRow
          checked={preferences.autoRefresh}
          description="Mantiene la vista operativa más fresca al volver al panel."
          label="Actualizar datos automáticamente"
          onCheckedChange={(value) => onPreferenceChange('autoRefresh', value)}
        />
        <AdminSettingsToggleRow
          checked={preferences.urgentSignalsFirst}
          description="Prioriza urgencias y pendientes al inicio de listas y bandejas."
          label="Mostrar urgencias primero"
          onCheckedChange={(value) => onPreferenceChange('urgentSignalsFirst', value)}
        />
        <AdminSettingsToggleRow
          checked={preferences.realtimeBadgesEnabled}
          description="Mantiene badges vivos en tickets, pagos y notificaciones."
          label="Badges en tiempo real"
          onCheckedChange={(value) => onPreferenceChange('realtimeBadgesEnabled', value)}
        />
      </div>
    </section>
  );
}
