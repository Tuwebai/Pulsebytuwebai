import { Bell, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminInboxDetailSection } from '@/features/admin/notifications/components/AdminInboxDetailSection';
import { AdminInboxEventDetailEmpty } from '@/features/admin/notifications/components/AdminInboxEventDetailEmpty';
import type {
  InboxAdminAssignee,
  OperationalEvent,
} from '@/features/admin/notifications/services/adminNotifications.service';
import {
  canResolve,
  formatEventAge,
  getImpactColor,
  getSeverityLabel,
} from '@/features/admin/notifications/services/adminNotifications.service';

interface AdminInboxEventDetailProps {
  event: OperationalEvent | null;
  admins: InboxAdminAssignee[];
  currentUserId: string | null;
  adminsLoading: boolean;
  isAssigning: boolean;
  isSnoozing: boolean;
  isResolving: boolean;
  onAssign: (ownerId: string | null) => void;
  onMarkInProgress: () => void;
  onSnooze: (days: number) => void;
  onResolve: () => void;
  onOpenPrimaryAction: () => void;
  primaryActionLabel: string;
}

export function AdminInboxEventDetail({
  event,
  admins,
  currentUserId,
  adminsLoading,
  isAssigning,
  isSnoozing,
  isResolving,
  onAssign,
  onMarkInProgress,
  onSnooze,
  onResolve,
  onOpenPrimaryAction,
  primaryActionLabel,
}: AdminInboxEventDetailProps) {
  if (!event) {
    return <AdminInboxEventDetailEmpty />;
  }

  return (
    <section className="sticky top-0 rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="space-y-5">
        <div className="space-y-3 border-b border-white/10 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="outline" style={{ color: getImpactColor(event.severity) }}>
                {getSeverityLabel(event.severity)}
              </Badge>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-50">{event.title}</h2>
                <Link
                  to={`/perfil/${event.client_id}`}
                  className="inline-flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200"
                >
                  Abrir cliente
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              <p>{event.client_name}</p>
              <p>{formatEventAge(event.created_at)}</p>
            </div>
          </div>
        </div>

        <AdminInboxDetailSection title="Contexto">
          <p className="text-sm leading-6 text-slate-200">
            {event.description ?? 'Sin descripción operativa cargada.'}
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-slate-500">Impacto en Pulse</p>
            <p className="mt-1 text-sm font-medium" style={{ color: getImpactColor(event.severity) }}>
              {event.impact ?? 'Sin impacto explicitado.'}
            </p>
          </div>
        </AdminInboxDetailSection>

        <AdminInboxDetailSection title="Acción sugerida">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm leading-6 text-slate-200">
              {event.suggested_action ?? 'Revisar el caso y definir el próximo paso operativo.'}
            </p>
            <Button
              className="mt-3 bg-sky-500 text-slate-950 hover:bg-sky-400"
              type="button"
              onClick={onOpenPrimaryAction}
            >
              {primaryActionLabel}
            </Button>
          </div>
        </AdminInboxDetailSection>

        <AdminInboxDetailSection title="Asignación">
          <Select
            value={event.owner_id ?? 'unassigned'}
            onValueChange={(value) => onAssign(value === 'unassigned' ? null : value)}
          >
            <SelectTrigger
              disabled={adminsLoading || isAssigning}
              className="border-white/10 bg-[var(--bg-base)] text-slate-100"
            >
              <SelectValue placeholder="Seleccionar admin" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-slate-100">
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            disabled={!currentUserId || isAssigning}
            onClick={() => onAssign(currentUserId)}
            className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]"
          >
            Asignar a mí
          </Button>
        </AdminInboxDetailSection>

        <AdminInboxDetailSection title="Acciones">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onMarkInProgress}
              disabled={isAssigning}
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]"
            >
              Marcar en progreso
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSnooze(1)}
              disabled={isSnoozing}
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]"
            >
              Pausar 24 h
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSnooze(3)}
              disabled={isSnoozing}
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.06]"
            >
              Pausar 3 días
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onResolve}
              disabled={!currentUserId || !canResolve(event, currentUserId) || isResolving}
            >
              Resolver
            </Button>
          </div>
        </AdminInboxDetailSection>

        <AdminInboxDetailSection title="Historial">
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Creado</span>
              <span className="text-slate-100">{formatEventAge(event.created_at)}</span>
            </div>
            {event.owner_name ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Asignado</span>
                <span className="text-slate-100">{event.owner_name}</span>
              </div>
            ) : null}
            {event.resolved_at ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Resuelto</span>
                <span className="text-slate-100">{formatEventAge(event.resolved_at)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Estado</span>
                <span className="inline-flex items-center gap-2 text-slate-100">
                  <Bell className="h-3.5 w-3.5" />
                  Seguimiento activo
                </span>
              </div>
            )}
          </div>
        </AdminInboxDetailSection>
      </div>
    </section>
  );
}
