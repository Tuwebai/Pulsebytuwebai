import { toast } from '@/hooks/use-toast';
import type {
  Project,
  Task,
} from '@/lib/supabase/legacySupabase.types';
import { supabase } from './supabase';

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Error desconocido';
}

export class SupabaseService {
  static async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getProjectsByUserId(userId: string): Promise<Project[]> {
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  static async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase.from('projects').insert([project]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const { error } = await supabase.from('projects').update(updates).eq('id', id);
    if (error) throw error;
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  }

  static async getTasks(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single();
    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) throw error;
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }

  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static handleError(error: unknown, context: string = 'Operación'): void {
    console.error(`Error en ${context}:`, error);
    toast({
      title: 'Error',
      description: `Error en ${context}: ${describeError(error)}`,
      variant: 'destructive',
    });
  }
}

export const supabaseService = new SupabaseService();

export type {
  Project,
  Task,
} from '@/lib/supabase/legacySupabase.types';
