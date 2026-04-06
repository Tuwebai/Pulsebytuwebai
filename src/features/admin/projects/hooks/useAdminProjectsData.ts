import { useCallback, useEffect, useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { projectService } from '@/features/project/services/project.service';
import { toast } from '@/core/notifications/hooks/useToast';
import type { CreateProjectData, Project, ProjectFilters, ProjectSort, UpdateProjectData } from '@/types/project.types';

export function useAdminProjectsData() {
  const { user } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [sort, setSort] = useState<ProjectSort>({ field: 'created_at', direction: 'desc' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const loadProjects = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await projectService.getProjects(filters, sort, pagination.page, pagination.limit);
      setProjects(result.projects);
      setPagination((prev) => ({ ...prev, total: result.total, totalPages: result.totalPages }));
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Error al cargar los proyectos');
      toast({ title: 'Error', description: 'No se pudieron cargar los proyectos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, filters, sort, pagination.page, pagination.limit]);

  const createProject = useCallback(async (projectData: CreateProjectData) => {
    if (!user || user.role !== 'admin') {
      toast({ title: 'Error', description: 'No tenés permisos para crear proyectos', variant: 'destructive' });
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const validation = projectService.validateProjectData(projectData);
      if (!validation.isValid) {
        const description = validation.errors.join(', ');
        setError(description);
        toast({ title: 'Error de validación', description, variant: 'destructive' });
        return null;
      }

      const newProject = await projectService.createProject({ ...projectData, user_role: user.role });
      setProjects((prev) => [newProject, ...prev]);
      toast({ title: 'Éxito', description: 'Proyecto creado correctamente' });
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Error al crear el proyecto');
      toast({ title: 'Error', description: 'No se pudo crear el proyecto', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProject = useCallback(async (id: string, projectData: UpdateProjectData) => {
    if (!user || user.role !== 'admin') {
      toast({ title: 'Error', description: 'No tenés permisos para actualizar proyectos', variant: 'destructive' });
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedProject = await projectService.updateProject(id, projectData);
      setProjects((prev) => prev.map((project) => (project.id === id ? updatedProject : project)));
      toast({ title: 'Éxito', description: 'Proyecto actualizado correctamente' });
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Error al actualizar el proyecto');
      toast({ title: 'Error', description: 'No se pudo actualizar el proyecto', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProject = useCallback(async (id: string) => {
    if (!user || user.role !== 'admin') {
      toast({ title: 'Error', description: 'No tenés permisos para eliminar proyectos', variant: 'destructive' });
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await projectService.deleteProject(id, user.id || '', user.role || 'cliente');
      setProjects((prev) => prev.filter((project) => project.id !== id));
      toast({ title: 'Éxito', description: 'Proyecto eliminado correctamente' });
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Error al eliminar el proyecto');
      toast({ title: 'Error', description: 'No se pudo eliminar el proyecto', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    filters,
    sort,
    pagination,
    createProject,
    updateProject,
    deleteProject,
    changePage: (page: number) => setPagination((prev) => ({ ...prev, page })),
    changeLimit: (limit: number) => setPagination((prev) => ({ ...prev, limit, page: 1 })),
    applyFilters: (newFilters: ProjectFilters) => {
      setFilters(newFilters);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    applySort: (newSort: ProjectSort) => {
      setSort(newSort);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    clearFilters: () => {
      setFilters({});
      setSort({ field: 'created_at', direction: 'desc' });
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    reload: loadProjects,
  };
}
