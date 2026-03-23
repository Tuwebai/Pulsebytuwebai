import { supabase } from '../supabase';
import { handleSupabaseError } from './errorHandler';

export interface UserPreferences {
  id?: string;
  user_id: string;
  preference_type: 'theme' | 'dashboard_widgets' | 'dashboard_layouts' | 'language' | 'welcome_back' | 'auth_state';
  preference_key: string;
  preference_value: JsonValue;
  created_at?: string;
  updated_at?: string;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface DashboardWidgetConfig {
  dataSource?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  metrics?: string[];
  refreshInterval?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  description?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: DashboardWidgetConfig;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  createdAt?: string;
  updatedAt?: string;
  layout?: Record<string, unknown> | null;
  isDefault?: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const sanitizeText = (value: unknown, fallback: string): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
};

const sanitizeNumber = (value: unknown, fallback: number): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const sanitizeWidgetType = (value: unknown): DashboardWidget['type'] => {
  return value === 'metric' || value === 'chart' || value === 'table' || value === 'list'
    ? value
    : 'metric';
};

const sanitizeChartType = (value: unknown): DashboardWidgetConfig['chartType'] => {
  return value === 'line' || value === 'bar' || value === 'pie' || value === 'area'
    ? value
    : undefined;
};

const normalizeDashboardWidget = (value: unknown, index: number): DashboardWidget => {
  if (typeof value === 'string') {
    const title = value.replace(/[-_]/g, ' ').trim();

    return {
      id: value || `widget-${index}`,
      type: 'metric',
      title: title || `Widget ${index + 1}`,
      description: 'Widget migrado desde una configuraci??n legacy',
      position: { x: index % 3, y: Math.floor(index / 3) },
      size: { width: 3, height: 2 },
      config: {},
      visible: true
    };
  }

  if (!isRecord(value)) {
    return {
      id: `widget-${index}`,
      type: 'metric',
      title: `Widget ${index + 1}`,
      description: 'Widget recuperado con configuraci??n por defecto',
      position: { x: index % 3, y: Math.floor(index / 3) },
      size: { width: 3, height: 2 },
      config: {},
      visible: true
    };
  }

  const config = isRecord(value.config) ? value.config : {};
  const position = isRecord(value.position) ? value.position : {};
  const size = isRecord(value.size) ? value.size : {};

  return {
    id: sanitizeText(value.id, `widget-${index}`),
    type: sanitizeWidgetType(value.type),
    title: sanitizeText(value.title, `Widget ${index + 1}`),
    description: typeof value.description === 'string' ? value.description : undefined,
    position: {
      x: sanitizeNumber(position.x, index % 3),
      y: sanitizeNumber(position.y, Math.floor(index / 3))
    },
    size: {
      width: sanitizeNumber(size.width, 3),
      height: sanitizeNumber(size.height, 2)
    },
    config: {
      dataSource: typeof config.dataSource === 'string' ? config.dataSource : undefined,
      chartType: sanitizeChartType(config.chartType),
      metrics: Array.isArray(config.metrics) ? config.metrics.filter((metric): metric is string => typeof metric === 'string') : undefined,
      refreshInterval: sanitizeNumber(config.refreshInterval, 0) || undefined,
      showLegend: typeof config.showLegend === 'boolean' ? config.showLegend : undefined,
      showGrid: typeof config.showGrid === 'boolean' ? config.showGrid : undefined
    },
    visible: typeof value.visible === 'boolean' ? value.visible : true
  };
};

const normalizeDashboardLayout = (value: unknown, index: number): DashboardLayout | null => {
  if (!isRecord(value)) {
    return null;
  }

  const createdAt = sanitizeText(value.createdAt, new Date().toISOString());
  const updatedAt = sanitizeText(value.updatedAt, createdAt);
  const widgets = Array.isArray(value.widgets)
    ? value.widgets.map((widget, widgetIndex) => normalizeDashboardWidget(widget, widgetIndex))
    : [];

  return {
    id: sanitizeText(value.id, `layout-${index}`),
    name: sanitizeText(value.name, `Dashboard ${index + 1}`),
    description: typeof value.description === 'string' ? value.description : 'Dashboard personalizado',
    widgets,
    createdAt,
    updatedAt,
    layout: isRecord(value.layout) ? value.layout : null,
    isDefault: typeof value.isDefault === 'boolean' ? value.isDefault : index === 0
  };
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

      if (error) throw error;
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
        console.warn('Error al guardar preferencia, usando fallback:', error);
        // Fallback: intentar actualizar primero, luego insertar
        try {
          const { data: existing } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .eq('preference_type', preferenceType)
            .eq('preference_key', preferenceKey)
            .single();

          if (existing) {
            const { data: updateData, error: updateError } = await supabase
              .from('user_preferences')
              .update(preferenceData)
              .eq('id', existing.id)
              .select()
              .single();
            
            if (updateError) throw updateError;
            return updateData;
          } else {
            const { data: insertData, error: insertError } = await supabase
              .from('user_preferences')
              .insert([preferenceData])
              .select()
              .single();
            
            if (insertError) throw insertError;
            return insertData;
          }
        } catch (fallbackError) {
          console.warn('Fallback tambiÃ©n fallÃ³, continuando sin guardar preferencia:', fallbackError);
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

      if (error) throw error;
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
        {
          type: 'auth_state',
          key: 'tuwebai_auth',
          getValue: () => localStorage.getItem('tuwebai_auth')
        }
      ];

      for (const migration of migrations) {
        const value = migration.getValue();
        if (value) {
          try {
            const parsedValue = JSON.parse(value);
            await this.saveUserPreference(userId, migration.type, migration.key, parsedValue);
          } catch {
            // Si no es JSON vÃ¡lido, guardar como string
            await this.saveUserPreference(userId, migration.type, migration.key, value);
          }
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
      'tuwebai_welcome_back',
      'tuwebai_auth'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Obtener tema del usuario
  async getUserTheme(userId: string): Promise<'light' | 'dark'> {
    try {
      const preferences = await this.getUserPreferences(userId, 'theme');
      const themePreference = preferences.find(p => p.preference_key === 'theme');
      
      if (themePreference && themePreference.preference_value) {
        return themePreference.preference_value;
      }
      
      return 'light'; // Tema por defecto
    } catch (error) {
      handleSupabaseError(error, 'Obtener tema del usuario');
      return 'light';
    }
  }

  // Guardar tema del usuario
  async saveUserTheme(userId: string, theme: 'light' | 'dark'): Promise<void> {
    await this.saveUserPreference(userId, 'theme', 'theme', theme);
  }

  // Obtener widgets del dashboard
  async getDashboardWidgets(userId: string): Promise<string[]> {
    try {
      const preferences = await this.getUserPreferences(userId, 'dashboard_widgets');
      const widgetsPreference = preferences.find(p => p.preference_key === 'dashboard_widgets');
      
      if (widgetsPreference && widgetsPreference.preference_value) {
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

  // Obtener layouts del dashboard
  async getDashboardLayouts(userId: string): Promise<DashboardLayout[]> {
    try {
      const preferences = await this.getUserPreferences(userId, 'dashboard_layouts');
      const layoutsPreference = preferences.find(p => p.preference_key === 'dashboard_layouts');
      
      if (layoutsPreference && layoutsPreference.preference_value) {
        return this.normalizeDashboardLayouts(layoutsPreference.preference_value);
      }
      
      return []; // Layouts por defecto
    } catch (error) {
      handleSupabaseError(error, 'Obtener layouts del dashboard');
      return [];
    }
  }

  normalizeDashboardLayouts(value: unknown): DashboardLayout[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((layout, index) => normalizeDashboardLayout(layout, index))
      .filter((layout): layout is DashboardLayout => layout !== null);
  }

  // Guardar layouts del dashboard
  async saveDashboardLayouts(userId: string, layouts: DashboardLayout[]): Promise<void> {
    const normalizedLayouts = this.normalizeDashboardLayouts(layouts);
    await this.saveUserPreference(userId, 'dashboard_layouts', 'dashboard_layouts', normalizedLayouts);
  }

  // Obtener idioma del usuario
  async getUserLanguage(userId: string): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId, 'language');
      const languagePreference = preferences.find(p => p.preference_key === 'i18nextLng');
      
      if (languagePreference && languagePreference.preference_value) {
        return languagePreference.preference_value;
      }
      
      return 'es'; // Idioma por defecto
    } catch (error) {
      handleSupabaseError(error, 'Obtener idioma del usuario');
      return 'es';
    }
  }

  // Guardar idioma del usuario
  async saveUserLanguage(userId: string, language: string): Promise<void> {
    await this.saveUserPreference(userId, 'language', 'i18nextLng', language);
  }

  // Sincronizar preferencias con localStorage (fallback)
  async syncWithLocalStorage(userId: string): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      preferences.forEach(preference => {
        const value = preference.preference_value;
        
        switch (preference.preference_type) {
          case 'theme':
            localStorage.setItem('theme', value);
            break;
          case 'dashboard_widgets':
            localStorage.setItem('dashboard_widgets', JSON.stringify(value));
            break;
          case 'dashboard_layouts':
            localStorage.setItem('dashboardLayouts', JSON.stringify(value));
            break;
          case 'language':
            localStorage.setItem('i18nextLng', value);
            break;
          case 'welcome_back':
            localStorage.setItem('tuwebai_welcome_back', value);
            break;
          case 'auth_state':
            localStorage.setItem('tuwebai_auth', JSON.stringify(value));
            break;
        }
      });
    } catch (error) {
      handleSupabaseError(error, 'Sincronizar preferencias con localStorage');
    }
  }
}

export const userPreferencesService = new UserPreferencesService();

