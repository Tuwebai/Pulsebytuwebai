export type SettingsTabValue =
  | 'general'
  | 'privacidad'
  | 'rendimiento'
  | 'notificaciones'
  | 'seguridad'
  | 'admin';

export interface GeneralSettings {
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
}

export interface PrivacySettings {
  profile_visibility: string;
  show_email: boolean;
  show_phone: boolean;
  allow_analytics: boolean;
  allow_cookies: boolean;
  two_factor_auth: boolean;
}

export interface PerformanceSettings {
  auto_save: boolean;
  auto_save_interval: number;
  cache_enabled: boolean;
  image_quality: string;
  animations_enabled: boolean;
  low_bandwidth_mode: boolean;
}

export interface SecuritySettings {
  session_timeout: number;
  max_login_attempts: number;
  require_password_change: boolean;
  password_expiry_days: number;
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
