import { Activity, CheckCircle2, FolderKanban } from 'lucide-react';
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
  detail,
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  detail: string;
  icon: typeof Activity;
  iconClassName: string;
  label: string;
  value: string | number;
}) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-100">{label}</p>
      <p className="mt-1 font-data text-[clamp(2.2rem,3vw,2.8rem)] font-light leading-none tracking-tight text-slate-50">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

export default function ProjectStatsRow({ projects, loading = false }: ProjectStatsRowProps) {
  const primaryProject = projects[0] ?? null;
  const pendingTasks = primaryProject ? getProjectClientPendingTasks(primaryProject) : [];
  const stateVariant = primaryProject ? getProjectStateVariant(primaryProject) : 'default';

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-[142px] rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 shadow-[0_14px_30px_rgba(2,6,23,0.22)]"
            key={`project-stat-${index}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        detail="avance general de tu entrega"
        icon={Activity}
        iconClassName="bg-signal/15 text-signal"
        label="Progreso del proyecto"
        value={`${primaryProject ? getProjectProgress(primaryProject) : 0}%`}
      />
      <SummaryCard
        detail="estado actual de tu entrega"
        icon={FolderKanban}
        iconClassName={
          stateVariant === 'success'
            ? 'bg-emerald-500/15 text-emerald-300'
            : stateVariant === 'signal'
              ? 'bg-signal/15 text-signal'
              : 'bg-violet-500/15 text-violet-300'
        }
        label="Estado"
        value={primaryProject ? getProjectStateLabel(primaryProject) : 'Sin proyecto'}
      />
      <SummaryCard
        detail={
          pendingTasks.length > 0
            ? 'hay tareas o validaciones que necesitan tu respuesta'
            : 'no hay bloqueos ni pedidos abiertos para vos'
        }
        icon={CheckCircle2}
        iconClassName={pendingTasks.length > 0 ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}
        label="Pendiente de tu parte"
        value={pendingTasks.length > 0 ? pendingTasks.length : 'Al día'}
      />
    </div>
  );
}
