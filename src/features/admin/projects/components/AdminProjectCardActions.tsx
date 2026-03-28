import { useRef } from 'react';
import { ChevronDown, Copy, Edit3, ExternalLink, ImagePlus, MoreHorizontal, Trash2, Type } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/types/project.types';

interface AdminProjectCardActionsProps {
  project: Project;
  onViewProject: (projectId: string) => void;
  onCollaborate: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onUpdateDevelopmentImage: (projectId: string, imageFile: File) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

export function AdminProjectCardActions({
  project,
  onViewProject,
  onCollaborate,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onUpdateDevelopmentImage,
  onRenameProject,
}: AdminProjectCardActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-signal/20 hover:bg-signal/10 hover:text-signal"
          onClick={() => onViewProject(project.id)}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Ver detalle
        </Button>

        <Button
          variant="outline"
          className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-signal/20 hover:bg-signal/10 hover:text-signal"
          onClick={() => onEditProject(project.id)}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="ghost"
          className="rounded-xl text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
          onClick={() => onCollaborate(project.id)}
        >
          Colaboración
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:border-white/20 hover:bg-white/[0.06]"
            >
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Acciones
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          >
            <DropdownMenuItem onClick={() => onDuplicateProject(project)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar proyecto
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const newName = window.prompt('Nuevo nombre del proyecto', project.name);
                if (newName && newName.trim() && newName.trim() !== project.name) {
                  onRenameProject(project.id, newName.trim());
                }
              }}
            >
              <Type className="mr-2 h-4 w-4" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Actualizar imagen
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={() => onDeleteProject(project.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUpdateDevelopmentImage(project.id, file);
          }
          event.target.value = '';
        }}
      />
    </div>
  );
}
