import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import Skeleton from '@/core/components/Skeleton';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const panelTransition = {
  duration: 0.2,
  ease: [0.32, 0.72, 0, 1]
} as const;

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { grouped, unreadCount, isLoading, markRead, markAllRead, isMarkingAllRead } = useNotifications();
  const hasNotifications = grouped.today.length + grouped.thisWeek.length + grouped.older.length > 0;

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

          <motion.aside
            aria-label="Panel de notificaciones"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xl md:w-[360px]"
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
                    Marcar todo como leído
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
                    <Skeleton key={index} height="56px" rounded="md" />
                  ))}
                </div>
              ) : null}

              {!isLoading && !hasNotifications ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
                    <Bell className="h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
                  </div>
                  <p className="mt-4 text-[14px] text-[var(--text-tertiary)]">No tenés notificaciones nuevas</p>
                </div>
              ) : null}

              {!isLoading && hasNotifications ? (
                <div className="pb-4">
                  <NotificationSection items={grouped.today} label="Hoy" onRead={markRead} />
                  <NotificationSection items={grouped.thisWeek} label="Esta semana" onRead={markRead} />
                  <NotificationSection items={grouped.older} label="Anteriores" onRead={markRead} />
                </div>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

interface NotificationSectionProps {
  label: string;
  items: ReturnType<typeof useNotifications>['grouped']['today'];
  onRead: (id: string) => void;
}

function NotificationSection({ label, items, onRead }: NotificationSectionProps) {
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
          <NotificationItem key={notification.id} notification={notification} onRead={onRead} />
        ))}
      </div>
    </section>
  );
}
