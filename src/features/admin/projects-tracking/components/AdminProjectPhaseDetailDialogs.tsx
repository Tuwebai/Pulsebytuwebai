import { AdminProjectPhaseDialog } from '@/features/admin/projects-tracking/components/AdminProjectPhaseDialog';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingProject,
  AdminProjectTrackingTask,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDetailDialogsProps {
  phase: AdminProjectTrackingPhase;
  project: AdminProjectTrackingProject;
  savingPhase: boolean;
  savingTask: boolean;
  showCreateTaskDialog: boolean;
  showEditDialog: boolean;
  taskDraft: AdminProjectTrackingTask | null;
  onClosePhaseDialog: () => void;
  onCloseTaskDialog: () => void;
  onSubmitPhase: Parameters<typeof AdminProjectPhaseDialog>[0]['onSubmit'];
  onSubmitTask: Parameters<typeof AdminProjectTaskDialog>[0]['onSubmit'];
}

export function AdminProjectPhaseDetailDialogs({
  phase,
  project,
  savingPhase,
  savingTask,
  showCreateTaskDialog,
  showEditDialog,
  taskDraft,
  onClosePhaseDialog,
  onCloseTaskDialog,
  onSubmitPhase,
  onSubmitTask,
}: AdminProjectPhaseDetailDialogsProps) {
  return (
    <>
      <AdminProjectPhaseDialog
        open={showEditDialog}
        saving={savingPhase}
        phase={phase}
        onClose={onClosePhaseDialog}
        onSubmit={onSubmitPhase}
      />
      <AdminProjectTaskDialog
        open={showCreateTaskDialog || taskDraft !== null}
        saving={savingTask}
        task={taskDraft}
        phases={project.phases}
        fixedPhaseKey={phase.key}
        onClose={onCloseTaskDialog}
        onSubmit={onSubmitTask}
      />
    </>
  );
}
