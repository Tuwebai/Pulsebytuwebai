import { ArrowLeft } from 'lucide-react';
import { Button } from '@/core/ui/button';

interface ProjectOverviewHeaderProps {
  isClientUserView: boolean;
  onBack: () => void;
  targetUserName: string;
}

export default function ProjectOverviewHeader({
  isClientUserView,
  onBack,
  targetUserName,
}: ProjectOverviewHeaderProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5" data-tour="project-header">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Proyecto</p>
          <h1 className="mt-2 text-xl font-medium text-slate-50">
            {isClientUserView ? `Proyecto de ${targetUserName || 'cliente'}` : 'Mi Proyecto'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isClientUserView
              ? 'Seguimiento del proyecto asignado a este cliente'
              : 'Seguí el estado, el progreso y lo que necesita tu respuesta.'}
          </p>
        </div>

        {isClientUserView ? (
          <Button
            className="h-10 rounded-full border border-white/10 bg-[var(--bg-base)]/70 px-4 text-slate-200 hover:border-white/15 hover:bg-[var(--bg-elevated)] hover:text-white"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Volver
          </Button>
        ) : null}
      </div>
    </section>
  );
}
