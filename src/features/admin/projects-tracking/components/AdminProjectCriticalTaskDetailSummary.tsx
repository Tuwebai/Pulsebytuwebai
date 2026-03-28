import { AlertTriangle, CalendarClock, KanbanSquare, UserRound } from 'lucide-react';

import type { AdminProjectCriticalTaskItem } from '@/features/admin/projects-tracking/components/adminProjectCriticalTasks.utils';

interface AdminProjectCriticalTaskDetailSummaryProps {
  item: AdminProjectCriticalTaskItem;
}

export function AdminProjectCriticalTaskDetailSummary({ item }: AdminProjectCriticalTaskDetailSummaryProps) {
  const { task, reason } = item;
  const cards = [
    { icon: AlertTriangle, label: 'Desvio detectado', tone: 'text-rose-300', value: reason },
    {
      icon: UserRound,
      label: 'Responsable',
      tone: 'text-sky-300',
      value: task.responsable ?? task.assigned_to ?? 'Sin responsable',
    },
    {
      icon: CalendarClock,
      label: 'Fecha objetivo',
      tone: 'text-amber-300',
      value: task.fechaLimite ?? task.dueDate ?? 'Sin fecha',
    },
    { icon: KanbanSquare, label: 'Estado actual', tone: 'text-emerald-300', value: task.status },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {cards.map(({ icon: Icon, label, tone, value }) => (
        <div
          key={label}
          className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
        >
          <Icon className={`mb-3 h-5 w-5 ${tone}`} />
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
        </div>
      ))}
    </section>
  );
}
