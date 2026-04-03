import { AlertCircle } from 'lucide-react';

interface AdminProjectTrackingErrorStateProps {
  title: string;
  description: string;
  backLabel: string;
  onBack: () => void;
  onRetry: () => void | Promise<void>;
}

export function AdminProjectTrackingErrorState({
  title,
  description,
  backLabel,
  onBack,
  onRetry,
}: AdminProjectTrackingErrorStateProps) {
  return (
    <section className="rounded-[24px] border border-danger/20 bg-danger/10 p-5 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>
          <div className="flex gap-3">
            <button className="text-sm font-medium text-[var(--signal)]" onClick={() => void onRetry()}>
              Reintentar carga
            </button>
            <button className="text-sm font-medium text-[var(--text-secondary)]" onClick={onBack}>
              {backLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
