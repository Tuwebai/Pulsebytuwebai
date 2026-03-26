import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminAddUserCardProps {
  onAddUser: () => void;
}

export function AdminAddUserCard({ onAddUser }: AdminAddUserCardProps) {
  return (
    <div className="mt-8">
      <Button
        variant="outline"
        className="group w-full cursor-pointer justify-start rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 p-8 transition-all duration-300 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg dark:border-blue-700 dark:from-blue-900/10 dark:to-indigo-900/10 dark:hover:border-blue-600 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20"
        onClick={onAddUser}
      >
        <div className="mr-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:from-blue-600 group-hover:to-indigo-700">
          <Plus size={32} />
        </div>
        <div className="text-left">
          <span className="mb-2 block text-xl font-bold text-slate-700 transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-slate-100">
            Agregar Nuevo Usuario
          </span>
          <span className="text-slate-500 transition-colors duration-300 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300">
            Crear un nuevo usuario en el sistema con permisos especificos
          </span>
        </div>
      </Button>
    </div>
  );
}
