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
      ? 'border-[var(--support-signal-border,var(--cliente-signal-border))] bg-[var(--support-signal-glow,var(--cliente-signal-glow))]'
      : 'border-emerald-500/20 bg-emerald-500/10';

  return (
    <div className={`rounded-[16px] border px-4 py-3 ${toneClassName}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[13px] font-medium text-[var(--support-text-primary,var(--cliente-text-primary))]">{title}</p>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-[var(--support-text-secondary,var(--cliente-text-secondary))]">{content}</p>
      {meta ? <p className="mt-2 text-[12px] text-[var(--support-text-tertiary,var(--cliente-text-tertiary))]">{meta}</p> : null}
    </div>
  );
}
