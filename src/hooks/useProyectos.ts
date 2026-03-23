/**
 * Hooks de Proyectos - Capa de React Query
 * 
 * Proporciona hooks tipados para operaciones CRUD de proyectos
 * utilizando React Query para cache, invalidación y estados.
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectoService, type ProyectosResponse } from '@/services/proyectoService';
import type { Project, ProjectFilters, ProjectSort, CreateProjectData, UpdateProjectData } from '@/types/project.types';

// ============================================
// QUERY KEYS
// ============================================

const QUERY_KEYS = {
  proyectos: ['proyectos'] as const,
  proyecto: (id: string) => ['proyectos', id] as const,
  proyectosList: (filters?: ProjectFilters, sort?: ProjectSort, page?: number, limit?: number) => 
    ['proyectos', 'list', filters, sort, page, limit] as const,
};

// ============================================
// HOOKS DE QUERY
// ============================================

/**
 * Hook para obtener una lista de proyectos con filtros, paginación y ordenamiento
 */
export function useProyectos(
  filters?: ProjectFilters,
  sort?: ProjectSort,
  page = 1,
  limit = 10
) {
  return useQuery<ProyectosResponse, Error>({
    queryKey: QUERY_KEYS.proyectosList(filters, sort, page, limit),
    queryFn: () => proyectoService.getProyectos(filters, sort, page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
  });
}

/**
 * Hook para obtener un proyecto individual por ID
 */
export function useProyecto(id: string | null) {
  return useQuery<Project, Error>({
    queryKey: QUERY_KEYS.proyecto(id ?? ''),
    queryFn: () => {
      if (!id) {
        throw new Error('El ID del proyecto es requerido');
      }
      return proyectoService.getProyectoById(id);
    },
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

// ============================================
// HOOKS DE MUTATION
// ============================================

/**
 * Hook para crear un nuevo proyecto
 * Invalida la lista de proyectos después de crear
 */
export function useCrearProyecto() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, CreateProjectData>({
    mutationFn: (data: CreateProjectData) => proyectoService.createProyecto(data),
    onSuccess: () => {
      // Invalidar todas las queries de proyectos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectos });
    },
    onError: (error) => {
      console.error('Error al crear proyecto:', error.message);
    },
  });
}

/**
 * Hook para actualizar un proyecto existente
 * Invalida la lista y el proyecto específico después de actualizar
 */
export function useActualizarProyecto() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, { id: string; data: UpdateProjectData }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) => 
      proyectoService.updateProyecto(id, data),
    onSuccess: (_data, variables) => {
      // Invalidar la lista de proyectos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectos });
      // Invalidar el proyecto específico
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyecto(variables.id) });
    },
    onError: (error) => {
      console.error('Error al actualizar proyecto:', error.message);
    },
  });
}

/**
 * Hook para eliminar un proyecto
 * Invalida la lista de proyectos después de eliminar
 */
export function useEliminarProyecto() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => proyectoService.deleteProyecto(id),
    onSuccess: () => {
      // Invalidar todas las queries de proyectos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proyectos });
    },
    onError: (error) => {
      console.error('Error al eliminar proyecto:', error.message);
    },
  });
}

// ============================================
// EXPORTS
// ============================================

export type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
  ProjectSort,
};
