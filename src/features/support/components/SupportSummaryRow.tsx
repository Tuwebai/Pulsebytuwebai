import { CheckCircle2, Clock3, MessageSquareMore } from 'lucide-react';
import { AccentIcon, MetricCard } from '@/core/components';

interface SupportSummaryRowProps {
  openCount: number;
  progressCount: number;
  closedCount: number;
}

export default function SupportSummaryRow({ openCount, progressCount, closedCount }: SupportSummaryRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="relative">
        <MetricCard className="pr-16" label="Tickets abiertos" period="esperando respuesta" value={openCount} />
        <div className="pointer-events-none absolute right-5 top-5">
          <AccentIcon tone="signal">
            <Clock3 size={18} strokeWidth={1.75} />
          </AccentIcon>
        </div>
      </div>

      <div className="relative">
        <MetricCard className="pr-16" label="En progreso" period="con intercambio activo" value={progressCount} />
        <div className="pointer-events-none absolute right-5 top-5">
          <AccentIcon tone="warning">
            <MessageSquareMore size={18} strokeWidth={1.75} />
          </AccentIcon>
        </div>
      </div>

      <div className="relative">
        <MetricCard className="pr-16" label="Resueltos" period="tickets cerrados" value={closedCount} />
        <div className="pointer-events-none absolute right-5 top-5">
          <AccentIcon tone="success">
            <CheckCircle2 size={18} strokeWidth={1.75} />
          </AccentIcon>
        </div>
      </div>
    </div>
  );
}
