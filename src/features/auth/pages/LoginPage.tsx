import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/core/ui/button';
import { Input } from '@/core/ui/input';
import { SUPPORT_CONTACT } from '@/config/supportContact';
import { PulseLogo, PulseWordmark } from '@/core/components';
import { useApp } from '@/contexts/useApp';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export default function LoginPage() {
  const { isAuthenticated, user, authReady, login, loginWithGoogle, error, clearError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const destination = useMemo(() => getPostLoginPath(user), [user]);

  if (!authReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate replace to={destination} />;
  }

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setSubmitting(true);

    try {
      await login(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setSubmitting(true);

    try {
      await loginWithGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] px-4 py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(240,244,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(240,244,255,0.08)_1px,transparent_1px),radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.95)_1.2px,transparent_0)] [background-position:center_center,center_center,center_center] [background-size:24px_24px,24px_24px,24px_24px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,158,245,0.12),transparent_42%)]"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center">
          <PulseLogo animated size={72} variant="night" />
          <PulseWordmark className="mt-4 text-[11px] tracking-[0.16em] text-[var(--text-tertiary)]" />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[36px] bg-[#00CCFF] opacity-30 blur-2xl" />
          <div className="relative rounded-[28px] border border-border bg-card p-6 text-left shadow-card">
            <Button
            className="h-12 w-full rounded-[10px] border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            disabled={submitting}
            onClick={handleGoogleLogin}
            type="button"
            variant="ghost"
          >
            Ingresá con Google <ArrowRight size={16} />
          </Button>

          <div className="my-5 flex items-center gap-3 text-[12px] text-[var(--text-tertiary)]">
            <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            <span>o</span>
            <div className="h-px flex-1 bg-[var(--border-subtle)]" />
          </div>

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]" htmlFor="login-email">
                Email
              </label>
              <Input
                ariaLabel="Email"
                className="h-12 rounded-[10px] border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                id="login-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hola@tuempresa.com"
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]" htmlFor="login-password">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  ariaLabel="Contraseña"
                  className="h-12 rounded-[10px] border-[var(--border-default)] bg-[var(--bg-subtle)] pr-12 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                  id="login-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                />
                <button
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--text-tertiary)]"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-[14px] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3 text-sm text-[var(--text-primary)]">
                <p className="font-medium text-[var(--danger)]">No pudimos iniciar tu sesión</p>
                <p className="mt-1 leading-6">{error}</p>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Si seguís con este problema, escribinos a {SUPPORT_CONTACT.publicEmail}.
                </p>
              </div>
            ) : null}

            <Button
              className="h-12 w-full rounded-[10px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
              disabled={submitting}
              type="submit"
            >
              Ingresar al dashboard
            </Button>
          </form>

            <div className="mt-5 text-center">
              <Link className="text-sm text-[var(--text-secondary)] underline underline-offset-4" to="/register">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">¿No tenés cuenta? Tu agencia te invita.</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Link className="transition hover:text-[var(--text-primary)]" to="/terminos-condiciones">
              Términos y condiciones
            </Link>
            <span>|</span>
            <Link className="transition hover:text-[var(--text-primary)]" to="/politica-privacidad">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

