export type SettingsTabValue =
  | 'general'
  | 'rendimiento'
  | 'notificaciones'
  | 'seguridad';

export interface PerformanceSettings {
  animations_enabled: boolean;
  low_bandwidth_mode: boolean;
}

export interface SecuritySettings {
  session_timeout: number;
}
