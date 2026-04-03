import { supabase } from '@/lib/supabase/supabase';
import { handleSupabaseError } from '@/lib/services/errorHandler';
import type { JsonValue, UserPreferenceRecord, UserPreferenceType } from '@/features/auth/services/userPreferences.types';
import {
  isPreferencesAuthError,
  isStringArray,
  isThemeValue,
  localStoragePreferenceKeys,
  localStoragePreferenceMigrations,
  parseStoredPreferenceValue,
} from '@/features/auth/services/userPreferences.utils';

function buildPreferencePayload(
  userId: string,
  preferenceType: UserPreferenceType,
  preferenceKey: string,
  preferenceValue: JsonValue,
) {
  return {
    user_id: userId,
    preference_type: preferenceType,
    preference_key: preferenceKey,
    preference_value: preferenceValue,
    updated_at: new Date().toISOString(),
  };
}

async function upsertUserPreferenceRecord(
  preferenceData: ReturnType<typeof buildPreferencePayload>,
): Promise<UserPreferenceRecord | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(preferenceData, {
      onConflict: 'user_id,preference_type,preference_key',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (!error) {
    return data;
  }

  if (isPreferencesAuthError(error)) {
    return null;
  }

  return updateOrInsertUserPreference(preferenceData);
}

async function updateOrInsertUserPreference(
  preferenceData: ReturnType<typeof buildPreferencePayload>,
): Promise<UserPreferenceRecord | null> {
  try {
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', preferenceData.user_id)
      .eq('preference_type', preferenceData.preference_type)
      .eq('preference_key', preferenceData.preference_key)
      .maybeSingle();

    if (!existing) {
      return insertUserPreference(preferenceData);
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .update(preferenceData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      if (isPreferencesAuthError(error)) {
        return null;
      }

      throw error;
    }

    return data;
  } catch (error) {
    if (!isPreferencesAuthError(error)) {
      console.warn('Fallback de user preferences sin persistencia:', error);
    }

    return null;
  }
}

async function insertUserPreference(
  preferenceData: ReturnType<typeof buildPreferencePayload>,
): Promise<UserPreferenceRecord | null> {
  const { data, error } = await supabase.from('user_preferences').insert([preferenceData]).select().single();

  if (error) {
    if (isPreferencesAuthError(error)) {
      return null;
    }

    throw error;
  }

  return data;
}

export const userPreferencesService = {
  async getUserPreferences(userId: string, preferenceType?: UserPreferenceType): Promise<UserPreferenceRecord[]> {
    try {
      let query = supabase.from('user_preferences').select('*').eq('user_id', userId);

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

      return data ?? [];
    } catch (error) {
      handleSupabaseError(error, 'Obtener preferencias del usuario');
      return [];
    }
  },

  async saveUserPreference(
    userId: string,
    preferenceType: UserPreferenceType,
    preferenceKey: string,
    preferenceValue: JsonValue,
  ): Promise<UserPreferenceRecord | null> {
    try {
      return await upsertUserPreferenceRecord(
        buildPreferencePayload(userId, preferenceType, preferenceKey, preferenceValue),
      );
    } catch (error) {
      console.warn('Error en saveUserPreference, continuando:', error);
      return null;
    }
  },

  async deleteUserPreference(userId: string, preferenceType: UserPreferenceType, preferenceKey: string): Promise<boolean> {
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
  },

  async migrateLocalStorageToDB(userId: string): Promise<void> {
    try {
      for (const migration of localStoragePreferenceMigrations) {
        const value = migration.getValue();

        if (!value) {
          continue;
        }

        await this.saveUserPreference(userId, migration.type, migration.key, parseStoredPreferenceValue(value));
      }

      localStoragePreferenceKeys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      handleSupabaseError(error, 'Migrar localStorage a base de datos');
    }
  },

  async getUserTheme(userId: string): Promise<'dark'> {
    try {
      const preferences = await this.getUserPreferences(userId, 'theme');
      const themePreference = preferences.find((preference) => preference.preference_key === 'theme');

      if (themePreference && isThemeValue(themePreference.preference_value)) {
        return themePreference.preference_value;
      }

      return 'dark';
    } catch (error) {
      handleSupabaseError(error, 'Obtener tema del usuario');
      return 'dark';
    }
  },

  async saveUserTheme(userId: string, theme: 'dark'): Promise<void> {
    await this.saveUserPreference(userId, 'theme', 'theme', theme);
  },

  async getDashboardWidgets(userId: string): Promise<string[]> {
    try {
      const preferences = await this.getUserPreferences(userId, 'dashboard_widgets');
      const widgetsPreference = preferences.find((preference) => preference.preference_key === 'dashboard_widgets');

      if (widgetsPreference && isStringArray(widgetsPreference.preference_value)) {
        return widgetsPreference.preference_value;
      }

      return [];
    } catch (error) {
      handleSupabaseError(error, 'Obtener widgets del dashboard');
      return [];
    }
  },

  async saveDashboardWidgets(userId: string, widgets: string[]): Promise<void> {
    await this.saveUserPreference(userId, 'dashboard_widgets', 'dashboard_widgets', widgets);
  },
};
