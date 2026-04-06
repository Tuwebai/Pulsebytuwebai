import { Label } from '@/core/ui/label';
import { Input } from '@/core/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/ui/select';
import { Textarea } from '@/core/ui/textarea';
import { ADMIN_PROJECT_STATUS_OPTIONS } from '@/features/admin/projects/components/adminProjectForm.constants';
import { AdminProjectTechnologyField } from '@/features/admin/projects/components/AdminProjectTechnologyField';
import type { CreateProjectData } from '@/types/project.types';

interface AdminProjectFormFieldsProps {
  formData: CreateProjectData;
  technologyDraft: string;
  onChange: <K extends keyof CreateProjectData>(field: K, value: CreateProjectData[K]) => void;
  onTechnologyDraftChange: (value: string) => void;
  onAddTechnology: () => void;
  onRemoveTechnology: (technology: string) => void;
}

export function AdminProjectFormFields({
  formData,
  technologyDraft,
  onChange,
  onTechnologyDraftChange,
  onAddTechnology,
  onRemoveTechnology,
}: AdminProjectFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--text-primary)]">Nombre del proyecto</Label>
          <Input
            value={formData.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Sitio institucional, e-commerce, landing..."
            className="border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[var(--text-primary)]">Estado operativo</Label>
          <Select value={formData.status} onValueChange={(value) => onChange('status', value as CreateProjectData['status'])}>
            <SelectTrigger className="border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              {ADMIN_PROJECT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--text-primary)]">Descripción operativa</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="Contexto, entregable y foco del proyecto."
          className="min-h-[104px] border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--text-primary)]">Repositorio o referencia técnica</Label>
        <Input
          value={formData.github_repository_url || ''}
          onChange={(event) => onChange('github_repository_url', event.target.value)}
          placeholder="https://github.com/tu-equipo/proyecto"
          className="border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-[var(--text-primary)]">Tecnologías</Label>
        <AdminProjectTechnologyField
          value={formData.technologies}
          draft={technologyDraft}
          onDraftChange={onTechnologyDraftChange}
          onAdd={onAddTechnology}
          onRemove={onRemoveTechnology}
        />
      </div>
    </div>
  );
}
