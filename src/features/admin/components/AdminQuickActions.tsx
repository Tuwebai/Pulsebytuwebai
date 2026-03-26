import type { ReactNode } from 'react';

import { BarChart3, CreditCard, FolderOpen, Ticket, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminSectionId } from '@/features/admin/constants/adminSections';

interface AdminQuickActionsProps {
  usuariosActivos: number;
  proyectosEnCurso: number;
  ticketsAbiertos: number;
  pagosCount: number;
  onSectionChange: (sectionId: AdminSectionId) => void;
}

export function AdminQuickActions({
  usuariosActivos,
  proyectosEnCurso,
  ticketsAbiertos,
  pagosCount,
  onSectionChange,
}: AdminQuickActionsProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-slate-700/20 dark:bg-slate-800/50">
      <div className="mb-2 flex items-center space-x-3 text-2xl font-bold text-card-foreground">
        <BarChart3 size={24} className="text-amber-600" />
        <span>Frentes operativos</span>
      </div>
      <p className="mb-8 text-base text-muted-foreground">Entradas rápidas a los módulos que sostienen la operación diaria.</p>

      <div className="space-y-10">
        <QuickActionButton
          icon={Users}
          label="Clientes y accesos"
          badge={usuariosActivos}
          iconClasses="bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"
          badgeClasses="bg-blue-500 text-white group-hover:bg-blue-600 dark:bg-blue-600 dark:group-hover:bg-blue-700"
          onClick={() => onSectionChange('usuarios')}
        />
        <QuickActionButton
          icon={FolderOpen}
          label="Proyectos activos"
          badge={proyectosEnCurso}
          iconClasses="bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white"
          badgeClasses="bg-emerald-500 text-white group-hover:bg-emerald-600 dark:bg-emerald-600 dark:group-hover:bg-emerald-700"
          onClick={() => onSectionChange('proyectos')}
        />
        <QuickActionButton
          icon={Ticket}
          label="Soporte abierto"
          badge={ticketsAbiertos}
          iconClasses="bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
          badgeClasses="bg-amber-500 text-white group-hover:bg-amber-600 dark:bg-amber-600 dark:group-hover:bg-amber-700"
          onClick={() => onSectionChange('tickets')}
        />
        <QuickActionButton
          icon={CreditCard}
          label="Cobranza y pagos"
          badge={pagosCount}
          iconClasses="bg-violet-100 text-violet-600 group-hover:bg-violet-500 group-hover:text-white"
          badgeClasses="bg-violet-500 text-white group-hover:bg-violet-600 dark:bg-violet-600 dark:group-hover:bg-violet-700"
          onClick={() => onSectionChange('pagos')}
        />
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: typeof Users;
  label: string;
  badge: number | ReactNode;
  iconClasses: string;
  badgeClasses: string;
  onClick: () => void;
}

function QuickActionButton({
  icon: Icon,
  label,
  badge,
  iconClasses,
  badgeClasses,
  onClick,
}: QuickActionButtonProps) {
  return (
    <Button
      variant="outline"
      className="group w-full justify-start rounded-2xl border border-transparent p-6 transition-all duration-300 hover:border-border/50 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:shadow-lg dark:hover:border-slate-600/30 dark:hover:from-slate-700 dark:hover:to-slate-600"
      onClick={onClick}
    >
      <div className={`mr-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${iconClasses}`}>
        <Icon size={28} />
      </div>
      <span className="text-lg font-bold text-foreground transition-colors duration-300">{label}</span>
      <Badge className={`ml-auto rounded-2xl px-5 py-3 text-base font-bold shadow-lg transition-all duration-300 group-hover:scale-105 ${badgeClasses}`}>
        {badge}
      </Badge>
    </Button>
  );
}
