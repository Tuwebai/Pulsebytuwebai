import type { ReactNode } from 'react';

interface SupportTicketResponseBlockProps {
  content: string;
  icon: ReactNode;
  meta?: string;
  tone: 'signal' | 'success';
  title: string;
}

export default function SupportTicketResponseBlock({
  content,
  icon,
  meta,
  tone,
  title,
}: SupportTicketResponseBlockProps) {
  const toneClassName =
    tone === 'signal'
      ? 'border-[var(--signal-border)] bg-[var(--signal-glow)]'
      : 'border-[var(--success)]/20 bg-[var(--success-dim)]';

  return (
    <div className={`rounded-[16px] border px-4 py-3 ${toneClassName}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{content}</p>
      {meta ? <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">{meta}</p> : null}
    </div>
  );
}
