import { ShieldCheck } from 'lucide-react';

import type { AdminSettingsPreferences } from '@/features/admin/settings/hooks/useAdminSettingsPreferences';

import { AdminSettingsToggleRow } from './AdminSettingsToggleRow';

interface AdminSettingsGuardrailsCardProps {
  preferences: AdminSettingsPreferences;
  onPreferenceChange: <Key extends keyof AdminSettingsPreferences>(
    key: Key,
    value: AdminSettingsPreferences[Key],
  ) => void;
}

export function AdminSettingsGuardrailsCard({
  preferences,
  onPreferenceChange,
}: AdminSettingsGuardrailsCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Guardrails Pulse</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-50">Criterios de seguridad visual</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <AdminSettingsToggleRow
          checked={preferences.confirmationsEnabled}
          description="Sostiene confirmación antes de acciones destructivas o sensibles."
          label="Confirmar cambios críticos"
          onCheckedChange={(value) => onPreferenceChange('confirmationsEnabled', value)}
        />
        <AdminSettingsToggleRow
          checked={preferences.financialSummaryVisible}
          description="Permite ver resumen de cobranza dentro del panel operativo."
          label="Mostrar resumen de pagos"
          onCheckedChange={(value) => onPreferenceChange('financialSummaryVisible', value)}
        />
        <AdminSettingsToggleRow
          checked={preferences.compactDensity}
          description="Mantiene cards, tablas y badges en densidad compacta Pulse."
          label="Usar densidad compacta"
          onCheckedChange={(value) => onPreferenceChange('compactDensity', value)}
        />
      </div>
    </section>
  );
}
