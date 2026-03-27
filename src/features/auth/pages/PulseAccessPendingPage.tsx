import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PulseLogo } from '@/core/components';
import { useApp } from '@/contexts/AppContext';

export default function PulseAccessPendingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, user } = useApp();

  const isDisabled = searchParams.get('state') === 'disabled' || user?.pulse_access_status === 'disabled';
  const title = useMemo(
    () => (isDisabled ? 'Tu acceso a Pulse fue deshabilitado' : 'Tu acceso a Pulse todavía no está habilitado'),
    [isDisabled],
  );
  const description = useMemo(
    () =>
      isDisabled
        ? 'Tu cuenta puede iniciar sesión, pero el acceso al panel quedó revocado. Si necesitás volver a entrar, pedile al equipo de TuWebAI que revise tu habilitación.'
        : 'Tu cuenta ya existe, pero un administrador todavía no habilitó el acceso operativo a Pulse. Cuando lo active, vas a poder entrar normalmente con Google o email.',
    [isDisabled],
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 py-10">
      <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative z-10 w-full max-w-xl rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:p-8">
        <div className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-4">
            <PulseLogo animated size={56} variant="night" />
            <div>
              <p className="text-[11px] tracking-[0.16em] text-[var(--text-tertiary)]">Pulse by TuWebAI</p>
              <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{title}</h1>
            </div>
          </div>

          <div className="w-full rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5">
            <div className="mb-3 flex items-center gap-3 text-[var(--text-primary)]">
              <ShieldAlert className="h-5 w-5 text-[var(--warning)]" />
              <span className="text-sm font-medium">Acceso de producto pendiente</span>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>

          <div className="w-full rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-5">
            <p className="text-sm font-medium text-[var(--text-primary)]">Qué significa esto</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Iniciar sesión valida tu identidad. Entrar a Pulse además requiere una habilitación operativa del
              equipo de TuWebAI. Sin esa habilitación, la cuenta queda autenticada pero sin acceso al panel.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button className="h-11 flex-1 rounded-[10px]" onClick={() => navigate('/login', { replace: true })} variant="outline">
              Volver al login
            </Button>
            <Button className="h-11 flex-1 rounded-[10px]" onClick={() => void handleLogout()}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
