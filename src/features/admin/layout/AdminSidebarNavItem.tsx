import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';

interface AdminSidebarNavItemProps {
  to: string;
  icon: JSX.Element;
  label: string;
}

export function AdminSidebarNavItem({
  to,
  icon,
  label,
}: AdminSidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      aria-label={`Navegar a ${label}`}
      className={({ isActive }) =>
        `relative group block w-full transition-colors duration-200 ${
          isActive ? 'bg-sidebar-primary/8' : 'hover:bg-sidebar-accent/60 dark:hover:bg-slate-800/70'
        }`
      }
    >
      {({ isActive }) => (
        <div className="flex items-center space-x-4 px-3 py-3">
          <div
            className={`relative rounded-xl p-2 transition-all duration-200 ${
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'bg-sidebar-accent/55 text-sidebar-foreground/70 dark:bg-slate-800/90 dark:text-slate-300 group-hover:text-sidebar-primary dark:group-hover:text-blue-400'
            }`}
          >
            {icon}
            {isActive ? (
              <div className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[13px] font-medium tracking-[0.01em] text-sidebar-foreground transition-colors duration-200 dark:text-slate-200 group-hover:text-sidebar-primary dark:group-hover:text-blue-400">
              {label}
            </span>
          </div>
        </div>
      )}
    </NavLink>
  );
}
