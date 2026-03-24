import type { ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Badge from '@/core/components/Badge';
import MetricCard from '@/core/components/MetricCard';
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

function StatIcon({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <div className="pointer-events-none absolute right-5 top-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] ${color}`}>
        {children}
      </div>
    </div>
  );
}

function StatusCard({ project, loading }: { project: ProjectsPageProject | null; loading: boolean }) {
  return (
    <article className="min-h-[152px] rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Estado</p>

      <div className="mt-6 flex min-h-[72px] items-center justify-center">
        {loading ? (
          <div className="h-10 w-28 rounded-full bg-[var(--bg-elevated)]" />
        ) : project ? (
          <Badge dot size="md" variant={getProjectStateVariant(project)}>
            {getProjectStateLabel(project)}
          </Badge>
        ) : (
          <Badge size="md" variant="default">
            Sin proyecto
          </Badge>
        )}
      </div>

      <p className="mt-4 text-[11px] text-[var(--text-tertiary)]">
        {project ? 'estado actual de tu entrega' : 'sin proyecto configurado'}
      </p>
    </article>
  );
}

function ClientPendingCard({ project, loading }: { project: ProjectsPageProject | null; loading: boolean }) {
  const pendingTasks = project ? getProjectClientPendingTasks(project) : [];
  const hasPendingTasks = pendingTasks.length > 0;

  return (
    <article className="min-h-[152px] rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Pendiente de tu parte
          </p>

          <div className="mt-5">
            {loading ? (
              <div className="h-10 w-20 rounded bg-[var(--bg-elevated)]" />
            ) : hasPendingTasks ? (
              <p className="font-data text-[40px] font-light leading-none text-[var(--text-primary)]">
                {pendingTasks.length}
              </p>
            ) : (
              <p className="font-data text-[32px] font-light leading-none text-[var(--text-primary)]">Al dia</p>
            )}
          </div>
        </div>

        {!loading ? (
          <div className="flex items-center gap-2 rounded-full bg-[var(--bg-elevated)] px-3 py-1.5">
            {hasPendingTasks ? (
              <AlertTriangle className="h-4 w-4 text-[var(--warning)]" strokeWidth={1.5} />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" strokeWidth={1.5} />
            )}
            <Badge size="sm" variant={hasPendingTasks ? 'warning' : 'success'}>
              {hasPendingTasks ? 'Revision pendiente' : 'Al dia'}
            </Badge>
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-[11px] text-[var(--text-tertiary)]">
        {hasPendingTasks
          ? 'hay tareas o validaciones que necesitan tu respuesta'
          : 'no hay bloqueos ni pedidos abiertos para vos'}
      </p>
    </article>
  );
}

export default function ProjectStatsRow({ projects, loading = false }: ProjectStatsRowProps) {
  const primaryProject = projects[0] ?? null;
  const primaryProgress = primaryProject ? getProjectProgress(primaryProject) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Progreso del proyecto"
          loading={loading}
          period={primaryProject ? 'avance general de tu entrega' : 'sin proyecto configurado'}
          unit="%"
          value={primaryProgress}
        />
        <StatIcon color="text-[var(--signal)]">
          <Activity size={18} strokeWidth={1.5} />
        </StatIcon>
      </div>

      <StatusCard loading={loading} project={primaryProject} />

      <ClientPendingCard loading={loading} project={primaryProject} />
    </div>
  );
}
