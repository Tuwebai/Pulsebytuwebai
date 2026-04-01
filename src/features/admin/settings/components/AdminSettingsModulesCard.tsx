import { LayoutPanelTop } from 'lucide-react';
import type { PulseExperienceSettings } from '@/data/types/pulse';
import { AdminSettingsToggleRow } from '@/features/admin/settings/components/AdminSettingsToggleRow';

interface AdminSettingsModulesCardProps {
  onSettingChange: <Key extends keyof PulseExperienceSettings>(
    key: Key,
    value: PulseExperienceSettings[Key],
  ) => void;
  settings: PulseExperienceSettings;
}

export function AdminSettingsModulesCard({
  onSettingChange,
  settings,
}: AdminSettingsModulesCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Módulos visibles</p>
          <h3 className="text-xl font-semibold text-slate-50">Qué bloques ve el cliente dentro de Pulse</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Activá o pausá los módulos secundarios sin tocar el núcleo de métricas principales.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
          <LayoutPanelTop className="h-4 w-4 text-emerald-300" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <AdminSettingsToggleRow
          checked={settings.showRealtimeModule}
          description="Muestra la tarjeta de actividad en vivo con usuarios activos, eventos y páginas con movimiento."
          label="Actividad en vivo"
          onCheckedChange={(value) => onSettingChange('showRealtimeModule', value)}
        />
        <AdminSettingsToggleRow
          checked={settings.showTopPagesModule}
          description="Mantiene visible el bloque de páginas más visitadas para leer qué secciones reciben más atención."
          label="Páginas más visitadas"
          onCheckedChange={(value) => onSettingChange('showTopPagesModule', value)}
        />
        <AdminSettingsToggleRow
          checked={settings.showSummaryModule}
          description="Deja visible el resumen ejecutivo con visitas, consultas y promedio de sesión del período."
          label="Resumen del período"
          onCheckedChange={(value) => onSettingChange('showSummaryModule', value)}
        />
      </div>
    </section>
  );
}
