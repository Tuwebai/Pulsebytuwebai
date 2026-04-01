import type { PulseChartMode, PulseExperienceSettings, Period } from '@/data/types/pulse';

export const pulsePeriodOptions: Array<{ label: string; value: Period }> = [
  { label: 'Este mes', value: 'this_month' },
  { label: 'Últimos 7 días', value: 'last_7_days' },
  { label: 'Últimos 30 días', value: 'last_30_days' },
  { label: 'Mes anterior', value: 'last_month' },
  { label: 'Este año', value: 'this_year' },
];

export const pulseChartModeOptions: Array<{ label: string; value: PulseChartMode }> = [
  { label: 'Visitas', value: 'visits' },
  { label: 'Consultas', value: 'contacts' },
];

export function getPulsePeriodLabel(period: Period): string {
  return pulsePeriodOptions.find((option) => option.value === period)?.label ?? 'Este mes';
}

export function getPulseChartModeLabel(mode: PulseChartMode): string {
  return pulseChartModeOptions.find((option) => option.value === mode)?.label ?? 'Visitas';
}

export function getVisiblePulseModulesCount(settings: PulseExperienceSettings): number {
  return [
    settings.showRealtimeModule,
    settings.showTopPagesModule,
    settings.showSummaryModule,
  ].filter(Boolean).length;
}
