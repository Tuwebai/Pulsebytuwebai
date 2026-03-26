import { Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface AdminUsersListHeaderProps {
  totalUsers: number;
  adminUsers: number;
}

export function AdminUsersListHeader({ totalUsers, adminUsers }: AdminUsersListHeaderProps) {
  const regularUsers = totalUsers - adminUsers;

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-600/50 dark:from-slate-700 dark:to-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Users size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Lista de Usuarios ({totalUsers})
          </span>
        </div>
        <Badge className="border-blue-200 bg-blue-100 px-3 py-1 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {adminUsers} Admin | {regularUsers} Usuarios
        </Badge>
      </div>
    </div>
  );
}
