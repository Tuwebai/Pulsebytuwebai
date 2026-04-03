export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type UserPreferenceType =
  | 'theme'
  | 'dashboard_widgets'
  | 'dashboard_layouts'
  | 'language'
  | 'welcome_back';

export interface UserPreferenceRecord {
  id?: string;
  user_id: string;
  preference_type: UserPreferenceType;
  preference_key: string;
  preference_value: JsonValue;
  created_at?: string;
  updated_at?: string;
}

export interface LocalStoragePreferenceMigration {
  type: UserPreferenceType;
  key: string;
  getValue: () => string | null;
}
