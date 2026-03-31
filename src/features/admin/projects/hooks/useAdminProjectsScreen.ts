import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApp } from '@/contexts/AppContext';
import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project.types';

import { getAdminProjectStats } from '@/features/admin/projects/hooks/adminProjectsScreen.utils';
import { useAdminProjectActions } from '@/features/admin/projects/hooks/useAdminProjectActions';
import { useAdminProjectsData } from '@/features/admin/projects/hooks/useAdminProjectsData';

export function useAdminProjectsScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  const projectsState = useAdminProjectsData();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const actions = useAdminProjectActions({
    userId: user?.id ?? null,
    userRole: user?.role ?? null,
    createProject: projectsState.createProject,
    updateProject: projectsState.updateProject,
  });

  const handleCreateProject = async (data: CreateProjectData) => {
    setFormLoading(true);
    try {
      const created = await actions.createManagedProject(data);
      if (created) {
        setShowForm(false);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProject = async (data: UpdateProjectData) => {
    if (!editingProject) return;

    setFormLoading(true);
    try {
      await actions.updateManagedProject(editingProject.id, data);
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

  return {
    user,
    ...projectsState,
    stats: getAdminProjectStats(projectsState.projects),
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
    cancelDelete: () => {
      setShowConfirmDelete(false);
      setProjectToDelete(null);
    },
    openTrackingProject: (projectId: string) => {
      navigate(`/admin/proyectos/${projectId}/seguimiento`);
    },
    openEditProject,
    openViewProject,
    openEditProjectDetails: (project: Project) => {
      setEditingProject(project);
      setViewingProject(null);
    },
    closeForm: () => {
      setShowForm(false);
      setEditingProject(null);
    },
    closeDetails: () => {
      setViewingProject(null);
    },
  };
}
