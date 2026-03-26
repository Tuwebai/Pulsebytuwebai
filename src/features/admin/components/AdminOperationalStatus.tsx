import { BarChart3, Calendar, CheckCircle, DollarSign, Eye, FolderOpen, Ticket, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
}: AdminOperationalStatusProps) {
  return (
    <>
      <div className="mb-6">
        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-slate-700/20 dark:bg-slate-800/50 sm:rounded-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 sm:h-12 sm:w-12 ${
                  isCalendarAuthenticated
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                    : calendarLoading
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                }`}
              >
                <Calendar size={20} className="sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">Agenda operativa</h3>
                <p className="text-sm text-muted-foreground">{calendarUserLabel}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isCalendarAuthenticated ? (
                <Badge variant="default" className="bg-green-500 text-white">
                  Activa
                </Badge>
              ) : calendarLoading ? (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Conectando...
                </Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={onAuthenticateCalendar} className="text-xs">
                  Conectar agenda
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-slate-700/20 dark:bg-slate-800/50">
          <div className="mb-2 flex items-center space-x-3 text-2xl font-bold text-card-foreground">
            <BarChart3 size={24} className="text-blue-600" />
            <span>Estado operativo Pulse</span>
          </div>
          <p className="mb-8 text-base text-muted-foreground">Lectura rápida de clientes, soporte, proyectos y cobranza.</p>

          <div className="space-y-4">
            <OperationalRow icon={Users} label="Clientes con acceso:" value={usuariosActivos} colorClass="bg-blue-500 dark:bg-blue-600" />
            <OperationalRow icon={Users} label="Altas del mes:" value={`+${usuariosNuevos}`} colorClass="bg-emerald-500 dark:bg-emerald-600" />
            <OperationalRow icon={FolderOpen} label="Proyectos en seguimiento:" value={proyectosEnCurso} colorClass="bg-emerald-500 dark:bg-emerald-600" />
            <OperationalRow icon={CheckCircle} label="Entrega completada:" value={`${tasaCompletacionProyectos}%`} colorClass="bg-green-500 dark:bg-green-600" />
            <OperationalRow icon={Ticket} label="Tickets abiertos:" value={ticketsAbiertos} colorClass="bg-amber-500 dark:bg-amber-600" />
            <OperationalRow icon={Eye} label="Casos urgentes:" value={ticketsUrgentes} colorClass="bg-red-500 dark:bg-red-600" />
            <OperationalRow icon={DollarSign} label="Cobranza acumulada:" value={`$${ingresosTotales.toLocaleString()}`} colorClass="bg-violet-500 dark:bg-violet-600" />
            <OperationalRow icon={Calendar} label="Cobranza del mes:" value={`$${ingresosEsteMes.toLocaleString()}`} colorClass="bg-blue-500 dark:bg-blue-600" />
          </div>
        </div>
      </div>
    </>
  );
}

interface OperationalRowProps {
  icon: typeof Users;
  label: string;
  value: number | string;
  colorClass: string;
}

function OperationalRow({ icon: Icon, label, value, colorClass }: OperationalRowProps) {
  return (
    <div className="group flex items-center justify-between rounded-lg border-b border-border px-4 py-4 transition-all duration-200 hover:bg-muted/50 last:border-b-0">
      <span className="flex items-center space-x-3 font-medium text-muted-foreground">
        <Icon size={16} className="text-current" />
        <span>{label}</span>
      </span>
      <Badge className={`rounded-2xl px-5 py-3 text-base font-bold text-white shadow-lg transition-all duration-200 group-hover:scale-105 ${colorClass}`}>
        {value}
      </Badge>
    </div>
  );
}
