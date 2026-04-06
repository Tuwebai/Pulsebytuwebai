import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/core/ui/avatar';
import { getIdentityInitials } from '@/core/identity/userIdentity';
import type { SupportConversationSummary } from '@/features/support/ticketMessages.types';

interface SupportConversationListItemProps {
  active: boolean;
  conversation: SupportConversationSummary;
  onSelect: (ticketId: string) => void;
}

function getRelativeTimeLabel(dateValue: string | null) {
  if (!dateValue) {
    return '';
  }

  return formatDistanceToNowStrict(new Date(dateValue), {
    addSuffix: true,
    locale: es,
  });
}

export default function SupportConversationListItem({
  active,
  conversation,
  onSelect,
}: SupportConversationListItemProps) {
  return (
    <button
      className={`flex w-full items-start gap-3 rounded-[20px] border px-3 py-3 text-left transition-colors ${
        active
          ? 'border-[var(--signal-border)] bg-[color-mix(in_srgb,var(--bg-elevated)_84%,var(--signal)_16%)]'
          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)]'
      }`}
      type="button"
      onClick={() => onSelect(conversation.ticketId)}
    >
      <Avatar className="h-10 w-10 shrink-0 border border-[var(--border-default)]">
        <AvatarImage alt={conversation.participantName} className="object-cover" src={conversation.participantAvatarUrl ?? undefined} />
        <AvatarFallback className="bg-[color-mix(in_srgb,var(--signal)_18%,var(--bg-elevated))] text-[11px] font-semibold text-[var(--text-primary)]">
          {getIdentityInitials(conversation.participantName, conversation.participantEmail ?? undefined)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{conversation.title}</p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--text-tertiary)]">{conversation.participantName}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-[var(--text-tertiary)]">{getRelativeTimeLabel(conversation.lastMessageAt)}</p>
            {conversation.unreadCount > 0 ? (
              <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--signal)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[var(--text-secondary)]">{conversation.lastMessage}</p>
      </div>
    </button>
  );
}
