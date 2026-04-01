import { BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PulseExperienceSettings } from '@/data/types/pulse';
import {
  pulseChartModeOptions,
  pulsePeriodOptions,
} from '@/features/admin/settings/utils/adminPulseSettings.utils';

interface AdminSettingsViewCardProps {
  onSettingChange: <Key extends keyof PulseExperienceSettings>(
    key: Key,
    value: PulseExperienceSettings[Key],
  ) => void;
  settings: PulseExperienceSettings;
}

export function AdminSettingsViewCard({ onSettingChange, settings }: AdminSettingsViewCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Vista inicial de Pulse</p>
          <h3 className="text-xl font-semibold text-slate-50">Cómo abre la portada para el cliente</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Definí qué período y qué lectura del gráfico se muestran primero al entrar a Pulse.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)]">
          <BarChart3 className="h-4 w-4 text-[var(--signal)]" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Período que abre por defecto</label>
          <Select
            onValueChange={(value) => onSettingChange('defaultPeriod', value as PulseExperienceSettings['defaultPeriod'])}
            value={settings.defaultPeriod}
          >
            <SelectTrigger className="mt-2 border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pulsePeriodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Lectura inicial del gráfico</label>
          <Select
            onValueChange={(value) => onSettingChange('defaultChartMode', value as PulseExperienceSettings['defaultChartMode'])}
            value={settings.defaultChartMode}
          >
            <SelectTrigger className="mt-2 border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pulseChartModeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
