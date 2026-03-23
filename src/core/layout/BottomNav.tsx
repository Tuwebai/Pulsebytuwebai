import { Activity, FolderOpen, LayoutDashboard, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/core/hooks/usePrefersReducedMotion';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const bottomNavItems = [
  { icon: LayoutDashboard, label: 'Inicio', to: '/dashboard' },
  { icon: Activity, label: 'Pulse', to: '/dashboard/pulse' },
  { icon: FolderOpen, label: 'Proyecto', to: '/dashboard/proyecto' },
  { icon: LifeBuoy, label: 'Soporte', to: '/dashboard/soporte' }
] as const;

export default function BottomNav() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="flex h-16 items-center justify-around">
        {bottomNavItems.map(({ icon: Icon, label, to }) => (
          <li key={to} className="flex-1">
            <NavLink
              end={to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 px-2 py-1 text-[10px] text-[var(--text-tertiary)]',
                  isActive && 'text-[var(--signal)]'
                )
              }
              onClick={() => {
                if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                  navigator.vibrate(8);
                }
              }}
              to={to}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={1.5} />
                  <span>{label}</span>
                  <motion.span
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0,
                    }}
                    className="h-1 w-1 rounded-full bg-[var(--signal)]"
                    initial={false}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
