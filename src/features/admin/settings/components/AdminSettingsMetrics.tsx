import { BarChart3, CalendarRange, LayoutTemplate } from 'lucide-react';
import type { PulseExperienceSettings } from '@/data/types/pulse';
import {
  getPulseChartModeLabel,
  getPulsePeriodLabel,
  getVisiblePulseModulesCount,
} from '@/features/admin/settings/utils/adminPulseSettings.utils';

interface AdminSettingsMetricsProps {
  settings: PulseExperienceSettings;
}

export function AdminSettingsMetrics({ settings }: AdminSettingsMetricsProps) {
  const items = [
    {
      icon: CalendarRange,
      label: 'Período base',
      value: getPulsePeriodLabel(settings.defaultPeriod),
      caption: 'Así abre Pulse al entrar',
      tone: 'bg-[var(--signal-glow)] text-[var(--signal)]',
    },
    {
      icon: BarChart3,
      label: 'Gráfico inicial',
      value: getPulseChartModeLabel(settings.defaultChartMode),
      caption: 'Lectura base del gráfico',
      tone: 'bg-emerald-500/15 text-emerald-300',
    },
    {
      icon: LayoutTemplate,
      label: 'Módulos visibles',
      value: `${getVisiblePulseModulesCount(settings)}/3`,
      caption: 'Bloques activos en la portada',
      tone: 'bg-violet-500/15 text-violet-300',
    },
  ];

  return (
    <section className="grid gap-3 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.label} className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pulse</p>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-100">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-50">{item.value}</p>
            <p className="mt-2 text-xs text-slate-400">{item.caption}</p>
          </article>
        );
      })}
    </section>
  );
}
