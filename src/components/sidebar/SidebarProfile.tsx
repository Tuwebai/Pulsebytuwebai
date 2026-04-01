import type { User } from '@/contexts/appContext.types';

interface SidebarProfileProps {
  user: User | null;
  isAdmin: boolean;
}

export function SidebarProfile({ user, isAdmin }: SidebarProfileProps) {
  return (
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
  );
}
