import { Link } from 'react-router-dom';
import { Bell, ExternalLink, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    return (
      <Card className="sticky top-0" hover={false}>
        <CardContent className="flex min-h-[520px] flex-col items-center justify-center gap-3 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Seleccioná un evento para ver el detalle</p>
            <p className="text-sm text-muted-foreground">La bandeja operativa muestra contexto, owner y acciones.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-0" hover={false}>
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="outline" style={{ color: getImpactColor(event.severity) }}>
              {getSeverityLabel(event.severity)}
            </Badge>
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <Link
              to={`/perfil/${event.client_id}`}
              className="inline-flex items-center gap-1 text-sm text-[var(--signal)] hover:underline"
            >
              Abrir cliente
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{event.client_name}</p>
            <p>{formatEventAge(event.created_at)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Contexto</p>
          <p className="text-sm text-foreground">{event.description ?? 'Sin descripción operativa cargada.'}</p>
          <div className="rounded-xl border border-border/70 bg-background/60 p-3">
            <p className="text-xs text-muted-foreground">Impacto en Pulse</p>
            <p className="mt-1 text-sm font-medium" style={{ color: getImpactColor(event.severity) }}>
              {event.impact ?? 'Sin impacto explicitado.'}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Acción sugerida</p>
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor:
                event.severity === 'critical' || event.severity === 'high'
                  ? 'var(--warning-dim)'
                  : 'var(--bg-surface)',
            }}
          >
            <p className="text-sm text-foreground">
              {event.suggested_action ?? 'Revisar el caso y definir próximo paso operativo.'}
            </p>
            <Button className="mt-3" type="button" onClick={onOpenPrimaryAction}>
              {primaryActionLabel}
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Asignación</p>
          <Select
            value={event.owner_id ?? 'unassigned'}
            onValueChange={(value) => onAssign(value === 'unassigned' ? null : value)}
          >
            <SelectTrigger disabled={adminsLoading || isAssigning}>
              <SelectValue placeholder="Seleccionar admin" />
            </SelectTrigger>
            <SelectContent>
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
          >
            Asignar a mí
          </Button>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Acciones</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onMarkInProgress} disabled={isAssigning}>
              Marcar en progreso
            </Button>
            <Button type="button" variant="outline" onClick={() => onSnooze(1)} disabled={isSnoozing}>
              Snooze 24h
            </Button>
            <Button type="button" variant="outline" onClick={() => onSnooze(3)} disabled={isSnoozing}>
              Snooze 3 días
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
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Historial</p>
          <div className="space-y-2 rounded-xl border border-border/70 bg-background/60 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Creado</span>
              <span>{formatEventAge(event.created_at)}</span>
            </div>
            {event.owner_name ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Asignado</span>
                <span>{event.owner_name}</span>
              </div>
            ) : null}
            {event.resolved_at ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Resuelto</span>
                <span>{formatEventAge(event.resolved_at)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Estado</span>
                <span className="inline-flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5" />
                  Seguimiento activo
                </span>
              </div>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
