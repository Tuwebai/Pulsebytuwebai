import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

import { AdminProjectTaskDialogMetaFields } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialogMetaFields';
import { AdminProjectTaskDialogOverviewFields } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialogOverviewFields';

interface AdminProjectTaskDialogFieldsProps {
  form: AdminProjectTrackingTaskInput;
  phases: AdminProjectTrackingPhase[];
  fixedPhaseKey?: string;
  onChange: <K extends keyof AdminProjectTrackingTaskInput>(
    field: K,
    value: AdminProjectTrackingTaskInput[K],
  ) => void;
}

const taskStatuses = ['Pendiente', 'En Progreso', 'Bloqueada', 'Terminada'] as const;
const taskPriorities = ['alta', 'media', 'baja'] as const;

export function AdminProjectTaskDialogFields({
  form,
  phases,
  fixedPhaseKey,
  onChange,
}: AdminProjectTaskDialogFieldsProps) {
  return (
    <>
      <AdminProjectTaskDialogOverviewFields form={form} onChange={onChange} />
      <AdminProjectTaskDialogMetaFields
        form={form}
        phases={phases}
        fixedPhaseKey={fixedPhaseKey}
        statuses={taskStatuses}
        priorities={taskPriorities}
        onChange={onChange}
      />
    </>
  );
}
