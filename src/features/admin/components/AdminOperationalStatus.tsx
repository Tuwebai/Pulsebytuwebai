import { BarChart3, Calendar, CheckCircle, DollarSign, Eye, FolderOpen, Ticket, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminSectionId } from '@/features/admin/constants/adminSections';

interface AdminOperationalStatusProps {
  isCalendarAuthenticated: boolean;
  calendarLoading: boolean;
  calendarUserLabel: string;
  onAuthenticateCalendar: () => void;
  usuariosActivos: number;
  usuariosNuevos: number;
  proyectosEnCurso: number;
  tasaCompletacionProyectos: number;
  ticketsAbiertos: number;
  ticketsUrgentes: number;
  ingresosTotales: number;
  ingresosEsteMes: number;
  onSectionChange: (sectionId: AdminSectionId) => void;
}

export function AdminOperationalStatus({
  isCalendarAuthenticated,
  calendarLoading,
  calendarUserLabel,
  onAuthenticateCalendar,
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
  const statusRows = [
    { icon: Users, label: 'Clientes con acceso', value: usuariosActivos, toneClassName: 'bg-signal/15 text-signal', sectionId: 'usuarios' as const },
    { icon: Users, label: 'Altas del mes', value: `+${usuariosNuevos}`, toneClassName: 'bg-emerald-500/15 text-emerald-400', sectionId: 'usuarios' as const },
    { icon: FolderOpen, label: 'Proyectos en seguimiento', value: proyectosEnCurso, toneClassName: 'bg-emerald-500/15 text-emerald-400', sectionId: 'proyectos' as const },
    { icon: CheckCircle, label: 'Entrega completada', value: `${tasaCompletacionProyectos}%`, toneClassName: 'bg-sky-500/15 text-sky-300', sectionId: 'proyectos' as const },
    { icon: Ticket, label: 'Tickets abiertos', value: ticketsAbiertos, toneClassName: 'bg-amber-500/15 text-amber-300', sectionId: 'tickets' as const },
    { icon: Eye, label: 'Casos urgentes', value: ticketsUrgentes, toneClassName: 'bg-red-500/15 text-red-300', sectionId: 'tickets' as const },
    { icon: DollarSign, label: 'Cobranza acumulada', value: `$${ingresosTotales.toLocaleString()}`, toneClassName: 'bg-violet-500/15 text-violet-300', sectionId: 'pagos' as const },
    { icon: Calendar, label: 'Cobranza del mes', value: `$${ingresosEsteMes.toLocaleString()}`, toneClassName: 'bg-signal/15 text-signal', sectionId: 'pagos' as const },
  ] as const;

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="rounded-2xl border border-border/60 bg-[var(--bg-surface)] p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isCalendarAuthenticated
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : calendarLoading
                    ? 'bg-signal/15 text-signal'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              <Calendar className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Agenda operativa</h3>
              <p className="text-xs text-muted-foreground">{calendarUserLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isCalendarAuthenticated ? (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                Activa
              </Badge>
            ) : calendarLoading ? (
              <Badge variant="outline" className="border-signal/40 bg-signal/10 text-signal">
                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Conectando
              </Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={onAuthenticateCalendar}>
                Conectar agenda
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-[var(--bg-surface)] p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-signal/15 text-signal">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold leading-tight text-foreground">Estado operativo Pulse</h3>
            <p className="text-sm text-muted-foreground">
              Lectura rápida de clientes, soporte, proyectos y cobranza.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {statusRows.map((row) => (
            <OperationalRow
              key={row.label}
              icon={row.icon}
              label={row.label}
              value={row.value}
              toneClassName={row.toneClassName}
              onClick={() => onSectionChange(row.sectionId)}
            />
          ))}
        </div>
      </section>
    </div>
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
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/30 px-3 py-3 text-left transition-colors duration-150 hover:border-border hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50"
    >
      <span className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${toneClassName}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{label}</span>
      </span>
      <Badge className="shrink-0 rounded-full border border-border/50 bg-[var(--bg-elevated)] px-3 py-1.5 text-sm font-semibold text-foreground shadow-none">
        {value}
      </Badge>
    </button>
  );
}
