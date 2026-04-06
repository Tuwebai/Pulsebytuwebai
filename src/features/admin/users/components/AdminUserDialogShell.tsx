import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/ui/dialog';

interface AdminUserDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  kicker: string;
  icon: LucideIcon;
  iconTone?: 'signal' | 'danger' | 'warning';
  maxWidthClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
  ariaDescribedBy: string;
}

const TONE_CLASSNAMES = {
  signal: 'bg-signal/15 text-signal',
  danger: 'bg-red-500/12 text-red-300',
  warning: 'bg-amber-500/12 text-amber-300',
} as const;

export function AdminUserDialogShell({
  open,
  onOpenChange,
  title,
  description,
  kicker,
  icon: Icon,
  iconTone = 'signal',
  maxWidthClassName = 'sm:max-w-xl',
  children,
  footer,
  ariaDescribedBy,
}: AdminUserDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`border border-white/10 bg-[var(--bg-surface)] p-0 text-slate-100 shadow-2xl ${maxWidthClassName}`}
        aria-describedby={ariaDescribedBy}
      >
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(59,158,245,0.08),rgba(8,15,30,0.96)_72%)] px-5 py-5 sm:px-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${TONE_CLASSNAMES[iconTone]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {kicker}
                </p>
                <DialogTitle className="text-xl font-semibold text-slate-50">
                  {title}
                </DialogTitle>
                <DialogDescription
                  id={ariaDescribedBy}
                  className="max-w-xl text-sm leading-6 text-slate-400"
                >
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
