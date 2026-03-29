import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-tour="project-header">
      <div>
        <h1 className="text-[22px] font-medium text-[var(--text-primary)]">
          {isClientUserView ? `Proyecto de ${targetUserName || 'cliente'}` : 'Mi Proyecto'}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {isClientUserView
            ? 'Seguimiento del proyecto asignado a este cliente'
            : 'Seguí el estado y el progreso de tu entrega.'}
        </p>
      </div>

      {isClientUserView ? (
        <Button
          className="h-10 rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Volver
        </Button>
      ) : null}
    </section>
  );
}
