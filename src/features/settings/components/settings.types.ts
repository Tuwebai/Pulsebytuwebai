export type SettingsTabValue =
  | 'general'
  | 'notificaciones'
  | 'seguridad';

export interface SecuritySettings {
  session_timeout: number;
}
