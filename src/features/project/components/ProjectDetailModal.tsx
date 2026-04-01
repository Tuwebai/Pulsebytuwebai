import { ExternalLink, MessageCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import Badge from '@/core/components/Badge';

import type { ProjectDetailProject } from './projectDetail.types';
import ProjectDetailTasksBanner from './ProjectDetailTasksBanner';
import {
  buildWhatsAppContactUrl,
  getClientPendingTasks,
  getCurrentPhase,
  getPhaseDisplayName,
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
  const currentPhase = getCurrentPhase(project);
  const clientPendingTasks = getClientPendingTasks(project);
  const relativeUpdate = getRelativeDateLabel(project.updated_at);
  const phaseDisplayName = getPhaseDisplayName(currentPhase);
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
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent
        className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-0 shadow-[var(--shadow-elevated)] sm:p-0"
        hideCloseButton
      >
        <DialogTitle className="sr-only">{project.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Estado, progreso y próximos pasos de tu proyecto.
        </DialogDescription>

        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Mi Proyecto</p>
            <h2 className="mt-2 truncate text-[24px] font-medium text-[var(--text-primary)]">{project.name}</h2>
          </div>

          <div className="flex items-center gap-3">
            <Badge dot size="md" variant={stateVariant}>
              {stateLabel}
            </Badge>
            <button
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <section className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Progreso</p>
                <p className="mt-2 font-data text-[28px] font-light text-[var(--text-primary)]">{progress}%</p>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{progress}% completado</p>
            </div>
            <div className="mt-4 h-1 rounded-full bg-[var(--bg-subtle)]">
              <div
                className="h-1 rounded-full bg-[var(--signal)] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          {phaseDisplayName ? (
            <section className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Fase actual</p>
              <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
                El equipo está trabajando en: <span className="text-[var(--text-primary)]">{phaseDisplayName}</span>
              </p>
            </section>
          ) : null}

          <ProjectDetailTasksBanner tasks={clientPendingTasks} />

          {relativeUpdate ? (
            <p className="text-[12px] text-[var(--text-tertiary)]">Última actualización: {relativeUpdate}</p>
          ) : null}

          <div className="flex justify-start">
            <Button
              className="h-10 rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              onClick={handleOpenContact}
              type="button"
              variant="outline"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              Hablar con el equipo
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
