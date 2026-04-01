import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project.types';

import { AdminProjectDeleteDialog } from '@/features/admin/projects/components/AdminProjectDeleteDialog';
import { AdminProjectDetailsDialog } from '@/features/admin/projects/components/AdminProjectDetailsDialog';
import { AdminProjectFormDialog } from '@/features/admin/projects/components/AdminProjectFormDialog';

interface AdminProjectsOverlaysProps {
  showForm: boolean;
  editingProject: Project | null;
  viewingProject: Project | null;
  formLoading: boolean;
  showConfirmDelete: boolean;
  projectToDelete: Project | null;
  onCloseForm: () => void;
  onCloseDetails: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onOpenEditFromDetails: (project: Project) => void;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
}

export function AdminProjectsOverlays({
  showForm,
  editingProject,
  viewingProject,
  formLoading,
  showConfirmDelete,
  projectToDelete,
  onCloseForm,
  onCloseDetails,
  onCancelDelete,
  onConfirmDelete,
  onOpenEditFromDetails,
  onSubmit,
}: AdminProjectsOverlaysProps) {
  return (
    <>
      <AdminProjectFormDialog
        project={editingProject}
        open={showForm || Boolean(editingProject)}
        loading={formLoading}
        onCancel={onCloseForm}
        onSubmit={onSubmit}
      />

      <AdminProjectDetailsDialog
        project={viewingProject}
        open={Boolean(viewingProject)}
        onEdit={onOpenEditFromDetails}
        onClose={onCloseDetails}
      />

      <AdminProjectDeleteDialog
        open={showConfirmDelete}
        project={projectToDelete}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
