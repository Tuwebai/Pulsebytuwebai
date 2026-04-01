import type { ReactNode } from 'react';

interface AdminPageActionsBarProps {
  children?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageActionsBar({
  children,
  actions,
}: AdminPageActionsBarProps) {
  if (!children && !actions) {
    return null;
  }

  return (
    <section className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {children ? <div className="min-w-0 flex-1">{children}</div> : <div className="hidden lg:block" />}
        {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </div>
    </section>
  );
}
