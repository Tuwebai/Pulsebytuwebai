import { format } from 'date-fns';
import type { TicketMessage } from '@/features/support/ticketMessages.types';

interface SupportMessageBubbleProps {
  isOwn: boolean;
  message: TicketMessage;
}

export default function SupportMessageBubble({ isOwn, message }: SupportMessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-[22px] px-4 py-3 shadow-[var(--shadow-card)] ${
          isOwn
            ? 'rounded-br-[8px] bg-[var(--signal)] text-white'
            : 'rounded-bl-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
        }`}
      >
        {!isOwn ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
            {message.sender?.full_name || message.sender?.email || 'Equipo TuWebAI'}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap text-[13px] leading-6">{message.content}</p>
        <p className={`mt-2 text-[11px] ${isOwn ? 'text-white/75' : 'text-[var(--text-tertiary)]'}`}>
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  );
}
