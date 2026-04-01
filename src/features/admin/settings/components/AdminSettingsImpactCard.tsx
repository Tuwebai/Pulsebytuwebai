import { ShieldCheck } from 'lucide-react';
import type { PulseExperienceSettings } from '@/data/types/pulse';
import {
  getPulseChartModeLabel,
  getPulsePeriodLabel,
  getVisiblePulseModulesCount,
} from '@/features/admin/settings/utils/adminPulseSettings.utils';

interface AdminSettingsImpactCardProps {
  settings: PulseExperienceSettings;
}

export function AdminSettingsImpactCard({ settings }: AdminSettingsImpactCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Impacto real en Pulse</p>
          <h3 className="text-xl font-semibold text-slate-50">Qué cambia cuando guardás</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Estos ajustes se guardan en DB y pasan a gobernar la portada de Pulse para todos los clientes.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)]">
          <ShieldCheck className="h-4 w-4 text-[var(--signal)]" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Período base</p>
          <p className="mt-2 text-sm font-medium text-slate-100">{getPulsePeriodLabel(settings.defaultPeriod)}</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Gráfico base</p>
          <p className="mt-2 text-sm font-medium text-slate-100">{getPulseChartModeLabel(settings.defaultChartMode)}</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Módulos activos</p>
          <p className="mt-2 text-sm font-medium text-slate-100">{getVisiblePulseModulesCount(settings)} visibles</p>
        </div>
      </div>
    </section>
  );
}
