import type { ReactNode } from 'react';

interface AdminSidebarSectionProps {
  title: string;
  children: ReactNode;
}

export function AdminSidebarSection({
  title,
  children,
}: AdminSidebarSectionProps) {
  return (
    <div>
      <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55 dark:text-slate-500">
        {title}
      </div>
      <div className="mb-2 h-px bg-sidebar-border/70 dark:bg-slate-800" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
