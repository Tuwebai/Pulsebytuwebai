import type { ReactNode } from 'react';
import { Activity, CheckCircle2, FolderKanban } from 'lucide-react';
import { AccentIcon } from '@/core/components';
import type { ProjectsPageProject } from './projectPage.types';
import {
  getProjectClientPendingTasks,
  getProjectProgress,
  getProjectStateLabel,
  getProjectStateVariant,
} from './projectPage.utils';

interface ProjectStatsRowProps {
  projects: ProjectsPageProject[];
  loading?: boolean;
}

function SummaryCard({
  label,
  value,
  footer,
  icon,
  tone,
  loading = false,
}: {
  label: string;
  value: ReactNode;
  footer: ReactNode;
  icon: ReactNode;
  tone: 'signal' | 'success' | 'warning' | 'default';
  loading?: boolean;
}) {
  return (
    <article className="relative flex min-h-[152px] flex-col rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div className="pointer-events-none absolute right-5 top-5">
        <AccentIcon tone={tone}>{icon}</AccentIcon>
      </div>

      <p className="pr-16 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</p>

      <div className="mt-5 flex min-h-[54px] flex-1 items-start pr-16">
        {loading ? <div className="h-10 w-28 rounded bg-[var(--bg-elevated)]" /> : value}
      </div>

      <div className="mt-4 min-h-[28px] text-[12px] leading-5 text-[var(--text-secondary)]">
        {loading ? <div className="h-4 w-32 rounded bg-[var(--bg-elevated)]" /> : footer}
      </div>
    </article>
  );
}

function ProgressCard({ project, loading }: { project: ProjectsPageProject | null; loading: boolean }) {
  const progress = project ? getProjectProgress(project) : 0;

  return (
    <SummaryCard
      footer={project ? 'avance general de tu entrega' : 'sin proyecto configurado'}
      icon={<Activity size={18} strokeWidth={1.6} />}
      label="Progreso del proyecto"
      loading={loading}
      tone="signal"
      value={
        <div className="flex items-baseline gap-3">
          <p className="font-data text-[40px] font-light leading-none text-[var(--text-primary)]">{progress}</p>
          <span className="font-data text-[40px] font-light leading-none text-[var(--text-primary)]">%</span>
        </div>
      }
    />
  );
}

function StatusCard({ project, loading }: { project: ProjectsPageProject | null; loading: boolean }) {
  const stateLabel = project ? getProjectStateLabel(project) : 'Sin proyecto';
  const stateVariant = project ? getProjectStateVariant(project) : 'default';
  const iconTone = stateVariant === 'signal' || stateVariant === 'success' ? stateVariant : 'default';

  return (
    <SummaryCard
      footer={project ? 'estado actual de tu entrega' : 'sin proyecto configurado'}
      icon={<FolderKanban size={18} strokeWidth={1.6} />}
      label="Estado"
      loading={loading}
      tone={iconTone}
      value={
        <p className="line-clamp-2 font-data text-[32px] font-light leading-[1.05] text-[var(--text-primary)]">
          {stateLabel}
        </p>
      }
    />
  );
}

function PendingCard({ project, loading }: { project: ProjectsPageProject | null; loading: boolean }) {
  const pendingTasks = project ? getProjectClientPendingTasks(project) : [];
  const hasPendingTasks = pendingTasks.length > 0;

  return (
    <SummaryCard
      footer={
        hasPendingTasks
          ? 'hay tareas o validaciones que necesitan tu respuesta'
          : 'no hay bloqueos ni pedidos abiertos para vos'
      }
      icon={<CheckCircle2 size={18} strokeWidth={1.6} />}
      label="Pendiente de tu parte"
      loading={loading}
      tone={hasPendingTasks ? 'warning' : 'success'}
      value={
        hasPendingTasks ? (
          <p className="font-data text-[40px] font-light leading-none text-[var(--text-primary)]">{pendingTasks.length}</p>
        ) : (
          <p className="font-data text-[32px] font-light leading-[1.05] text-[var(--text-primary)]">Al dia</p>
        )
      }
    />
  );
}

export default function ProjectStatsRow({ projects, loading = false }: ProjectStatsRowProps) {
  const primaryProject = projects[0] ?? null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ProgressCard loading={loading} project={primaryProject} />
      <StatusCard loading={loading} project={primaryProject} />
      <PendingCard loading={loading} project={primaryProject} />
    </div>
  );
}
