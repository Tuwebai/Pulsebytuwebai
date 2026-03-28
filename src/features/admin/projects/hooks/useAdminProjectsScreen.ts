import { useState } from 'react';

import { toast } from '@/components/ui/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useProjects } from '@/hooks/useProjects';
import { StorageService } from '@/lib/storageService';
import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project.types';

const getErrorDetails = (error: unknown): { message: string; code?: string } => {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: string };

    return {
      message: error.message,
      code: errorWithCode.code,
    };
  }

  return {
    message: 'Error desconocido',
  };
};

export function useAdminProjectsScreen() {
  const { user } = useApp();
  const projectsState = useProjects();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const stats = {
    total: projectsState.projects.length,
    inProgress: projectsState.projects.filter(
      (project) => project.status === 'development' || project.status === 'maintenance',
    ).length,
    inProduction: projectsState.projects.filter((project) => project.status === 'production').length,
    paused: projectsState.projects.filter((project) => project.status === 'paused').length,
  };

  const handleCreateProject = async (data: CreateProjectData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'Usuario no autenticado',
        variant: 'destructive',
      });
      return;
    }

    setFormLoading(true);
    try {
      const projectDataWithCreator: CreateProjectData & { created_by: string; user_role: string } = {
        ...data,
        created_by: user.id,
        user_role: user.role,
      };

      await projectsState.createProject(projectDataWithCreator);
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProject = async (data: UpdateProjectData) => {
    if (!editingProject) return;

    setFormLoading(true);
    try {
      await projectsState.updateProject(editingProject.id, data);
      setEditingProject(null);
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteConfirmation = (projectId: string) => {
    const project = projectsState.projects.find((currentProject) => currentProject.id === projectId);
    if (!project) return;

    setProjectToDelete(project);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    await projectsState.deleteProject(projectToDelete.id);
    setShowConfirmDelete(false);
    setProjectToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setProjectToDelete(null);
  };

  const openCollaborate = (projectId: string) => {
    window.open(`/proyectos/${projectId}/colaboracion-admin`, '_blank');
  };

  const updateDevelopmentImage = async (projectId: string, imageFile: File) => {
    try {
      toast({
        title: 'Subiendo imagen...',
        description: 'Por favor espera mientras se sube la imagen.',
      });

      const bucketExists = await StorageService.ensureBucketExists();
      if (!bucketExists) {
        throw new Error('No se pudo crear el bucket de almacenamiento');
      }

      const uploadResult = await StorageService.uploadImage(imageFile, projectId, user?.id || '');

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Error al subir la imagen');
      }

      const result = await projectsState.updateProject(projectId, { screenshot_url: uploadResult.url });
      if (!result) {
        throw new Error('No se pudo actualizar la imagen en el proyecto');
      }

      toast({
        title: 'Imagen actualizada',
        description: 'La imagen de desarrollo se actualizo correctamente.',
      });
    } catch (error: unknown) {
      const { message } = getErrorDetails(error);

      toast({
        title: 'Error',
        description: `No se pudo actualizar la imagen: ${message}`,
        variant: 'destructive',
      });
    }
  };

  const duplicateProject = async (project: Project) => {
    try {
      const duplicateData: CreateProjectData = {
        name: `${project.name} (Copia)`,
        description: project.description,
        technologies: project.technologies,
        environment_variables: project.environment_variables,
        status: project.status,
        github_repository_url: project.github_repository_url,
        customicon: project.customicon,
        screenshot_url: project.screenshot_url,
      };

      await projectsState.createProject(duplicateData);

      toast({
        title: 'Proyecto duplicado',
        description: 'El proyecto se duplico correctamente.',
      });
    } catch (error: unknown) {
      const { message } = getErrorDetails(error);

      toast({
        title: 'Error',
        description: `No se pudo duplicar el proyecto: ${message}`,
        variant: 'destructive',
      });
    }
  };

  const renameProject = async (projectId: string, newName: string) => {
    try {
      const result = await projectsState.updateProject(projectId, { name: newName });
      if (!result) {
        throw new Error('No se pudo renombrar el proyecto');
      }

      toast({
        title: 'Proyecto renombrado',
        description: 'El proyecto se renombro correctamente.',
      });
    } catch (error: unknown) {
      const { message } = getErrorDetails(error);

      toast({
        title: 'Error',
        description: `No se pudo renombrar el proyecto: ${message}`,
        variant: 'destructive',
      });
    }
  };

  const openEditProject = (projectId: string) => {
    const project = projectsState.projects.find((currentProject) => currentProject.id === projectId);
    if (!project) return;

    setEditingProject(project);
    setViewingProject(null);
  };

  const openViewProject = (projectId: string) => {
    const project = projectsState.projects.find((currentProject) => currentProject.id === projectId);
    if (!project) return;

    setViewingProject(project);
    setEditingProject(null);
  };

  const openEditProjectDetails = (project: Project) => {
    setEditingProject(project);
    setViewingProject(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const closeDetails = () => {
    setViewingProject(null);
  };

  return {
    user,
    ...projectsState,
    stats,
    showForm,
    editingProject,
    viewingProject,
    formLoading,
    showConfirmDelete,
    projectToDelete,
    openCreateForm: () => setShowForm(true),
    handleCreateProject,
    handleUpdateProject,
    openDeleteConfirmation,
    confirmDelete,
    cancelDelete,
    openCollaborate,
    updateDevelopmentImage,
    duplicateProject,
    renameProject,
    openEditProject,
    openViewProject,
    openEditProjectDetails,
    closeForm,
    closeDetails,
  };
}
