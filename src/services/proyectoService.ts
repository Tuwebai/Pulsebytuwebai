/**
 * Servicio de Proyectos - Capa de Servicios
 * 
 * Proporciona funciones tipadas para operaciones CRUD de proyectos
 * utilizando el cliente HTTP centralizado.
 * 
 * @version 1.0.0
 */

import { apiClient, ApiError } from '@/lib/api/client';
import type { Project, CreateProjectData, UpdateProjectData, ProjectFilters, ProjectSort } from '@/types/project.types';

// ============================================
// INTERFACES DE RESPUESTA
// ============================================

/**
 * Respuesta paginada de proyectos
 */
export interface ProyectosResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * DTO para crear un proyecto via API
 */
export interface CreateProyectoDTO {
  name: string;
  description?: string;
  technologies: string[];
  environment_variables?: Record<string, string>;
  status?: Project['status'];
  github_repository_url?: string;
  customicon?: string;
}

/**
 * DTO para actualizar un proyecto via API
 */
export interface UpdateProyectoDTO {
  name?: string;
  description?: string;
  technologies?: string[];
  environment_variables?: Record<string, string>;
  status?: Project['status'];
  github_repository_url?: string;
  customicon?: string;
  is_active?: boolean;
}

// ============================================
// SERVICIO
// ============================================

/**
 * Servicio para gestionar proyectos a través de la API
 */
export const proyectoService = {
  /**
   * Obtener todos los proyectos con filtros, paginación y ordenamiento
   */
  async getProyectos(
    filters?: ProjectFilters,
    sort?: ProjectSort,
    page = 1,
    limit = 10
  ): Promise<ProyectosResponse> {
    try {
      // Construir query params
      const queryParams = new URLSearchParams();
      
      if (page) queryParams.set('page', String(page));
      if (limit) queryParams.set('limit', String(limit));
      
      if (filters) {
        if (filters.status) queryParams.set('status', filters.status);
        if (filters.technology) queryParams.set('technology', filters.technology);
        if (filters.search) queryParams.set('search', filters.search);
        if (filters.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.set('dateTo', filters.dateTo);
      }
      
      if (sort) {
        queryParams.set('sortField', sort.field);
        queryParams.set('sortDirection', sort.direction);
      }

      const queryString = queryParams.toString();
      const path = queryString ? `/proyectos?${queryString}` : '/proyectos';

      const response = await apiClient.get<ProyectosResponse>(path);
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Error al obtener proyectos: ${error.message}`);
      }
      throw new Error('Error al obtener proyectos: Error desconocido');
    }
  },

  /**
   * Obtener un proyecto por su ID
   */
  async getProyectoById(id: string): Promise<Project> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('El ID del proyecto es requerido');
      }

      const response = await apiClient.get<Project>(`/proyectos/${id}`);
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Proyecto no encontrado');
        }
        throw new Error(`Error al obtener el proyecto: ${error.message}`);
      }
      throw new Error('Error al obtener el proyecto: Error desconocido');
    }
  },

  /**
   * Crear un nuevo proyecto
   */
  async createProyecto(data: CreateProyectoDTO): Promise<Project> {
    try {
      // Validación básica
      if (!data.name || data.name.trim() === '') {
        throw new Error('El nombre del proyecto es requerido');
      }

      if (!data.technologies || data.technologies.length === 0) {
        throw new Error('Al menos una tecnología es requerida');
      }

      const response = await apiClient.post<Project>('/proyectos', data);
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          throw new Error('Datos del proyecto inválidos');
        }
        if (error.status === 409) {
          throw new Error('Ya existe un proyecto con ese nombre');
        }
        throw new Error(`Error al crear el proyecto: ${error.message}`);
      }
      throw new Error('Error al crear el proyecto: Error desconocido');
    }
  },

  /**
   * Actualizar un proyecto existente
   */
  async updateProyecto(id: string, data: UpdateProyectoDTO): Promise<Project> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('El ID del proyecto es requerido');
      }

      const response = await apiClient.patch<Project>(`/proyectos/${id}`, data);
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Proyecto no encontrado');
        }
        if (error.status === 400) {
          throw new Error('Datos del proyecto inválidos');
        }
        throw new Error(`Error al actualizar el proyecto: ${error.message}`);
      }
      throw new Error('Error al actualizar el proyecto: Error desconocido');
    }
  },

  /**
   * Eliminar un proyecto
   */
  async deleteProyecto(id: string): Promise<void> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('El ID del proyecto es requerido');
      }

      await apiClient.delete<void>(`/proyectos/${id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Proyecto no encontrado');
        }
        if (error.status === 403) {
          throw new Error('No tienes permisos para eliminar este proyecto');
        }
        throw new Error(`Error al eliminar el proyecto: ${error.message}`);
      }
      throw new Error('Error al eliminar el proyecto: Error desconocido');
    }
  },
};

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
