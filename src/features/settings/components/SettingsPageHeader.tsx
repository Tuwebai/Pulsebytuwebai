import { FileText, Settings } from 'lucide-react';
import AccentIcon from '@/core/components/AccentIcon';

interface SettingsPageHeaderProps {
  projectsCount: number;
}

export function SettingsPageHeader({ projectsCount }: SettingsPageHeaderProps) {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <AccentIcon size="md" tone="signal">
            <Settings className="h-5 w-5" />
          </AccentIcon>
          <div className="space-y-2">
            <div>
              <h1 className="text-[24px] font-medium text-[var(--text-primary)]">Configuración</h1>
              <p className="mt-1 max-w-2xl text-[13px] text-[var(--text-secondary)]">
                Revisá tu cuenta, experiencia, notificaciones y seguridad dentro de Pulse.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)]">
              <FileText className="h-3.5 w-3.5 text-[var(--signal)]" />
              <span>
                Proyectos asociados: <span className="text-[var(--text-primary)]">{projectsCount}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
