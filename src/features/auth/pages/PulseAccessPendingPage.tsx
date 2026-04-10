import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/core/ui/button';
import { PulseLogo, PulseWordmark } from '@/core/components';
import { useApp } from '@/contexts/useApp';
import { toast } from '@/core/notifications/hooks/useToast';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';
import { hasPulseAccess } from '@/features/auth/utils/pulseAccess';

export default function PulseAccessPendingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authReady, logout, user } = useApp();
  const hasShownNoticeRef = useRef(false);

  const isDisabled =
    searchParams.get('state') === 'disabled' || user?.pulse_access_status === 'disabled';

  const title = useMemo(
    () =>
      isDisabled
        ? 'Tu acceso a Pulse fue deshabilitado'
        : 'Tu ingreso a Pulse está pendiente',
    [isDisabled],
  );

  const description = useMemo(
    () =>
      isDisabled
        ? 'Tu cuenta sigue existiendo, pero el acceso al panel fue pausado. Si necesitás volver a entrar, el equipo de TuWebAI tiene que revisarlo.'
        : 'Tu cuenta ya fue reconocida, pero el equipo todavía no habilitó tu acceso al panel. Cuando quede listo, vas a entrar automáticamente desde esta misma pantalla.',
    [isDisabled],
  );

  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    if (!isDisabled && hasPulseAccess(user.pulse_access_status)) {
      navigate(getPostLoginPath(user), { replace: true });
    }
  }, [authReady, isDisabled, navigate, user]);

  useEffect(() => {
    if (hasShownNoticeRef.current) {
      return;
    }

    hasShownNoticeRef.current = true;

    toast({
      title: isDisabled ? 'Acceso deshabilitado' : 'Acceso pendiente',
      description: isDisabled
        ? 'Tu acceso al panel está pausado por ahora.'
        : 'Tu cuenta fue validada, pero el panel todavía no fue habilitado para vos.',
    });
  }, [isDisabled]);

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
              <PulseWordmark className="text-[11px] tracking-[0.16em] text-[var(--text-tertiary)]" />
              <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
                {title}
              </h1>
            </div>
          </div>

          <div className="w-full rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5">
            <div className="mb-3 flex items-center gap-3 text-[var(--text-primary)]">
              <ShieldAlert className="h-5 w-5 text-[var(--warning)]" />
              <span className="text-sm font-medium">
                {isDisabled ? 'Acceso pausado' : 'Estamos esperando la habilitación'}
              </span>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>

          <div className="w-full rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-5">
            <p className="text-sm font-medium text-[var(--text-primary)]">Qué pasa ahora</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {isDisabled
                ? 'Si el equipo vuelve a habilitar tu acceso, vas a poder entrar otra vez con Google o email.'
                : 'Cuando el equipo habilite tu acceso, Pulse te va a llevar solo al siguiente paso, sin que tengas que refrescar la página.'}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 flex-1 rounded-[10px]"
              onClick={() => navigate('/login', { replace: true })}
              variant="outline"
            >
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


