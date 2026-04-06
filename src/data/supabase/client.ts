import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase requeridas');
}

let supabaseInstance: SupabaseClient | null = null;
let isInitializing = false;

const createCustomStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }

  return {
    getItem: (key: string) => {
      try {
        const item = localStorage.getItem(key);
        return Promise.resolve(item);
      } catch (error) {
        console.warn('Error reading from localStorage:', error);
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch (error) {
        console.warn('Error writing to localStorage:', error);
        return Promise.resolve();
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch (error) {
        console.warn('Error removing from localStorage:', error);
        return Promise.resolve();
      }
    },
  };
};

const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance && !isInitializing) {
    isInitializing = true;

    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: createCustomStorage(),
          storageKey: 'pulse.auth.supabase',
        },
      });
    } catch (error) {
      console.error('Error creando instancia de Supabase:', error);
      isInitializing = false;
      throw error;
    } finally {
      isInitializing = false;
    }
  }

  if (!supabaseInstance) {
    throw new Error('No se pudo crear la instancia de Supabase');
  }

  return supabaseInstance;
};

export const supabase = getSupabaseClient();

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          avatar_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          user_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          user_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          user_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          asunto: string;
          mensaje: string | null;
          email: string | null;
          fecha: string | null;
          estado: string | null;
          prioridad: string | null;
          respuesta: string | null;
          respondido_por: string | null;
          fecha_respuesta: string | null;
          respuesta_cliente: string | null;
          fecha_respuesta_cliente: string | null;
          status: string | null;
          priority: string | null;
          user_id: string | null;
          assigned_admin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asunto: string;
          mensaje?: string | null;
          email?: string | null;
          fecha?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          respuesta?: string | null;
          respondido_por?: string | null;
          fecha_respuesta?: string | null;
          respuesta_cliente?: string | null;
          fecha_respuesta_cliente?: string | null;
          status?: string | null;
          priority?: string | null;
          user_id?: string | null;
          assigned_admin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asunto?: string;
          mensaje?: string | null;
          email?: string | null;
          fecha?: string | null;
          estado?: string | null;
          prioridad?: string | null;
          respuesta?: string | null;
          respondido_por?: string | null;
          fecha_respuesta?: string | null;
          respuesta_cliente?: string | null;
          fecha_respuesta_cliente?: string | null;
          status?: string | null;
          priority?: string | null;
          user_id?: string | null;
          assigned_admin_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: string;
          payment_method: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          status?: string;
          payment_method: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          payment_method?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      environment_variables: {
        Row: {
          id: string;
          key: string;
          value: string;
          is_sensitive: boolean;
          environment: string;
          project_id: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          is_sensitive?: boolean;
          environment?: string;
          project_id: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          is_sensitive?: boolean;
          environment?: string;
          project_id?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
    };
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Ticket = Database['public']['Tables']['tickets']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type EnvironmentVariable = Database['public']['Tables']['environment_variables']['Row'];
