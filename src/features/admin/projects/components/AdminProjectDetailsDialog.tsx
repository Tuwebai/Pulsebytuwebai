import { ProjectDetails } from '@/components/admin/ProjectDetails';
import type { Project } from '@/types/project.types';

interface AdminProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

export function AdminProjectDetailsDialog({
  project,
  open,
  onClose,
  onEdit,
}: AdminProjectDetailsDialogProps) {
  if (!open || !project) return null;

  return <ProjectDetails project={project} onEdit={onEdit} onClose={onClose} />;
}
