export type SettingsTabValue =
  | 'general'
  | 'rendimiento'
  | 'notificaciones'
  | 'seguridad'
  | 'admin';

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

export interface SystemSettings {
  system_name: string;
  system_timezone: string;
  system_language: string;
  maintenance_mode: boolean;
  debug_mode: boolean;
  log_level: string;
  backup_frequency: string;
  auto_updates: boolean;
}
