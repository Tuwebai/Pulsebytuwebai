import {
  Bell,
  CreditCard,
  FolderOpen,
  Globe,
  MessageSquare,
  User,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/core/ui/avatar';
import { Badge } from '@/core/ui/badge';
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

function getSeverityDotClass(severity: OperationalEvent['severity']) {
  switch (severity) {
    case 'critical':
      return 'bg-red-400';
    case 'high':
      return 'bg-amber-400';
    case 'medium':
      return 'bg-sky-400';
    default:
      return 'bg-slate-500';
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
        'w-full rounded-[22px] border p-4 text-left shadow-[0_14px_30px_rgba(2,6,23,0.22)] transition-colors',
        selected
          ? 'border-sky-400/25 bg-[linear-gradient(180deg,rgba(59,158,245,0.10),rgba(8,15,30,0.92))]'
          : 'border-white/10 bg-[var(--bg-surface)]/92 hover:border-white/15',
      )}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${getSeverityDotClass(event.severity)}`} />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-50">{event.title}</p>
              <p className="truncate text-xs text-slate-400">{event.client_name}</p>
            </div>
            <span className="shrink-0 text-[11px] text-slate-500">
              {formatEventAge(event.created_at)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <SourceIcon className="h-3.5 w-3.5" />
              {getEventTypeLabel(event.type)}
            </span>
            <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-[10px] text-slate-300">
              {getSeverityLabel(event.severity)}
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-[10px] text-slate-300">
              {getStatusLabel(event.status)}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-white/[0.06] text-[9px] text-slate-200">
                {event.owner_name?.slice(0, 2).toUpperCase() ?? 'SA'}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-slate-400">
              {event.owner_name ?? 'Sin asignar'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
