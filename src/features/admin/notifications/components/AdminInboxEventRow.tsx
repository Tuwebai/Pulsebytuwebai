import {
  Bell,
  CreditCard,
  FolderOpen,
  Globe,
  MessageSquare,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { OperationalEvent } from '@/features/admin/notifications/services/adminNotifications.service';
import {
  formatEventAge,
  getEventTypeLabel,
  getSeverityLabel,
} from '@/features/admin/notifications/services/adminNotifications.service';
import { cn } from '@/lib/utils';

interface AdminInboxEventRowProps {
  event: OperationalEvent;
  selected: boolean;
  onSelect: () => void;
}

function getSourceIcon(sourceType: OperationalEvent['source_type']) {
  switch (sourceType) {
    case 'payment':
      return CreditCard;
    case 'ticket':
      return MessageSquare;
    case 'domain':
      return Globe;
    case 'project':
      return FolderOpen;
    case 'onboarding':
      return User;
    default:
      return Bell;
  }
}

function getStatusLabel(status: OperationalEvent['status']) {
  switch (status) {
    case 'in_progress':
      return 'En progreso';
    case 'snoozed':
      return 'Pausado';
    case 'resolved':
      return 'Resuelto';
    default:
      return 'Abierto';
  }
}

function getSeverityDotColor(severity: OperationalEvent['severity']) {
  switch (severity) {
    case 'critical':
      return 'var(--danger)';
    case 'high':
      return 'var(--warning)';
    case 'medium':
      return 'var(--signal)';
    default:
      return 'var(--text-secondary)';
  }
}

export function AdminInboxEventRow({
  event,
  selected,
  onSelect,
}: AdminInboxEventRowProps) {
  const SourceIcon = getSourceIcon(event.source_type);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-2xl border border-border/70 bg-card/70 p-4 text-left transition-colors',
        'hover:border-border hover:bg-accent/20',
        selected && 'border-l-2 border-l-[var(--signal)]',
      )}
      style={selected ? { backgroundColor: 'var(--signal-glow)' } : undefined}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: getSeverityDotColor(event.severity) }}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">{event.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{event.client_name}</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatEventAge(event.created_at)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <SourceIcon className="h-3.5 w-3.5" />
              {getEventTypeLabel(event.type)}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {getSeverityLabel(event.severity)}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {getStatusLabel(event.status)}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[9px]">
                  {event.owner_name?.slice(0, 2).toUpperCase() ?? 'SA'}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground">
                {event.owner_name ?? 'Sin asignar'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
