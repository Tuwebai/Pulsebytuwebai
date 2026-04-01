import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

import ProjectDetailModal from '@/features/project/components/ProjectDetailModal';
import type { ProjectsPageProject } from '@/features/project/components/projectPage.types';
import { toProjectDetailProject } from '@/features/project/components/projectOverview.utils';

interface ProjectOverviewDialogsProps {
  onCancelDelete: () => void;
  onCloseProject: () => void;
  onConfirmDelete: () => void;
  projectName: string;
  selectedProject: ProjectsPageProject | null;
  showDeleteConfirm: boolean;
}

export default function ProjectOverviewDialogs({
  onCancelDelete,
  onCloseProject,
  onConfirmDelete,
  projectName,
  selectedProject,
  showDeleteConfirm,
}: ProjectOverviewDialogsProps) {
  return (
    <>
      {selectedProject ? (
        <ProjectDetailModal onClose={onCloseProject} project={toProjectDetailProject(selectedProject)} />
      ) : null}

      <ConfirmationDialog
        cancelText="Cancelar"
        confirmText="Eliminar"
        description={`¿Estás seguro de que querés eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`}
        isOpen={showDeleteConfirm}
        loading={false}
        onClose={onCancelDelete}
        onConfirm={onConfirmDelete}
        title="Confirmar eliminación"
        variant="destructive"
      />
    </>
  );
}
