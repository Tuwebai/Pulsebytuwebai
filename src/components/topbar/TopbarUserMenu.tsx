import { LogOut, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';

export function TopbarUserMenu() {
  const { t } = useTranslation();
  const { logout, user } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Avatar className="h-10 w-10">
              {user?.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  alt={`Avatar de ${user.full_name || user.email}`}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-blue-500 font-semibold text-white">
                {(user?.full_name || user?.email || '').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {user?.avatar ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={`Avatar de ${user.full_name || user.email}`}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-blue-500 font-semibold text-white">
                  {(user?.full_name || user?.email || '').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{user?.full_name || 'Usuario'}</span>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer">
              <UserIcon className="mr-3 h-4 w-4" />
              {t('Mi perfil')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-3 h-4 w-4" />
              {t('Cerrar sesión')}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
