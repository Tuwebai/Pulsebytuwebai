import { FolderOpen, PencilLine } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project.types';

import {
  formatOperationalDate,
  getApprovalClasses,
  getApprovalLabel,
  getProjectStatusClasses,
  getProjectStatusLabel,
} from '@/features/admin/projects/components/adminProjectCard.utils';
import { AdminProjectDetailsPhases } from '@/features/admin/projects/components/AdminProjectDetailsPhases';
import { AdminProjectDetailsSummary } from '@/features/admin/projects/components/AdminProjectDetailsSummary';
import { AdminProjectDialogShell } from '@/features/admin/projects/components/AdminProjectDialogShell';

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
  if (!project) {
    return null;
  }

  const approvalLabel = getApprovalLabel(project.approval_status);

  return (
    <AdminProjectDialogShell
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      kicker="Pulse admin · proyectos"
      title={project.name}
      description={project.description || 'Sin descripción operativa cargada para este proyecto.'}
      icon={FolderOpen}
      maxWidthClassName="sm:max-w-4xl"
      ariaDescribedBy="project-details-description"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:bg-white/[0.06]"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            className="bg-sky-500 text-slate-950 hover:bg-sky-400"
            onClick={() => onEdit(project)}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Editar proyecto
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={getProjectStatusClasses(project.status)}>
          {getProjectStatusLabel(project.status)}
        </Badge>
        {approvalLabel ? (
          <Badge variant="outline" className={getApprovalClasses(project.approval_status)}>
            {approvalLabel}
          </Badge>
        ) : null}
        <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-slate-300">
          Último movimiento: {formatOperationalDate(project.updated_at)}
        </Badge>
      </div>

      <AdminProjectDetailsSummary project={project} />
      <AdminProjectDetailsPhases project={project} />
    </AdminProjectDialogShell>
  );
}
