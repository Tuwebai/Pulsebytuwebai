import type { ReactNode } from 'react';

interface AdminInboxDetailSectionProps {
  title: string;
  children: ReactNode;
}

export function AdminInboxDetailSection({
  title,
  children,
}: AdminInboxDetailSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      {children}
    </section>
  );
}
