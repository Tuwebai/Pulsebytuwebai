import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { PulseLogo } from '@/core/components';
import { useApp } from '@/contexts/useApp';
import type { Notification } from '@/data/types/notifications';
import { storeSupportChatIntent } from '@/features/support/supportChat.events';
import Skeleton from '@/core/components/Skeleton';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const panelTransition = {
  duration: 0.2,
  ease: [0.32, 0.72, 0, 1],
} as const;

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const { user } = useApp();
  const { grouped, unreadCount, isLoading, markRead, markAllRead, isMarkingAllRead } = useNotifications();
  const hasNotifications = grouped.today.length + grouped.thisWeek.length + grouped.older.length > 0;

  const handleSelect = (notification: Notification) => {
    const ticketId = typeof notification.metadata?.ticket_id === 'string' ? notification.metadata.ticket_id : null;

    if (!notification.is_read) {
      markRead(notification.id);
    }

    flushSync(() => {
      onClose();
    });

    if (notification.category === 'ticket' && ticketId) {
      storeSupportChatIntent({
        scope: user?.role === 'admin' ? 'admin' : 'client',
        ticketId,
        focusInput: true,
      });

      navigate(notification.action_url || (user?.role === 'admin' ? '/admin/tickets' : '/dashboard/soporte'));
      return;
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Cerrar panel de notificaciones"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={panelTransition}
            type="button"
            onClick={onClose}
          />

          <div data-surface={user?.role === 'admin' ? 'admin' : 'client'}>
            <motion.aside
              aria-label="Panel de notificaciones"
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-[var(--border-default)] bg-[color:var(--bg-surface)] shadow-2xl md:w-[360px]"
              style={{ opacity: 1 }}
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={panelTransition}
            >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <h2 className="text-[16px] font-medium text-[var(--text-primary)]">Notificaciones</h2>

              <div className="flex items-center gap-3">
                {unreadCount > 0 ? (
                  <button
                    className="text-[12px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-60"
                    disabled={isMarkingAllRead}
                    type="button"
                    onClick={() => markAllRead()}
                  >
                    Marcar todo como leido
                  </button>
                ) : null}

                <button
                  aria-label="Cerrar notificaciones"
                  className="rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  type="button"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 px-5 py-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton height="56px" key={index} rounded="md" />
                  ))}
                </div>
              ) : null}

              {!isLoading && !hasNotifications ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
                    <PulseLogo className="opacity-40" size={32} variant="night" />
                  </div>
                  <p className="mt-4 text-[14px] text-[var(--text-primary)]">No tenes notificaciones nuevas</p>
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                    Cuando haya novedades de tu proyecto, las vas a ver aca.
                  </p>
                </div>
              ) : null}

              {!isLoading && hasNotifications ? (
                <div className="pb-4">
                  <NotificationSection items={grouped.today} label="Hoy" onSelect={handleSelect} />
                  <NotificationSection items={grouped.thisWeek} label="Esta semana" onSelect={handleSelect} />
                  <NotificationSection items={grouped.older} label="Anteriores" onSelect={handleSelect} />
                </div>
              ) : null}
            </div>
            </motion.aside>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

interface NotificationSectionProps {
  items: ReturnType<typeof useNotifications>['grouped']['today'];
  label: string;
  onSelect: (notification: Notification) => void;
}

function NotificationSection({ items, label, onSelect }: NotificationSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="pt-4">
      <div className="px-5 pb-2">
        <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">{label}</p>
      </div>
      <div>
        {items.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
