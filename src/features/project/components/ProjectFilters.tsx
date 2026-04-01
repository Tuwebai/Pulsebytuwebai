import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/usePerformance';
import ProjectFilterActions from './ProjectFilterActions';
import type { ProjectsPageProject } from './projectPage.types';
import { getProjectProgress, getProjectStateLabel } from './projectPage.utils';

interface ProjectFiltersProps {
  projects: ProjectsPageProject[];
  onFilteredProjects: (projects: ProjectsPageProject[]) => void;
  onRefresh?: () => void;
}

type SortByOption = 'updated_at' | 'name' | 'progress';

const statusOptions = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'En desarrollo', value: 'development' },
  { label: 'Entregado', value: 'production' },
  { label: 'Mantenimiento', value: 'maintenance' },
  { label: 'Pausado', value: 'paused' },
] as const;

const sortOptions = [
  { label: 'Última actualización', value: 'updated_at' },
  { label: 'Nombre', value: 'name' },
  { label: 'Progreso', value: 'progress' },
] as const satisfies ReadonlyArray<{ label: string; value: SortByOption }>;

export default function ProjectFilters({ projects, onFilteredProjects, onRefresh }: ProjectFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortByOption>('updated_at');
  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

    const result = projects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        project.name.toLowerCase().includes(normalizedSearch) ||
        (project.description ?? '').toLowerCase().includes(normalizedSearch) ||
        getProjectStateLabel(project).toLowerCase().includes(normalizedSearch);

      const matchesStatus = status === 'all' || project.status === status;
      return matchesSearch && matchesStatus;
    });

    result.sort((leftProject, rightProject) => {
      switch (sortBy) {
        case 'name':
          return leftProject.name.localeCompare(rightProject.name, 'es');
        case 'progress':
          return getProjectProgress(rightProject) - getProjectProgress(leftProject);
        case 'updated_at':
        default:
          return new Date(rightProject.updated_at).getTime() - new Date(leftProject.updated_at).getTime();
      }
    });

    return result;
  }, [debouncedSearchTerm, projects, sortBy, status]);

  useEffect(() => {
    onFilteredProjects(filteredProjects);
  }, [filteredProjects, onFilteredProjects]);

  const hasFilters = searchTerm.trim().length > 0 || status !== 'all' || sortBy !== 'updated_at';

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/90 p-5 shadow-[0_16px_36px_rgba(2,6,23,0.22)]">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Vista de trabajo</p>
        <p className="mt-2 text-sm text-slate-100">Filtrá rápido el proyecto que necesitás revisar.</p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1.5fr)_220px_220px]">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Buscar</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.5} />
              <Input
                ariaLabel="Buscar proyectos"
                className="h-11 rounded-xl border-white/10 bg-[var(--bg-base)] pl-10 text-slate-100 placeholder:text-slate-500"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nombre, descripción o estado"
                value={searchTerm}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Estado</label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger ariaLabel="Filtrar por estado" className="h-11 rounded-xl border-white/10 bg-[var(--bg-base)] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[var(--bg-surface)] text-slate-100">
                {statusOptions.map((option) => (
                  <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-slate-100" key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Orden</label>
            <Select onValueChange={(value) => setSortBy(value as SortByOption)} value={sortBy}>
              <SelectTrigger ariaLabel="Ordenar proyectos" className="h-11 rounded-xl border-white/10 bg-[var(--bg-base)] text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[var(--bg-surface)] text-slate-100">
                {sortOptions.map((option) => (
                  <SelectItem className="focus:bg-[var(--bg-elevated)] focus:text-slate-100" key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ProjectFilterActions
          hasFilters={hasFilters}
          onRefresh={onRefresh}
          onReset={() => {
            setSearchTerm('');
            setStatus('all');
            setSortBy('updated_at');
          }}
        />
      </div>
    </section>
  );
}
