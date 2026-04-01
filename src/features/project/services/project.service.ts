import { getProjectById, getProjects, getProjectsByUser } from '@/features/project/services/projectQueries.service';
import { createProject, updateProject } from '@/features/project/services/projectMutations.service';
import { deleteProject } from '@/features/project/services/projectDelete.service';
import { validateGitHubUrl, validateProjectData } from '@/features/project/services/projectValidation.service';

export const projectService = {
  getProjects,
  getProjectById,
  getProjectsByUser,
  createProject,
  updateProject,
  deleteProject,
  validateGitHubUrl,
  validateProjectData,
};
