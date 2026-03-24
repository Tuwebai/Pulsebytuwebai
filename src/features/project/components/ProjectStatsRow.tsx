import type { ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCircle2, FolderKanban } from 'lucide-react';
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

function AccentIcon({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'signal' | 'success' | 'warning' | 'default';
}) {
  const toneClassMap: Record<typeof tone, string> = {
    signal:
      'border-[color:var(--signal-glow)] bg-[color:color-mix(in srgb,var(--signal) 18%,transparent)] text-[var(--signal)] shadow-[0_0_0_1px_var(--signal-glow),0_8px_24px_color-mix(in_srgb,var(--signal)_18%,transparent)]',
    success:
      'border-[color:var(--success-dim)] bg-[color:color-mix(in srgb,var(--success) 18%,transparent)] text-[var(--success)] shadow-[0_0_0_1px_var(--success-dim),0_8px_24px_color-mix(in_srgb,var(--success)_18%,transparent)]',
    warning:
      'border-[color:var(--warning-dim)] bg-[color:color-mix(in srgb,var(--warning) 18%,transparent)] text-[var(--warning)] shadow-[0_0_0_1px_var(--warning-dim),0_8px_24px_color-mix(in_srgb,var(--warning)_18%,transparent)]',
    default:
      'border-[color:var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-subtle),0_8px_24px_rgba(0,0,0,0.18)]',
  };

  return (
    <div className="pointer-events-none absolute right-5 top-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm ${toneClassMap[tone]}`}
      >
        {children}
      </div>
    </div>
  );
}

function StatusCard({ project, loading }: { project: ProjectsPageProject | null; loading: boolean }) {
  const stateLabel = project ? getProjectStateLabel(project) : 'Sin proyecto';
  const stateVariant = project ? getProjectStateVariant(project) : 'default';

  return (
    <article className="relative min-h-[152px] rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <AccentIcon tone={stateVariant === 'signal' ? 'signal' : stateVariant === 'success' ? 'success' : 'default'}>
        <FolderKanban size={18} strokeWidth={1.6} />
      </AccentIcon>

      <p className="pr-16 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Estado</p>

      <div className="mt-5 pr-16">
        {loading ? (
          <div className="h-10 w-32 rounded bg-[var(--bg-elevated)]" />
        ) : (
          <p className="font-data text-[32px] font-light leading-none text-[var(--text-primary)]">{stateLabel}</p>
        )}
      </div>

      <div className="mt-4 min-h-[24px]">
        {loading ? (
          <div className="h-6 w-24 rounded-full bg-[var(--bg-elevated)]" />
        ) : (
          <Badge dot size="sm" variant={stateVariant}>
            {project ? 'Estado actual' : 'Sin configuracion'}
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
    <article className="relative min-h-[152px] rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <AccentIcon tone={hasPendingTasks ? 'warning' : 'success'}>
        {hasPendingTasks ? (
          <AlertTriangle size={18} strokeWidth={1.6} />
        ) : (
          <CheckCircle2 size={18} strokeWidth={1.6} />
        )}
      </AccentIcon>

      <p className="pr-16 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
        Pendiente de tu parte
      </p>

      <div className="mt-5 pr-16">
        {loading ? (
          <div className="h-10 w-20 rounded bg-[var(--bg-elevated)]" />
        ) : hasPendingTasks ? (
          <p className="font-data text-[40px] font-light leading-none text-[var(--text-primary)]">{pendingTasks.length}</p>
        ) : (
          <p className="font-data text-[32px] font-light leading-none text-[var(--text-primary)]">Al dia</p>
        )}
      </div>

      <div className="mt-4 min-h-[24px]">
        {loading ? (
          <div className="h-6 w-28 rounded-full bg-[var(--bg-elevated)]" />
        ) : (
          <Badge size="sm" variant={hasPendingTasks ? 'warning' : 'success'}>
            {hasPendingTasks ? 'Revision pendiente' : 'Al dia'}
          </Badge>
        )}
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
        <AccentIcon tone="signal">
          <Activity size={18} strokeWidth={1.6} />
        </AccentIcon>
      </div>

      <StatusCard loading={loading} project={primaryProject} />

      <ClientPendingCard loading={loading} project={primaryProject} />
    </div>
  );
}
