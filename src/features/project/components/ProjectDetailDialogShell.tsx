import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/core/ui/dialog';

interface ProjectDetailDialogShellProps {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  icon: LucideIcon;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

export default function ProjectDetailDialogShell({
  children,
  description,
  footer,
  icon: Icon,
  onOpenChange,
  open,
  title,
}: ProjectDetailDialogShellProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        aria-describedby="project-detail-description"
        className="max-h-[92vh] overflow-y-auto border border-white/10 bg-[var(--cliente-bg-surface)] p-0 text-slate-100 shadow-2xl sm:max-w-3xl"
        hideCloseButton
      >
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(59,158,245,0.08),rgba(8,15,30,0.96)_72%)] px-4 py-4 sm:px-5">
          <DialogHeader className="space-y-2.5 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-signal">
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Mi proyecto
                </p>
                <DialogTitle className="text-lg font-semibold text-slate-50 sm:text-xl">
                  {title}
                </DialogTitle>
                <DialogDescription
                  className="max-w-2xl text-sm leading-5 text-slate-400"
                  id="project-detail-description"
                >
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
