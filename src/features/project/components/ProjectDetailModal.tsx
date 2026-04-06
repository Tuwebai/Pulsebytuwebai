import { FolderOpen, MessageCircle, X } from 'lucide-react';

import { Button } from '@/core/ui/button';
import Badge from '@/core/components/Badge';

import ProjectDetailDialogShell from './ProjectDetailDialogShell';
import ProjectDetailField from './ProjectDetailField';
import ProjectDetailProgressField from './ProjectDetailProgressField';
import ProjectDetailTasksBanner from './ProjectDetailTasksBanner';
import {
  getProjectBusinessSummary,
  getProjectClientActionDetail,
  getProjectClientActionTitle,
  getProjectNextStepTitle,
} from './projectDetail.business';
import type { ProjectDetailProject } from './projectDetail.types';
import {
  buildWhatsAppContactUrl,
  getClientPendingTasks,
  getProjectProgress,
  getProjectStateLabel,
  getProjectStateVariant,
  getRelativeDateLabel,
} from './projectDetail.utils';

interface ProjectDetailModalProps {
  project: ProjectDetailProject;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const progress = getProjectProgress(project);
  const clientPendingTasks = getClientPendingTasks(project);
  const relativeUpdate = getRelativeDateLabel(project.updated_at);
  const stateLabel = getProjectStateLabel(project);
  const stateVariant = getProjectStateVariant(project);
  const contactUrl = buildWhatsAppContactUrl(
    `Hola equipo de TuWebAI, necesito ayuda con mi proyecto "${project.name}".`,
  );

  const handleOpenContact = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.open(contactUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <ProjectDetailDialogShell
      description={getProjectBusinessSummary(project)}
      footer={
        <>
          <Button onClick={onClose} type="button" variant="outline">
            Cerrar
          </Button>
          <Button className="bg-signal text-white hover:bg-[var(--signal-dim)]" onClick={handleOpenContact} type="button">
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            Hablar con el equipo
          </Button>
        </>
      }
      icon={FolderOpen}
      onOpenChange={(open) => !open && onClose()}
      open
      title={project.name}
    >
      <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[var(--cliente-bg-elevated)] px-4 py-3 shadow-[var(--cliente-shadow-card)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge dot size="md" variant={stateVariant}>
            {stateLabel}
          </Badge>
          <Badge size="md" variant="default">
            {clientPendingTasks.length > 0
              ? `${clientPendingTasks.length} pendiente${clientPendingTasks.length > 1 ? 's' : ''}`
              : 'Sin pendientes'}
          </Badge>
        </div>
        <button
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[var(--cliente-bg-surface)] text-slate-300 transition-colors duration-150 hover:border-white/15 hover:text-white"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      <ProjectDetailProgressField progress={progress} />

      <section className="grid gap-4 md:grid-cols-2">
        <ProjectDetailField
          description="Cómo viene hoy el trabajo del equipo."
          label="Estado del proyecto"
          value={stateLabel}
        />
        <ProjectDetailField
          description="Lo próximo que vas a ver reflejado en esta pantalla."
          label="Próximo paso"
          value={getProjectNextStepTitle(project)}
        />
        <ProjectDetailField
          description={getProjectClientActionDetail(project)}
          label="Tu parte"
          value={getProjectClientActionTitle(project)}
        />
        <ProjectDetailField
          description="Última novedad visible para vos dentro del proyecto."
          label="Última actualización"
          value={relativeUpdate ?? 'Todavía no tenemos una actualización reciente para mostrarte.'}
        />
      </section>

      {clientPendingTasks.length > 0 ? <ProjectDetailTasksBanner tasks={clientPendingTasks} /> : null}
    </ProjectDetailDialogShell>
  );
}
