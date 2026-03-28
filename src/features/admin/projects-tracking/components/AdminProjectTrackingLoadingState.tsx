import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminProjectTrackingLoadingStateProps {
  message: string;
}

export function AdminProjectTrackingLoadingState({
  message,
}: AdminProjectTrackingLoadingStateProps) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
      <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
        <LoadingSpinner />
        <span>{message}</span>
      </div>
    </div>
  );
}
