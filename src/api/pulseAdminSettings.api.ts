import type { PulseExperienceSettings } from '@/data/types/pulse';
import { supabase } from '@/lib/supabase';

interface PulseAdminSettingsRow {
  scope: 'global';
  default_period: PulseExperienceSettings['defaultPeriod'];
  default_chart_mode: PulseExperienceSettings['defaultChartMode'];
  show_realtime_module: boolean;
  show_top_pages_module: boolean;
  show_summary_module: boolean;
  updated_at: string | null;
}

export const DEFAULT_PULSE_EXPERIENCE_SETTINGS: PulseExperienceSettings = {
  defaultPeriod: 'this_month',
  defaultChartMode: 'visits',
  showRealtimeModule: true,
  showTopPagesModule: true,
  showSummaryModule: true,
  updatedAt: null,
};

function mapPulseSettingsRow(row: PulseAdminSettingsRow | null): PulseExperienceSettings {
  if (!row) {
    return DEFAULT_PULSE_EXPERIENCE_SETTINGS;
  }

  return {
    defaultPeriod: row.default_period,
    defaultChartMode: row.default_chart_mode,
    showRealtimeModule: row.show_realtime_module,
    showTopPagesModule: row.show_top_pages_module,
    showSummaryModule: row.show_summary_module,
    updatedAt: row.updated_at,
  };
}

export async function fetchPulseExperienceSettings(): Promise<PulseExperienceSettings> {
  const { data, error } = await supabase
    .from('pulse_admin_settings')
    .select('scope, default_period, default_chart_mode, show_realtime_module, show_top_pages_module, show_summary_module, updated_at')
    .eq('scope', 'global')
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos consultar la configuración de Pulse: ${error.message}`);
  }

  return mapPulseSettingsRow((data as PulseAdminSettingsRow | null) ?? null);
}

export async function savePulseExperienceSettings(
  settings: PulseExperienceSettings,
  updatedBy: string,
): Promise<PulseExperienceSettings> {
  const { data, error } = await supabase
    .from('pulse_admin_settings')
    .upsert({
      scope: 'global',
      default_period: settings.defaultPeriod,
      default_chart_mode: settings.defaultChartMode,
      show_realtime_module: settings.showRealtimeModule,
      show_top_pages_module: settings.showTopPagesModule,
      show_summary_module: settings.showSummaryModule,
      updated_by: updatedBy,
    }, {
      onConflict: 'scope',
      ignoreDuplicates: false,
    })
    .select('scope, default_period, default_chart_mode, show_realtime_module, show_top_pages_module, show_summary_module, updated_at')
    .single();

  if (error) {
    throw new Error(`No pudimos guardar la configuración de Pulse: ${error.message}`);
  }

  return mapPulseSettingsRow(data as PulseAdminSettingsRow);
}
