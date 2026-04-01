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
      ? 'border-signal/20 bg-signal/10'
      : 'border-emerald-500/20 bg-emerald-500/10';

  return (
    <div className={`rounded-[16px] border px-4 py-3 ${toneClassName}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[13px] font-medium text-slate-100">{title}</p>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-slate-400">{content}</p>
      {meta ? <p className="mt-2 text-[12px] text-slate-500">{meta}</p> : null}
    </div>
  );
}
