import type { CSSProperties } from 'react';
import type { SupportChatScope } from '@/features/support/supportChat.events';
import { useSupportChatDock } from '@/features/support/hooks/useSupportChatDock';
import SupportConversationPanel from './SupportConversationPanel';
import SupportFloatingLauncher from './SupportFloatingLauncher';

interface SupportChatDockProps {
  scope: SupportChatScope;
}

export default function SupportChatDock({ scope }: SupportChatDockProps) {
  const chat = useSupportChatDock(scope);

  const supportVars = {
    '--support-bg-surface': `var(--${scope}-bg-surface)`,
    '--support-bg-elevated': `var(--${scope}-bg-elevated)`,
    '--support-border-default': `var(--${scope}-border-default)`,
    '--support-text-primary': `var(--${scope}-text-primary)`,
    '--support-text-secondary': `var(--${scope}-text-secondary)`,
    '--support-text-tertiary': `var(--${scope}-text-tertiary)`,
    '--support-signal': `var(--${scope}-signal)`,
    '--support-signal-dim': `var(--${scope}-signal-dim)`,
    '--support-signal-glow': `var(--${scope}-signal-glow)`,
    '--support-signal-border': `var(--${scope}-signal-border)`,
    '--support-shadow-card': `var(--${scope}-shadow-card)`,
    '--support-shadow-modal': `var(--${scope}-shadow-modal)`,
    '--support-hero-bg': `var(--${scope}-hero-bg)`,
    '--support-card-radius': `var(--${scope}-card-radius)`,
  } as CSSProperties;

  return (
    <div style={supportVars}>
      <SupportFloatingLauncher pendingCount={chat.pendingCount} scope={scope} onClick={chat.openConversation} />
      <SupportConversationPanel
        canReply={chat.canReply}
        focusNonce={chat.focusNonce}
        open={chat.open}
        responseText={chat.responseText}
        scope={scope}
        ticket={chat.selectedTicket}
        onChange={chat.setResponseText}
        onClose={chat.closeConversation}
        onSubmit={() => {
          void chat.submitReply();
        }}
      />
    </div>
  );
}
