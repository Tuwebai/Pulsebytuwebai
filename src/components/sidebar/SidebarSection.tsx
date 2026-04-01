import type { ReactNode } from 'react';

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  isAdmin?: boolean;
}

export function SidebarSection({
  title,
  children,
  isAdmin = false,
}: SidebarSectionProps) {
  if (isAdmin) {
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

  return (
    <div className="mb-6 px-2">
      <div className="mb-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 dark:text-slate-400">
        {title}
      </div>
      <div className="mb-2 h-px bg-gradient-to-r from-sidebar-border to-transparent dark:from-slate-700" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
