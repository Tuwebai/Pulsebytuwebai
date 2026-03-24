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
  two_factor_auth: boolean;
  session_timeout: number;
  login_notifications: boolean;
  device_management: boolean;
}
