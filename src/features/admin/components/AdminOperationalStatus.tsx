import {
  BarChart3,
  CheckCircle,
  DollarSign,
  Eye,
  FolderOpen,
  Ticket,
  Users,
} from 'lucide-react';

import { Badge } from '@/core/ui/badge';
import type { AdminSectionChangeHandler } from '@/features/admin/types/adminNavigation';
import { formatCurrency } from '@/lib/integrations/mercadopago';

interface AdminOperationalStatusProps {
  usuariosActivos: number;
  usuariosNuevos: number;
  proyectosEnCurso: number;
  tasaCompletacionProyectos: number;
  ticketsAbiertos: number;
  ticketsUrgentes: number;
  ingresosTotales: number;
  ingresosEsteMes: number;
  onSectionChange: AdminSectionChangeHandler;
}

interface AdminOperationalStatusRow {
  icon: typeof Users;
  label: string;
  value: number | string;
  toneClassName: string;
  sectionId: 'usuarios' | 'proyectos' | 'tickets' | 'pagos';
  options?: {
    usersFilter?: 'with-access' | 'new-this-month';
  };
}

export function AdminOperationalStatus({
  usuariosActivos,
  usuariosNuevos,
  proyectosEnCurso,
  tasaCompletacionProyectos,
  ticketsAbiertos,
  ticketsUrgentes,
  ingresosTotales,
  ingresosEsteMes,
  onSectionChange,
}: AdminOperationalStatusProps) {
  const statusRows: AdminOperationalStatusRow[] = [
    {
      icon: Users,
      label: 'Clientes con acceso',
      value: usuariosActivos,
      toneClassName: 'bg-signal/15 text-signal',
      sectionId: 'usuarios',
      options: { usersFilter: 'with-access' },
    },
    {
      icon: Users,
      label: 'Altas del mes',
      value: `+${usuariosNuevos}`,
      toneClassName: 'bg-emerald-500/15 text-emerald-400',
      sectionId: 'usuarios',
      options: { usersFilter: 'new-this-month' },
    },
    {
      icon: FolderOpen,
      label: 'Proyectos en seguimiento',
      value: proyectosEnCurso,
      toneClassName: 'bg-emerald-500/15 text-emerald-400',
      sectionId: 'proyectos',
    },
    {
      icon: CheckCircle,
      label: 'Entrega completada',
      value: `${tasaCompletacionProyectos}%`,
      toneClassName: 'bg-sky-500/15 text-sky-300',
      sectionId: 'proyectos',
    },
    {
      icon: Ticket,
      label: 'Tickets abiertos',
      value: ticketsAbiertos,
      toneClassName: 'bg-amber-500/15 text-amber-300',
      sectionId: 'tickets',
    },
    {
      icon: Eye,
      label: 'Casos urgentes',
      value: ticketsUrgentes,
      toneClassName: 'bg-red-500/15 text-red-300',
      sectionId: 'tickets',
    },
    {
      icon: DollarSign,
      label: 'Cobranza acreditada',
      value: formatCurrency(ingresosTotales, 'ARS'),
      toneClassName: 'bg-violet-500/15 text-violet-300',
      sectionId: 'pagos',
    },
    {
      icon: DollarSign,
      label: 'Acreditado este mes',
      value: formatCurrency(ingresosEsteMes, 'ARS'),
      toneClassName: 'bg-signal/15 text-signal',
      sectionId: 'pagos',
    },
  ];

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-signal/15 text-signal">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Estado operativo
          </p>
          <h3 className="text-lg font-semibold text-slate-50">Lectura rápida del panel</h3>
          <p className="text-sm text-slate-400">
            Entrá directo al módulo que necesita atención del equipo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {statusRows.map((row) => (
          <OperationalRow
            key={row.label}
            icon={row.icon}
            label={row.label}
            value={row.value}
            toneClassName={row.toneClassName}
            onClick={() => onSectionChange(row.sectionId, row.options)}
          />
        ))}
      </div>
    </section>
  );
}

interface OperationalRowProps {
  icon: typeof Users;
  label: string;
  value: number | string;
  toneClassName: string;
  onClick: () => void;
}

function OperationalRow({ icon: Icon, label, value, toneClassName, onClick }: OperationalRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[var(--bg-base)]/70 px-3 py-3 text-left transition-colors hover:border-white/15 hover:bg-[var(--bg-elevated)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${toneClassName}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-sm text-slate-300">{label}</span>
      </span>
      <Badge className="shrink-0 rounded-full border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-semibold text-slate-100 shadow-none">
        {value}
      </Badge>
    </button>
  );
}
