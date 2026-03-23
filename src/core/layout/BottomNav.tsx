import { Activity, FolderOpen, LayoutDashboard, LifeBuoy } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const bottomNavItems = [
  { icon: LayoutDashboard, label: 'Inicio', to: '/dashboard' },
  { icon: Activity, label: 'Pulse', to: '/dashboard/pulse' },
  { icon: FolderOpen, label: 'Proyecto', to: '/dashboard/proyecto' },
  { icon: LifeBuoy, label: 'Soporte', to: '/dashboard/soporte' }
] as const;

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex h-16 items-center justify-around">
        {bottomNavItems.map(({ icon: Icon, label, to }) => (
          <li key={to} className="flex-1">
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] text-[var(--text-tertiary)]',
                  isActive && 'text-[var(--signal)]'
                )
              }
              to={to}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
