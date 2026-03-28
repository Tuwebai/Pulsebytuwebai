import { useEffect, useState } from 'react';
import { FolderOpen, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Project, CreateProjectData, UpdateProjectData } from '@/types/project.types';

import { AdminProjectFormFields } from '@/features/admin/projects/components/AdminProjectFormFields';

interface AdminProjectFormDialogProps {
  project?: Project | null;
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
}

const EMPTY_FORM: CreateProjectData = {
  name: '',
  description: '',
  technologies: [],
  environment_variables: {},
  status: 'development',
  github_repository_url: '',
  customicon: 'FolderOpen',
};

export function AdminProjectFormDialog({
  project,
  open,
  loading = false,
  onCancel,
  onSubmit,
}: AdminProjectFormDialogProps) {
  const [formData, setFormData] = useState<CreateProjectData>(EMPTY_FORM);
  const [technologyDraft, setTechnologyDraft] = useState('');

  useEffect(() => {
    if (!open) return;

    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        technologies: project.technologies || [],
        environment_variables: project.environment_variables || {},
        status: project.status,
        github_repository_url: project.github_repository_url || '',
        customicon: project.customicon || 'FolderOpen',
        screenshot_url: project.screenshot_url,
      });
      return;
    }

    setFormData(EMPTY_FORM);
    setTechnologyDraft('');
  }, [open, project]);

  if (!open) return null;

  const handleChange = <K extends keyof CreateProjectData>(field: K, value: CreateProjectData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAddTechnology = () => {
    const value = technologyDraft.trim();
    if (!value || formData.technologies.includes(value)) return;

    setFormData((current) => ({
      ...current,
      technologies: [...current.technologies, value],
    }));
    setTechnologyDraft('');
  };

  const handleRemoveTechnology = (technology: string) => {
    setFormData((current) => ({
      ...current,
      technologies: current.technologies.filter((item) => item !== technology),
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[var(--bg-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-signal/20 bg-signal/10 text-signal">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {project ? 'Editar proyecto' : 'Nuevo proyecto'}
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Cargá solo la base operativa necesaria para seguir el proyecto desde Pulse Admin.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 rounded-full p-0 text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              Carga inicial
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              El detalle técnico profundo, archivos y evolución interna quedan fuera de este alta inicial.
            </p>
          </div>

          <AdminProjectFormFields
            formData={formData}
            technologyDraft={technologyDraft}
            onChange={handleChange}
            onTechnologyDraftChange={setTechnologyDraft}
            onAddTechnology={handleAddTechnology}
            onRemoveTechnology={handleRemoveTechnology}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:bg-white/[0.06]"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {project ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </div>
      </div>
    </div>
  );
}
