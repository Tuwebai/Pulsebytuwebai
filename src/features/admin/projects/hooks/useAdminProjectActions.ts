import { toast } from '@/core/notifications/hooks/useToast';
import type { CreateProjectData, UpdateProjectData } from '@/types/project.types';


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

  return {
    createManagedProject,
    updateManagedProject,
  };
}
