import {
  BarChart3,
  Bell,
  CheckCircle,
  Cog,
  CreditCard,
  FolderOpen,
  Ticket,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ADMIN_OPERATIONAL_SECTION_IDS,
  getAdminSectionLabel,
  type AdminSectionId,
} from '@/features/admin/constants/adminSections';

interface AdminSectionNavProps {
  activeSection: AdminSectionId;
  onSectionChange: (sectionId: AdminSectionId) => void;
}

const SECTION_ICONS: Record<AdminSectionId, typeof Users> = {
  dashboard: BarChart3,
  usuarios: Users,
  proyectos: FolderOpen,
  'aprobar-proyectos': CheckCircle,
  tickets: Ticket,
  pagos: CreditCard,
  notifications: Bell,
  settings: Cog,
};

export function AdminSectionNav({ activeSection, onSectionChange }: AdminSectionNavProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {ADMIN_OPERATIONAL_SECTION_IDS.map((sectionId) => {
          const Icon = SECTION_ICONS[sectionId];
          const isActive = sectionId === activeSection;

          return (
            <Button
              key={sectionId}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
                  : 'border-border/60 bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={() => onSectionChange(sectionId)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {getAdminSectionLabel(sectionId)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
