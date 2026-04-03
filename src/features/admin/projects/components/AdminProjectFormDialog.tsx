import { useEffect, useState } from 'react';
import { FolderOpen, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { CreateProjectData, Project, UpdateProjectData } from '@/types/project.types';

import { AdminProjectDialogShell } from '@/features/admin/projects/components/AdminProjectDialogShell';
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
    if (!open) {
      return;
    }

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

  const handleChange = <K extends keyof CreateProjectData>(
    field: K,
    value: CreateProjectData[K],
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAddTechnology = () => {
    const value = technologyDraft.trim();
    if (!value || formData.technologies.includes(value)) {
      return;
    }

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

  return (
    <AdminProjectDialogShell
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onCancel()}
      kicker="Pulse admin · proyectos"
      title={project ? 'Editar proyecto' : 'Nuevo proyecto'}
      description="Cargá solo la base operativa necesaria para seguir el proyecto desde Pulse Admin."
      icon={FolderOpen}
      ariaDescribedBy="project-form-description"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
            onClick={() => void onSubmit(formData)}
            disabled={loading || !formData.name.trim()}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {project ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          El detalle técnico profundo y el trabajo interno siguen fuera de este alta inicial.
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
    </AdminProjectDialogShell>
  );
}
