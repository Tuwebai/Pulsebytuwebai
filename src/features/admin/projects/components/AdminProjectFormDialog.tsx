import { ProjectForm } from '@/components/admin/ProjectForm';
import type { Project, CreateProjectData, UpdateProjectData } from '@/types/project.types';

interface AdminProjectFormDialogProps {
  project?: Project | null;
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
}

export function AdminProjectFormDialog({
  project,
  open,
  loading = false,
  onCancel,
  onSubmit,
}: AdminProjectFormDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[var(--bg-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        <ProjectForm project={project || undefined} onSubmit={onSubmit} onCancel={onCancel} loading={loading} />
      </div>
    </div>
  );
}
