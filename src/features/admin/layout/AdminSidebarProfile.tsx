import type { User } from '@/contexts/appContext.types';

interface AdminSidebarProfileProps {
  user: User | null;
}

export function AdminSidebarProfile({ user }: AdminSidebarProfileProps) {
  return (
    <div className="border-b border-sidebar-border bg-sidebar-background px-4 py-4 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {user?.avatar ? (
          <div className="relative">
            <img
              src={user.avatar}
              alt={`Avatar de ${user.full_name || user.email}`}
              className="h-11 w-11 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500 to-indigo-600 object-cover shadow-md"
              onError={(event) => {
                const target = event.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement | null;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
            />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
        ) : (
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-md">
              {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
        )}

        <div className="min-w-0 flex-1 text-left">
          <div className="max-w-[200px] truncate text-base font-bold text-sidebar-foreground dark:text-slate-100">
            {user?.full_name || 'Usuario'}
          </div>
          <div className="max-w-[200px] truncate text-xs text-sidebar-foreground/70 dark:text-slate-400">
            {user?.email}
          </div>
        </div>
      </div>
    </div>
  );
}
