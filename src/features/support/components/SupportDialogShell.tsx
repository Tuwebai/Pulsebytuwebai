import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SupportDialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  kicker: string;
  icon: LucideIcon;
  ariaDescribedBy: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function SupportDialogShell({
  open,
  onOpenChange,
  title,
  description,
  kicker,
  icon: Icon,
  ariaDescribedBy,
  children,
  footer,
}: SupportDialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={ariaDescribedBy}
        className="max-h-[92vh] border border-white/10 bg-[var(--cliente-bg-surface)] p-0 text-[var(--cliente-text-primary)] shadow-[var(--cliente-shadow-modal)] sm:max-w-4xl"
      >
        <div className="border-b border-white/10 bg-[var(--cliente-hero-bg)] px-4 py-4 sm:px-5">
          <DialogHeader className="space-y-2.5 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--cliente-signal-glow)] text-[var(--cliente-signal)]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cliente-text-tertiary)]">
                  {kicker}
                </p>
                <DialogTitle className="text-lg font-semibold text-[var(--cliente-text-primary)] sm:text-xl">
                  {title}
                </DialogTitle>
                <DialogDescription
                  className="max-w-2xl text-sm leading-5 text-[var(--cliente-text-secondary)]"
                  id={ariaDescribedBy}
                >
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
