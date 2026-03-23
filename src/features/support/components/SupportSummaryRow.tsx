import { CheckCircle2, Clock3, MessageSquareMore } from 'lucide-react';
import { MetricCard } from '@/core/components';

interface SupportSummaryRowProps {
  openCount: number;
  progressCount: number;
  closedCount: number;
}

function SummaryIcon({
  children,
  color,
  backgroundColor,
  borderColor
}: {
  children: React.ReactNode;
  color: string;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <div className="pointer-events-none absolute right-5 top-5">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full border"
        style={{
          backgroundColor,
          borderColor,
          boxShadow: `0 0 0 1px ${borderColor} inset`
        }}
      >
        <div style={{ color }}>{children}</div>
      </div>
    </div>
  );
}

export default function SupportSummaryRow({ openCount, progressCount, closedCount }: SupportSummaryRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="relative">
        <MetricCard className="pr-16" label="Tickets abiertos" period="esperando respuesta" value={openCount} />
        <SummaryIcon
          backgroundColor="rgba(59, 158, 245, 0.16)"
          borderColor="rgba(59, 158, 245, 0.28)"
          color="#3B9EF5"
        >
          <Clock3 color="#3B9EF5" size={18} strokeWidth={1.75} />
        </SummaryIcon>
      </div>

      <div className="relative">
        <MetricCard className="pr-16" label="En progreso" period="con intercambio activo" value={progressCount} />
        <SummaryIcon
          backgroundColor="rgba(245, 158, 11, 0.16)"
          borderColor="rgba(245, 158, 11, 0.28)"
          color="#F59E0B"
        >
          <MessageSquareMore color="#F59E0B" size={18} strokeWidth={1.75} />
        </SummaryIcon>
      </div>

      <div className="relative">
        <MetricCard className="pr-16" label="Resueltos" period="tickets cerrados" value={closedCount} />
        <SummaryIcon
          backgroundColor="rgba(34, 197, 94, 0.16)"
          borderColor="rgba(34, 197, 94, 0.28)"
          color="#22C55E"
        >
          <CheckCircle2 color="#22C55E" size={18} strokeWidth={1.75} />
        </SummaryIcon>
      </div>
    </div>
  );
}
