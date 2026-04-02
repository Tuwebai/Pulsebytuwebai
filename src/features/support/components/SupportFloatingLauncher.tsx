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
      aria-label="Abrir conversacion de soporte"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border shadow-[var(--support-shadow-modal,var(--cliente-shadow-modal))] transition-transform duration-150 hover:scale-[1.02] md:bottom-6 md:right-6"
      style={{
        borderColor: `var(--${scope}-signal-border)`,
        backgroundColor: `var(--${scope}-bg-elevated)`,
      }}
      type="button"
      onClick={onClick}
    >
      <PulseLogo size={22} variant="signal" />
      {pendingCount > 0 ? (
        <span
          className="absolute -right-1 -top-1 min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold text-white"
          style={{ backgroundColor: `var(--${scope}-signal)` }}
        >
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      ) : null}
    </button>
  );
}
