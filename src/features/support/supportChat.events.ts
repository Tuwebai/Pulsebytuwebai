export const SUPPORT_CHAT_INTENT_EVENT = 'pulse:support-chat:intent';

const SUPPORT_CHAT_INTENT_KEY = 'pulse:support-chat:intent';

export type SupportChatScope = 'admin' | 'client';

export interface SupportChatIntent {
  scope: SupportChatScope;
  ticketId?: string | null;
  focusInput?: boolean;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function storeSupportChatIntent(intent: SupportChatIntent) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(SUPPORT_CHAT_INTENT_KEY, JSON.stringify(intent));
  window.dispatchEvent(new CustomEvent<SupportChatIntent>(SUPPORT_CHAT_INTENT_EVENT, { detail: intent }));
}

export function consumeSupportChatIntent() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(SUPPORT_CHAT_INTENT_KEY);

  if (!raw) {
    return null;
  }

  window.sessionStorage.removeItem(SUPPORT_CHAT_INTENT_KEY);

  try {
    return JSON.parse(raw) as SupportChatIntent;
  } catch {
    return null;
  }
}
