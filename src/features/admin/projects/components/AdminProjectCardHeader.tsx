import { FolderOpen, Layers3 } from 'lucide-react';

import type { Project } from '@/types/project.types';

import {
  getApprovalClasses,
  getApprovalLabel,
  getProjectStatusClasses,
  getProjectStatusLabel,
} from '@/features/admin/projects/components/adminProjectCard.utils';

interface AdminProjectCardHeaderProps {
  project: Project;
}

export function AdminProjectCardHeader({ project }: AdminProjectCardHeaderProps) {
  const approvalLabel = getApprovalLabel(project.approval_status);

  return (
    <header className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
          <FolderOpen className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg">
              {project.name}
            </h3>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
              {project.type || 'Proyecto web'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getProjectStatusClasses(project.status)}`}
            >
              {getProjectStatusLabel(project.status)}
            </span>

            {approvalLabel && (
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getApprovalClasses(project.approval_status)}`}
              >
                {approvalLabel}
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
              <Layers3 className="h-3 w-3" />
              {project.fases?.length ?? 0} fases
            </span>
          </div>
        </div>
      </div>

      <p className="line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
        {project.description || 'Sin descripcion operativa cargada para este proyecto.'}
      </p>
    </header>
  );
}
