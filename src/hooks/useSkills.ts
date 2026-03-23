/**
 * Hooks de Skills - Capa de React Query
 * 
 * Proporciona hooks tipados para operaciones CRUD de skills de usuario
 * utilizando React Query para cache, invalidación y estados.
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ============================================
// TIPOS
// ============================================

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  proficiency_level: number;
  experience_years: number;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSkillData {
  skill_name: string;
  proficiency_level: number;
  experience_years: number;
}

export interface UpdateSkillData {
  id: string;
  skill_name?: string;
  proficiency_level?: number;
  experience_years?: number;
}

// ============================================
// QUERY KEYS
// ============================================

const QUERY_KEYS = {
  skills: ['skills'] as const,
  skill: (id: string) => ['skills', id] as const,
  skillsByUser: (userId: string) => ['skills', 'user', userId] as const,
};

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtiene los skills de un usuario específico
 */
async function fetchSkills(userId?: string): Promise<UserSkill[]> {
  let query = supabase
    .from('user_skills')
    .select('*')
    .order('proficiency_level', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Crea un nuevo skill
 */
async function createSkill(userId: string, data: CreateSkillData): Promise<UserSkill> {
  const { data: result, error } = await supabase
    .from('user_skills')
    .insert({
      user_id: userId,
      skill_name: data.skill_name,
      proficiency_level: data.proficiency_level,
      experience_years: data.experience_years,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

/**
 * Actualiza un skill existente
 */
async function updateSkill(data: UpdateSkillData): Promise<UserSkill> {
  const { data: result, error } = await supabase
    .from('user_skills')
    .update({
      skill_name: data.skill_name,
      proficiency_level: data.proficiency_level,
      experience_years: data.experience_years,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

/**
 * Elimina un skill
 */
async function deleteSkill(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================
// HOOKS DE QUERY
// ============================================

/**
 * Hook para obtener los skills del usuario
 */
export function useSkills(userId?: string) {
  return useQuery<UserSkill[], Error>({
    queryKey: QUERY_KEYS.skillsByUser(userId || 'all'),
    queryFn: () => fetchSkills(userId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    enabled: true, // Permitir ejecución aunque no haya userId
  });
}

// ============================================
// HOOKS DE MUTATION
// ============================================

/**
 * Hook para crear un nuevo skill
 */
export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation<UserSkill, Error, { userId: string; data: CreateSkillData }>({
    mutationFn: ({ userId, data }) => createSkill(userId, data),
    onSuccess: (_, variables) => {
      // Invalidar queries de skills
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skills });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skillsByUser(variables.userId) });
    },
  });
}

/**
 * Hook para actualizar un skill
 */
export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation<UserSkill, Error, UpdateSkillData>({
    mutationFn: (data) => updateSkill(data),
    onSuccess: () => {
      // Invalidar todas las queries de skills
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skills });
    },
  });
}

/**
 * Hook para eliminar un skill
 */
export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; userId: string }>({
    mutationFn: ({ id }) => deleteSkill(id),
    onSuccess: (_, variables) => {
      // Invalidar queries de skills
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skills });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.skillsByUser(variables.userId) });
    },
  });
}
