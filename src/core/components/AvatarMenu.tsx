import { Bell, Compass, LogOut, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/contexts/appContext.types';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { DEFAULT_PRODUCT_TOUR_SCOPE, PRODUCT_TOUR_OPEN_EVENT } from '@/features/product-tour/services/productTour.service';

interface AvatarMenuProps {
  onOpenNotifications: () => void;
  onLogout: () => Promise<void>;
  user: User | null;
}

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

export default function AvatarMenu({ onOpenNotifications, onLogout, user }: AvatarMenuProps) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const displayName = profile?.full_name || user?.full_name || 'Cliente Pulse';
  const displayEmail = profile?.email || user?.email || 'sin email';
  const displayAvatar = profile?.avatar_url || user?.avatar || user?.avatar_url;
  const showPulseTour = user?.role !== 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Abrir menú de usuario"
          className="rounded-full transition-transform duration-150 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)]"
          type="button"
        >
          <Avatar className="h-9 w-9 ring-0">
            <AvatarImage alt={displayName || displayEmail} src={displayAvatar} />
            <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              {getInitials(displayName, displayEmail)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[220px] rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-1 text-[var(--text-primary)] shadow-[0_18px_40px_rgba(0,0,0,0.32)]"
        sideOffset={10}
      >
        <DropdownMenuLabel className="cursor-default px-3 py-3">
          <div>
            <p className="text-[13px] font-medium text-[var(--text-primary)]">{displayName}</p>
            <p className="mt-1 text-[11px] font-normal text-[var(--text-tertiary)]">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 bg-[var(--border-subtle)]" />

        <DropdownMenuItem
          className="cursor-pointer rounded-[10px] px-3 py-2 text-[13px] text-[var(--text-primary)] transition-colors duration-150 ease-out focus:bg-[var(--bg-subtle)] focus:text-[var(--text-primary)]"
          onSelect={() => navigate('/dashboard/perfil')}
        >
          <UserCircle2 className="mr-2 h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
          Mi perfil
        </DropdownMenuItem>

        {showPulseTour ? (
          <DropdownMenuItem
            className="cursor-pointer rounded-[10px] px-3 py-2 text-[13px] text-[var(--text-primary)] transition-colors duration-150 ease-out focus:bg-[var(--bg-subtle)] focus:text-[var(--text-primary)]"
            onSelect={() => {
              navigate('/dashboard');
              window.dispatchEvent(new CustomEvent(PRODUCT_TOUR_OPEN_EVENT, { detail: DEFAULT_PRODUCT_TOUR_SCOPE }));
            }}
          >
            <Compass className="mr-2 h-4 w-4 text-[var(--signal)]" strokeWidth={1.5} />
            Ver recorrido de Pulse
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem
          className="cursor-pointer rounded-[10px] px-3 py-2 text-[13px] text-[var(--text-primary)] transition-colors duration-150 ease-out focus:bg-[var(--bg-subtle)] focus:text-[var(--text-primary)]"
          onSelect={() => onOpenNotifications()}
        >
          <Bell className="mr-2 h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
          Notificaciones
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-[var(--border-subtle)]" />

        <DropdownMenuItem
          className="cursor-pointer rounded-[10px] px-3 py-2 text-[13px] text-[var(--danger)] transition-colors duration-150 ease-out focus:bg-[var(--danger-dim)] focus:text-[var(--danger)]"
          onSelect={() => {
            void onLogout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4 text-[var(--danger)]" strokeWidth={1.5} />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
