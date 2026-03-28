import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project.types';

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

      <ConfirmationDialog
        isOpen={showConfirmDelete}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
        title="Confirmar eliminacion"
        description={`Estas seguro de que quieres eliminar el proyecto "${projectToDelete?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={false}
      />
    </>
  );
}
