import { useState } from 'react';
import { AlertCircle, ArrowLeft, SquarePen } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AdminProjectCriticalTaskDetailSummary } from '@/features/admin/projects-tracking/components/AdminProjectCriticalTaskDetailSummary';
import { AdminProjectTaskDialog } from '@/features/admin/projects-tracking/components/AdminProjectTaskDialog';
import { getAdminProjectCriticalTaskByKey } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';
import { AdminProjectTrackingHeader } from '@/features/admin/projects-tracking/components/AdminProjectTrackingHeader';
import { useAdminProjectTracking } from '@/features/admin/projects-tracking/hooks/useAdminProjectTracking';

interface AdminProjectCriticalTaskDetailScreenProps {
  projectId: string | undefined;
  taskKey: string | undefined;
  onBackToTasks: () => void;
  backLabel: string;
  onEditProject: () => void;
}

export function AdminProjectCriticalTaskDetailScreen({
  projectId,
  taskKey,
  onBackToTasks,
  backLabel,
  onEditProject,
}: AdminProjectCriticalTaskDetailScreenProps) {
  const { loading, savingTask, error, project, refresh, saveTask } = useAdminProjectTracking(projectId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const item = project && taskKey ? getAdminProjectCriticalTaskByKey(project, taskKey) : null;

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando detalle de la tarea crítica...</span>
        </div>
      </div>
    );
  }

  if (error || !project || !item) {
    return (
      <section className="rounded-[24px] border border-danger/20 bg-danger/10 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No pudimos abrir esta tarea crítica</p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {error ?? 'La tarea no existe o ya no requiere atención prioritaria.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="text-sm font-medium text-signal" onClick={() => void refresh()}>
                Reintentar carga
              </button>
              <button className="text-sm font-medium text-[var(--text-secondary)]" onClick={onBackToTasks}>
                {backLabel}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { task, reason } = item;

  const handleSubmitTask = async (input: Parameters<typeof saveTask>[0], currentTaskKey?: string) => {
    const success = await saveTask(
      {
        ...input,
        phaseKey: task.source.phaseKey,
      },
      currentTaskKey,
    );
    if (success) {
      setShowEditDialog(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <AdminProjectTrackingHeader project={project} onEditProject={onEditProject} />

        <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                onClick={onBackToTasks}
                className="mb-2 h-auto px-0 text-[var(--text-secondary)] hover:bg-transparent hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Button>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                {task.phaseLabel ?? 'Tarea crítica'}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{task.title}</h1>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {task.description ?? 'Esta tarea quedó marcada como prioritaria por Pulse para seguimiento operativo.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <span className="rounded-full border border-rose-400/20 bg-rose-500/12 px-4 py-2 text-sm font-medium text-rose-300">
                {reason}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(true)}
                className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/15 hover:bg-white/[0.06]"
              >
                <SquarePen className="mr-2 h-4 w-4" />
                Editar tarea
              </Button>
            </div>
          </div>
        </section>

        <AdminProjectCriticalTaskDetailSummary item={item} />
      </div>

      <AdminProjectTaskDialog
        open={showEditDialog}
        saving={savingTask}
        task={task}
        phases={project.phases}
        fixedPhaseKey={task.source.phaseKey}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleSubmitTask}
      />
    </>
  );
}
