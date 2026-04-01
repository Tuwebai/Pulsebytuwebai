import { supabase } from '../supabase';
import { handleSupabaseError } from './errorHandler';

export interface UserPreferences {
  id?: string;
  user_id: string;
  preference_type: 'theme' | 'dashboard_widgets' | 'dashboard_layouts' | 'language' | 'welcome_back';
  preference_key: string;
  preference_value: JsonValue;
  created_at?: string;
  updated_at?: string;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const shouldParseAsJson = (value: string): boolean => {
  const normalized = value.trim();

  if (!normalized) {
    return false;
  }

  return (
    normalized.startsWith('{') ||
    normalized.startsWith('[') ||
    normalized.startsWith('"') ||
    normalized === 'true' ||
    normalized === 'false' ||
    normalized === 'null' ||
    /^-?\d+(\.\d+)?$/.test(normalized)
  );
};

const parseStoredPreferenceValue = (value: string): JsonValue => {
  if (!shouldParseAsJson(value)) {
    return value;
  }

  try {
    return JSON.parse(value) as JsonValue;
  } catch {
    return value;
  }
};

const isThemeValue = (value: JsonValue): value is 'dark' => {
  return value === 'dark';
};

const isStringArray = (value: JsonValue): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const isPreferencesAuthError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String(error.code ?? '') : '';
  const message = 'message' in error ? String(error.message ?? '') : '';

  return code === '42501' || message.includes('401') || message.toLowerCase().includes('unauthorized');
};

export class UserPreferencesService {
  // Obtener preferencias del usuario
  async getUserPreferences(userId: string, preferenceType?: string): Promise<UserPreferences[]> {
    try {
      let query = supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);

      if (preferenceType) {
        query = query.eq('preference_type', preferenceType);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) {
        if (isPreferencesAuthError(error)) {
          return [];
        }

        throw error;
      }
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'Obtener preferencias del usuario');
      return [];
    }
  }

  // Guardar preferencia del usuario
  async saveUserPreference(
    userId: string, 
    preferenceType: string, 
    preferenceKey: string, 
    preferenceValue: JsonValue
  ): Promise<UserPreferences | null> {
    try {
      const preferenceData = {
        user_id: userId,
        preference_type: preferenceType as UserPreferences['preference_type'],
        preference_key: preferenceKey,
        preference_value: preferenceValue,
        updated_at: new Date().toISOString()
      };

      // Usar upsert para evitar errores de constraint Ãºnico
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferenceData, {
          onConflict: 'user_id,preference_type,preference_key',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        if (isPreferencesAuthError(error)) {
          return null;
        }

        // Fallback: intentar actualizar primero, luego insertar
        try {
          const { data: existing } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .eq('preference_type', preferenceType)
            .eq('preference_key', preferenceKey)
            .maybeSingle();

          if (existing) {
            const { data: updateData, error: updateError } = await supabase
              .from('user_preferences')
              .update(preferenceData)
              .eq('id', existing.id)
              .select()
              .single();
            
            if (updateError) {
              if (isPreferencesAuthError(updateError)) {
                return null;
              }

              throw updateError;
            }
            return updateData;
          } else {
            const { data: insertData, error: insertError } = await supabase
              .from('user_preferences')
              .insert([preferenceData])
              .select()
              .single();
            
            if (insertError) {
              if (isPreferencesAuthError(insertError)) {
                return null;
              }

              throw insertError;
            }
            return insertData;
          }
        } catch (fallbackError) {
          if (!isPreferencesAuthError(fallbackError)) {
            console.warn('Fallback tambiÃ©n fallÃ³, continuando sin guardar preferencia:', fallbackError);
          }
          return null;
        }
      }

      return data;
    } catch (error) {
      console.warn('Error en saveUserPreference, continuando:', error);
      return null;
    }
  }

  // Eliminar preferencia del usuario
  async deleteUserPreference(
    userId: string, 
    preferenceType: string, 
    preferenceKey: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('preference_type', preferenceType)
        .eq('preference_key', preferenceKey);

      if (error) {
        if (isPreferencesAuthError(error)) {
          return false;
        }

        throw error;
      }
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Eliminar preferencia del usuario');
      return false;
    }
  }

  // Migrar datos de localStorage a la base de datos
  async migrateLocalStorageToDB(userId: string): Promise<void> {
    try {
      const migrations = [
        {
          type: 'theme',
          key: 'theme',
          getValue: () => localStorage.getItem('theme')
        },
        {
          type: 'dashboard_widgets',
          key: 'dashboard_widgets',
          getValue: () => localStorage.getItem('dashboard_widgets')
        },
        {
          type: 'dashboard_layouts',
          key: 'dashboard_layouts',
          getValue: () => localStorage.getItem('dashboardLayouts')
        },
        {
          type: 'language',
          key: 'i18nextLng',
          getValue: () => localStorage.getItem('i18nextLng')
        },
        {
          type: 'welcome_back',
          key: 'tuwebai_welcome_back',
          getValue: () => localStorage.getItem('tuwebai_welcome_back')
        },
      ];

      for (const migration of migrations) {
        const value = migration.getValue();
        if (value) {
          const parsedValue = parseStoredPreferenceValue(value);
          await this.saveUserPreference(userId, migration.type, migration.key, parsedValue);
        }
      }

      // Limpiar localStorage despuÃ©s de migrar
      this.clearMigratedLocalStorage();
    } catch (error) {
      handleSupabaseError(error, 'Migrar localStorage a base de datos');
    }
  }

  // Limpiar localStorage despuÃ©s de migraciÃ³n
  private clearMigratedLocalStorage(): void {
    const keysToRemove = [
      'theme',
      'dashboard_widgets',
      'dashboardLayouts',
      'i18nextLng',
      'tuwebai_welcome_back'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Obtener tema del usuario
  async getUserTheme(userId: string): Promise<'dark'> {
    try {
      const preferences = await this.getUserPreferences(userId, 'theme');
      const themePreference = preferences.find(p => p.preference_key === 'theme');
      
      if (themePreference && isThemeValue(themePreference.preference_value)) {
        return themePreference.preference_value;
      }
      
      return 'dark';
    } catch (error) {
      handleSupabaseError(error, 'Obtener tema del usuario');
      return 'dark';
    }
  }

  // Guardar tema del usuario
  async saveUserTheme(userId: string, theme: 'dark'): Promise<void> {
    await this.saveUserPreference(userId, 'theme', 'theme', theme);
  }

  // Obtener widgets del dashboard
  async getDashboardWidgets(userId: string): Promise<string[]> {
    try {
      const preferences = await this.getUserPreferences(userId, 'dashboard_widgets');
      const widgetsPreference = preferences.find(p => p.preference_key === 'dashboard_widgets');
      
      if (widgetsPreference && isStringArray(widgetsPreference.preference_value)) {
        return widgetsPreference.preference_value;
      }
      
      return []; // Widgets por defecto
    } catch (error) {
      handleSupabaseError(error, 'Obtener widgets del dashboard');
      return [];
    }
  }

  // Guardar widgets del dashboard
  async saveDashboardWidgets(userId: string, widgets: string[]): Promise<void> {
    await this.saveUserPreference(userId, 'dashboard_widgets', 'dashboard_widgets', widgets);
  }

}

export const userPreferencesService = new UserPreferencesService();

