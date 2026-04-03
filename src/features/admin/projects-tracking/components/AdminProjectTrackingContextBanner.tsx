import { ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectTrackingContextBannerProps {
  ctaLabel: string;
  description: string;
  onOpenEdit: () => void;
}

export function AdminProjectTrackingContextBanner({
  ctaLabel,
  description,
  onOpenEdit,
}: AdminProjectTrackingContextBannerProps) {
  return (
    <section className="rounded-[24px] border border-[var(--warning)]/20 bg-[var(--warning-dim)] p-5 shadow-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--warning)]/20 bg-[var(--bg-elevated)] text-[var(--warning)]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--warning)]/80">
              Contexto de alerta
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Llegaste desde alertas Pulse</h2>
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onOpenEdit}
          className="rounded-xl border border-[var(--signal-border)] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
        >
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
