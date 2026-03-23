import { Activity, CheckSquare, FolderKanban } from 'lucide-react';
import MetricCard from '@/core/components/MetricCard';
import type { ProjectsPageProject } from './projectPage.types';
import { getProjectsAverageProgress, getProjectsSummaryStatus, getProjectsTaskStats } from './projectPage.utils';

interface ProjectStatsRowProps {
  projects: ProjectsPageProject[];
  loading?: boolean;
}

function StatIcon({
  color,
  children
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pointer-events-none absolute right-5 top-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)] ${color}`}>
        {children}
      </div>
    </div>
  );
}

export default function ProjectStatsRow({ projects, loading = false }: ProjectStatsRowProps) {
  const averageProgress = getProjectsAverageProgress(projects);
  const taskStats = getProjectsTaskStats(projects);
  const summaryStatus = getProjectsSummaryStatus(projects);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Progreso"
          loading={loading}
          period={projects.length ? `${projects.length} proyecto${projects.length === 1 ? '' : 's'}` : 'sin proyectos'}
          value={averageProgress}
          unit="%"
        />
        <StatIcon color="text-[var(--signal)]">
          <Activity size={18} strokeWidth={1.5} />
        </StatIcon>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Tareas completadas"
          loading={loading}
          period={taskStats.total > 0 ? `${taskStats.total} tareas registradas` : 'sin tareas registradas'}
          value={taskStats.completed}
        />
        <StatIcon color="text-[var(--success)]">
          <CheckSquare size={18} strokeWidth={1.5} />
        </StatIcon>
      </div>

      <div className="relative">
        <MetricCard
          className="pr-16"
          label="Estado"
          loading={loading}
          period={projects.length ? 'estado general actual' : 'sin proyectos'}
          value={summaryStatus}
        />
        <StatIcon color="text-[var(--text-secondary)]">
          <FolderKanban size={18} strokeWidth={1.5} />
        </StatIcon>
      </div>
    </div>
  );
}
