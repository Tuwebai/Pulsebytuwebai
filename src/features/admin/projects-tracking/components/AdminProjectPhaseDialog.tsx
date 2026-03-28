import { useEffect, useState } from 'react';
import { CalendarClock, KanbanSquare, Loader2, UserRound, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingPhaseInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface AdminProjectPhaseDialogProps {
  open: boolean;
  saving?: boolean;
  phase?: AdminProjectTrackingPhase | null;
  onClose: () => void;
  onSubmit: (input: AdminProjectTrackingPhaseInput, currentPhaseKey?: string) => Promise<void>;
}

const EMPTY_FORM: AdminProjectTrackingPhaseInput = {
  descripcion: '',
  estado: 'Pendiente',
  responsable: '',
  fechaEntrega: '',
};

const phaseStatuses = ['Pendiente', 'En Progreso', 'Terminado'] as const;

export function AdminProjectPhaseDialog({
  open,
  saving = false,
  phase,
  onClose,
  onSubmit,
}: AdminProjectPhaseDialogProps) {
  const [form, setForm] = useState<AdminProjectTrackingPhaseInput>(EMPTY_FORM);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (phase) {
      setForm({
        descripcion: phase.descripcion ?? phase.key,
        estado: phase.estado,
        responsable: phase.responsable ?? '',
        fechaEntrega: phase.fechaEntrega ?? phase.fechaFin ?? '',
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [open, phase]);

  if (!open) {
    return null;
  }

  const handleChange = <K extends keyof AdminProjectTrackingPhaseInput>(
    field: K,
    value: AdminProjectTrackingPhaseInput[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(form, phase?.key);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[var(--bg-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-signal/20 bg-signal/10 text-signal">
                <KanbanSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                  Fases operativas
                </p>
                <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {phase ? 'Editar fase' : 'Nueva fase'}
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Definí el estado, el responsable y la fecha objetivo para que Pulse pueda seguir esta etapa con claridad.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 rounded-full p-0 text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">Nombre de la fase</span>
            <input
              type="text"
              value={form.descripcion}
              onChange={(event) => handleChange('descripcion', event.target.value)}
              placeholder="Ej: QA final, revisión del cliente, publicación"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-signal/40 focus:bg-white/[0.05]"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">Estado</span>
              <select
                value={form.estado}
                onChange={(event) => handleChange('estado', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
              >
                {phaseStatuses.map((status) => (
                  <option key={status} value={status} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <UserRound className="h-4 w-4 text-sky-300" />
                Responsable
              </span>
              <input
                type="text"
                value={form.responsable ?? ''}
                onChange={(event) => handleChange('responsable', event.target.value)}
                placeholder="Ej: Juan, Equipo diseño"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-signal/40 focus:bg-white/[0.05]"
              />
            </label>

            <label className="block space-y-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <CalendarClock className="h-4 w-4 text-amber-300" />
                Fecha objetivo
              </span>
              <input
                type="date"
                value={form.fechaEntrega ?? ''}
                onChange={(event) => handleChange('fechaEntrega', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-signal/40 focus:bg-white/[0.05]"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-white/10 bg-white/[0.03] text-[var(--text-primary)] hover:bg-white/[0.06]"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
            onClick={handleSubmit}
            disabled={saving || !form.descripcion.trim()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {phase ? 'Guardar fase' : 'Crear fase'}
          </Button>
        </div>
      </div>
    </div>
  );
}
