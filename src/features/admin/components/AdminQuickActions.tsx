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
  const actions = [
    {
      icon: Users,
      label: 'Clientes y accesos',
      description: 'Altas, accesos Pulse y estado de clientes.',
      badge: usuariosActivos,
      iconClasses: 'bg-signal/15 text-signal',
      onClick: () => onSectionChange('usuarios'),
    },
    {
      icon: FolderOpen,
      label: 'Proyectos activos',
      description: 'Seguimiento diario de entregas y bloqueos.',
      badge: proyectosEnCurso,
      iconClasses: 'bg-emerald-500/15 text-emerald-400',
      onClick: () => onSectionChange('proyectos'),
    },
    {
      icon: Ticket,
      label: 'Soporte abierto',
      description: 'Tickets en curso y casos urgentes.',
      badge: ticketsAbiertos,
      iconClasses: 'bg-amber-500/15 text-amber-300',
      onClick: () => onSectionChange('tickets'),
    },
    {
      icon: CreditCard,
      label: 'Cobranza y pagos',
      description: 'Estado de cobros y seguimiento administrativo.',
      badge: pagosCount,
      iconClasses: 'bg-violet-500/15 text-violet-300',
      onClick: () => onSectionChange('pagos'),
    },
  ] as const;

  return (
    <section className="rounded-2xl border border-border/60 bg-[var(--bg-surface)] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-tight text-foreground">Frentes operativos</h3>
          <p className="text-sm text-muted-foreground">
            Entradas rápidas a los módulos que sostienen la operación diaria.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <QuickActionButton
            key={action.label}
            icon={action.icon}
            label={action.label}
            description={action.description}
            badge={action.badge}
            iconClasses={action.iconClasses}
            onClick={action.onClick}
          />
        ))}
      </div>
    </section>
  );
}

interface QuickActionButtonProps {
  icon: typeof Users;
  label: string;
  description: string;
  badge: number | ReactNode;
  iconClasses: string;
  onClick: () => void;
}

function QuickActionButton({
  icon: Icon,
  label,
  description,
  badge,
  iconClasses,
  onClick,
}: QuickActionButtonProps) {
  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-start rounded-2xl border border-border/50 bg-background/30 px-3 py-3 text-left shadow-none transition-colors duration-150 hover:bg-background/50 sm:px-4"
      onClick={onClick}
    >
      <div className={`mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Badge className="ml-3 shrink-0 rounded-full border border-border/50 bg-[var(--bg-elevated)] px-3 py-1.5 text-sm font-semibold text-foreground shadow-none">
        {badge}
      </Badge>
    </Button>
  );
}
