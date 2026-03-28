import { FolderOpen, PencilLine, X } from 'lucide-react';

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

  const approvalLabel = getApprovalLabel(project.approval_status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-[var(--bg-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-signal/20 bg-signal/10 text-signal">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{project.name}</h2>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getProjectStatusClasses(project.status)}`}>
                    {getProjectStatusLabel(project.status)}
                  </span>
                  {approvalLabel && (
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getApprovalClasses(project.approval_status)}`}>
                      {approvalLabel}
                    </span>
                  )}
                </div>
                <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                  {project.description || 'Sin descripción operativa cargada para este proyecto.'}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Última actualización operativa: {formatOperationalDate(project.updated_at)}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 rounded-full p-0 text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <AdminProjectDetailsSummary project={project} />
          <AdminProjectDetailsPhases project={project} />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:bg-white/[0.06]"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
            onClick={() => onEdit(project)}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Editar proyecto
          </Button>
        </div>
      </div>
    </div>
  );
}
