import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import type { AdminProjectCriticalTaskItem } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import type {
  AdminProjectTrackingProject,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectCriticalTaskDetailDialogsProps {
  item: AdminProjectCriticalTaskItem;
  open: boolean;
  project: AdminProjectTrackingProject;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: AdminProjectTrackingTaskInput, currentTaskKey?: string) => Promise<void>;
}

export function AdminProjectCriticalTaskDetailDialogs({
  item,
  open,
  project,
  saving,
  onClose,
  onSubmit,
}: AdminProjectCriticalTaskDetailDialogsProps) {
  return (
    <AdminProjectTaskDialog
      open={open}
      saving={saving}
      task={item.task}
      phases={project.phases}
      fixedPhaseKey={item.task.source.phaseKey}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
