import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  CreditCard,
  FolderKanban,
  HelpCircle,
  Home,
  LogOut,
  Settings,
  User,
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PulseLogo from '@/core/components/PulseLogo';

export default function Sidebar() {
  const { user, logout } = useApp();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  const navItem = (to: string, icon: JSX.Element, label: string, badge?: string) => (
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

  return (
    <aside
      className={`flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar-background dark:border-slate-700 dark:bg-slate-900 ${
        isAdmin ? 'shadow-none' : 'shadow-xl'
      }`}
    >
      <div className="h-0.5 w-full" style={{ background: 'var(--gradient-brand)' }} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className={`border-b border-sidebar-border dark:border-slate-700 ${
            isAdmin
              ? 'bg-sidebar-background px-4 py-4'
              : 'bg-gradient-to-r from-sidebar-accent to-sidebar-background p-6 dark:from-slate-800 dark:to-slate-900'
          }`}
        >
          <div className={`flex ${isAdmin ? 'items-center gap-3' : 'flex-col items-center gap-3'}`}>
            {user?.avatar ? (
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={`Avatar de ${user.full_name || user.email}`}
                  className={`bg-gradient-to-br from-blue-500 to-indigo-600 object-cover ${isAdmin ? 'h-11 w-11 rounded-2xl border border-white/10 shadow-md' : 'h-10 w-10 rounded-xl border-2 border-white shadow-lg'}`}
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
              </div>
            ) : (
              <div className="relative">
                <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white ${isAdmin ? 'h-11 w-11 text-lg shadow-md' : 'h-10 w-10 rounded-xl text-xl shadow-lg'}`}>
                  {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
              </div>
            )}

            <div className={isAdmin ? 'min-w-0 flex-1 text-left' : 'text-center'}>
              <div className={`max-w-[200px] truncate font-bold text-sidebar-foreground dark:text-slate-100 ${isAdmin ? 'text-base' : 'text-xl'}`}>
                {user?.full_name || 'Usuario'}
              </div>
              <div className={`max-w-[200px] truncate text-sidebar-foreground/70 dark:text-slate-400 ${isAdmin ? 'text-xs' : 'text-sm'}`}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {isAdmin ? (
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55 dark:text-slate-500">
              {t('Principal')}
            </div>
            <div className="mb-2 h-px bg-sidebar-border/70 dark:bg-slate-800" />
            <div className="space-y-1">{navItem('/admin', <BarChart3 size={18} />, 'Pulse Admin')}</div>
          </nav>
        ) : (
          <nav className="flex-1 overflow-y-auto px-2 py-2">
            <div className="mb-6 px-2">
              <div className="mb-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 dark:text-slate-400">
                Principal
              </div>
              <div className="mb-2 h-px bg-gradient-to-r from-sidebar-border to-transparent dark:from-slate-700" />
              <div className="space-y-1">
                {navItem('/dashboard', <Home size={18} />, t('Dashboard'))}
                {navItem('/proyectos', <FolderKanban size={18} />, t('Proyectos'))}
              </div>
            </div>

            <div className="mb-6 px-2">
              <div className="mb-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 dark:text-slate-400">
                Personal
              </div>
              <div className="mb-2 h-px bg-gradient-to-r from-sidebar-border to-transparent dark:from-slate-700" />
              <div className="space-y-1">
                {navItem('/perfil', <User size={18} />, t('Mi Perfil'))}
                {navItem('/facturacion', <CreditCard size={18} />, t('Facturación'))}
              </div>
            </div>

            <div className="mb-6 px-2">
              <div className="mb-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 dark:text-slate-400">
                Soporte
              </div>
              <div className="mb-2 h-px bg-gradient-to-r from-sidebar-border to-transparent dark:from-slate-700" />
              <div className="space-y-1">
                {navItem('/soporte', <HelpCircle size={18} />, t('Soporte'))}
                {navItem('/configuracion', <Settings size={18} />, t('Configuración'))}
              </div>
            </div>
          </nav>
        )}
      </div>

      <div
        className={`border-t border-sidebar-border dark:border-slate-700 ${
          isAdmin
            ? 'bg-sidebar-background px-4 py-4'
            : 'bg-gradient-to-r from-sidebar-accent to-sidebar-background p-4 dark:from-slate-800 dark:to-slate-900'
        }`}
      >
        <Button
          onClick={logout}
          variant="ghost"
          className="group flex w-full items-center justify-center space-x-3 rounded-xl px-3 py-3 text-sidebar-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive dark:text-slate-200 dark:hover:bg-destructive/20 dark:hover:text-red-400"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <LogOut size={18} />
              </TooltipTrigger>
              <TooltipContent>{t('Salir')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>{t('Cerrar Sesión')}</span>
        </Button>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-sidebar-foreground/70 dark:text-slate-400">
          <PulseLogo size={16} variant="night" />
          <div>
            <span>Pulse by </span>
            <span className="brand-gradient-text">TuWebAI</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
