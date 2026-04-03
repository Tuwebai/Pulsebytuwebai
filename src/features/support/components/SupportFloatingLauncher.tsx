import { PulseLogo } from '@/core/components';
import type { SupportChatScope } from '@/features/support/supportChat.events';

interface SupportFloatingLauncherProps {
  pendingCount: number;
  onClick: () => void;
  scope: SupportChatScope;
}

export default function SupportFloatingLauncher({
  pendingCount,
  onClick,
  scope,
}: SupportFloatingLauncherProps) {
  return (
    <button
      aria-label={scope === 'admin' ? 'Abrir conversaciones asignadas' : 'Abrir conversacion de soporte'}
      data-tour={scope === 'client' ? 'support-chat-launcher' : undefined}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--signal-border)] bg-[var(--signal)] text-white shadow-[var(--shadow-modal)] transition-transform duration-150 hover:scale-[1.02] hover:bg-[var(--signal-dim)] md:bottom-6 md:right-6"
      type="button"
      onClick={onClick}
    >
      <PulseLogo size={22} variant="night" />
      {pendingCount > 0 ? (
        <span
          className="absolute -right-1 -top-1 min-w-6 rounded-full border border-[var(--bg-base)] bg-[var(--bg-base)] px-1.5 py-0.5 text-center text-[11px] font-semibold text-[var(--text-primary)]"
        >
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      ) : null}
    </button>
  );
}
