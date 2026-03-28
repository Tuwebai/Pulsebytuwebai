import { toast } from '@/components/ui/use-toast';
import { StorageService } from '@/lib/storageService';
import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project.types';

import { getErrorDetails } from '@/features/admin/projects/hooks/adminProjectsScreen.utils';

interface ProjectActionsDependencies {
  userId: string | null;
  userRole: string | null;
  createProject: (data: CreateProjectData) => Promise<unknown>;
  updateProject: (projectId: string, data: UpdateProjectData) => Promise<unknown>;
}

export function useAdminProjectActions({
  userId,
  userRole,
  createProject,
  updateProject,
}: ProjectActionsDependencies) {
  const createManagedProject = async (data: CreateProjectData) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Usuario no autenticado',
        variant: 'destructive',
      });
      return false;
    }

    const projectDataWithCreator: CreateProjectData & { created_by: string; user_role: string } = {
      ...data,
      created_by: userId,
      user_role: userRole ?? 'user',
    };

    await createProject(projectDataWithCreator);
    return true;
  };

  const updateManagedProject = async (projectId: string, data: UpdateProjectData) => {
    await updateProject(projectId, data);
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

      const uploadResult = await StorageService.uploadImage(imageFile, projectId, userId || '');

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Error al subir la imagen');
      }

      const result = await updateProject(projectId, { screenshot_url: uploadResult.url });
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

      await createProject(duplicateData);

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
      const result = await updateProject(projectId, { name: newName });
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

  return {
    createManagedProject,
    updateManagedProject,
    updateDevelopmentImage,
    duplicateProject,
    renameProject,
  };
}
