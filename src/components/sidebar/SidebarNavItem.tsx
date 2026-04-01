import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';

interface SidebarNavItemProps {
  to: string;
  icon: JSX.Element;
  label: string;
  isAdmin: boolean;
  badge?: string;
}

export function SidebarNavItem({
  to,
  icon,
  label,
  isAdmin,
  badge,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      aria-label={`Navegar a ${label}`}
      className={({ isActive }) =>
        `relative group block w-full transition-colors duration-200 ${
          isAdmin
            ? isActive
              ? 'bg-sidebar-primary/8'
              : 'hover:bg-sidebar-accent/60 dark:hover:bg-slate-800/70'
            : `hover:bg-sidebar-accent dark:hover:bg-slate-700 ${
                isActive ? 'bg-gradient-to-r from-sidebar-primary/10 to-sidebar-primary/5 dark:from-blue-900/20 dark:to-blue-800/10' : ''
              }`
        }`
      }
    >
      {({ isActive }) => (
        <div className={`flex items-center ${isAdmin ? 'px-3 py-3' : 'px-4 py-3.5'} space-x-4`}>
          <div
            className={`relative rounded-xl p-2 transition-all duration-200 ${
              isActive
                ? isAdmin
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25'
                : isAdmin
                  ? 'bg-sidebar-accent/55 text-sidebar-foreground/70 dark:bg-slate-800/90 dark:text-slate-300 group-hover:text-sidebar-primary dark:group-hover:text-blue-400'
                  : 'bg-sidebar-accent dark:bg-slate-700 text-sidebar-foreground/70 dark:text-slate-300 group-hover:bg-sidebar-primary/10 dark:group-hover:bg-blue-900/30 group-hover:text-sidebar-primary dark:group-hover:text-blue-400'
            }`}
          >
            {icon}
            {isActive ? (
              <div
                className={`absolute top-1/2 -translate-y-1/2 bg-sidebar-primary ${
                  isAdmin ? '-left-3 h-5 w-0.5 rounded-r-full' : '-left-2 h-6 w-1 rounded-r-full'
                }`}
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <span className={`font-medium text-sidebar-foreground transition-colors duration-200 dark:text-slate-200 group-hover:text-sidebar-primary dark:group-hover:text-blue-400 ${isAdmin ? 'text-[13px] tracking-[0.01em]' : 'text-sm'}`}>
              {label}
            </span>
          </div>

          {badge ? (
            <Badge variant="secondary" className="text-xs" aria-label={`Estado: ${badge}`}>
              {badge}
            </Badge>
          ) : null}
        </div>
      )}
    </NavLink>
  );
}
