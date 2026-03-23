import { Activity, CreditCard, FolderOpen, LayoutDashboard, LifeBuoy, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PulseLogo } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Inicio', to: '/dashboard' },
  { icon: Activity, label: 'Pulse', to: '/dashboard/pulse' },
  { icon: FolderOpen, label: 'Proyecto', to: '/dashboard/proyecto' },
  { icon: CreditCard, label: 'Pagos', to: '/dashboard/pagos' },
  { icon: LifeBuoy, label: 'Soporte', to: '/dashboard/soporte' }
] as const;

function getInitials(name?: string | null, email?: string) {
  if (name?.trim()) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  return email?.slice(0, 2).toUpperCase() || 'PU';
}

export default function Sidebar() {
  const { user } = useApp();

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] md:flex">
      <div className="h-0.5 w-full bg-[var(--gradient-brand)]" />

      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <PulseLogo size={28} variant="night" />
          <div>
            <div className="text-[14px] font-medium tracking-[0.28em] text-[var(--text-primary)]">PULSE</div>
            <div className="text-[10px] font-light tracking-[0.1em] text-[var(--text-tertiary)]">
              by{' '}
              <span
                className="font-medium text-transparent"
                style={{
                  backgroundImage: 'var(--gradient-brand)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                TuWebAI
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ icon: Icon, label, to }) => (
            <li key={to}>
              <NavLink
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-[9px] text-[13px] text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--bg-elevated)]',
                    isActive &&
                      'border-l-2 border-[var(--signal)] bg-[var(--signal-glow)] pl-[10px] text-[var(--signal)]'
                  )
                }
                to={to}
              >
                <Icon size={18} strokeWidth={1.5} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1" />

      <div className="border-t border-[var(--border-subtle)] px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar className="h-10 w-10 ring-0">
            <AvatarImage alt={user?.full_name || user?.email || 'Usuario Pulse'} src={user?.avatar || user?.avatar_url} />
            <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              {getInitials(user?.full_name, user?.email)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
              {user?.full_name || 'Cliente Pulse'}
            </p>
            <p className="truncate text-[11px] text-[var(--text-tertiary)]">{user?.email}</p>
          </div>

          <NavLink
            className="rounded-lg p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            to="/dashboard/configuracion"
          >
            <Settings size={16} strokeWidth={1.5} />
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
