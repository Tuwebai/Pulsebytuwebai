import { BellRing } from 'lucide-react';
import { NotificationPushSubscriptionCard } from '@/core/notifications/components/NotificationPushSubscriptionCard';

export function AdminPushNotificationsCard() {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-2xl" data-surface="admin">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Notificaciones del admin</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Push en este dispositivo</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Activa avisos en tiempo real para responder tickets y novedades operativas sin salir de Pulse.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)]">
          <BellRing className="h-4 w-4 text-[var(--signal)]" />
        </div>
      </div>

      <div className="mt-5">
        <NotificationPushSubscriptionCard />
      </div>
    </section>
  );
}
