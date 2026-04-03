import { supabase } from '@/lib/supabase/supabase';
import type { Project, ProjectFilters, ProjectSort } from '@/types/project.types';

export async function getProjects(
  filters?: ProjectFilters,
  sort?: ProjectSort,
  page = 1,
  limit = 10,
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('projects').select('*', { count: 'exact' });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.technology) {
    query = query.contains('technologies', [filters.technology]);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  query = sort
    ? query.order(sort.field, { ascending: sort.direction === 'asc' })
    : query.order('created_at', { ascending: false });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Error al obtener proyectos: ${error.message}`);
  }

  return {
    projects: (data ?? []) as Project[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getProjectById(id: string): Promise<Project> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

  if (error) {
    throw new Error(`Error al obtener el proyecto: ${error.message}`);
  }

  if (!data) {
    throw new Error('Proyecto no encontrado');
  }

  return data as Project;
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('created_by', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener proyectos del usuario: ${error.message}`);
  }

  return (data ?? []) as Project[];
}
