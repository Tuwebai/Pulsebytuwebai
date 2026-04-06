import {
  BarChart3,
  Bell,
  Cog,
  CreditCard,
  FolderOpen,
  Ticket,
  Users,
} from 'lucide-react';

import { Button } from '@/core/ui/button';
import { cn } from '@/core/utils/cn';
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
                'h-10 rounded-full px-4 text-sm font-medium transition-all',
                isActive
                  ? 'border border-signal/25 bg-signal/12 text-signal shadow-[0_0_0_1px_rgba(59,158,245,0.08)] hover:bg-signal/16'
                  : 'border-white/10 bg-[var(--bg-elevated)]/55 text-[var(--text-secondary)] hover:border-white/15 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
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
