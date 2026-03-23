import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PulseLogo } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import { getPostLoginPath } from '../utils/getPostLoginPath';

export default function LoginPage() {
  const { isAuthenticated, user, login, loginWithGoogle, loading, error, clearError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const destination = useMemo(() => getPostLoginPath(user), [user]);

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
      <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center">
          <PulseLogo animated size={72} variant="night" />
          <div className="mt-4 text-[11px] tracking-[0.16em] text-[var(--text-tertiary)]">by TuWebAI</div>
        </div>

        <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-left shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <Button
            className="h-12 w-full rounded-[10px] border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            disabled={submitting || loading}
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

            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

            <Button
              className="h-12 w-full rounded-[10px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
              disabled={submitting || loading}
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

        <p className="mt-6 text-sm text-[var(--text-secondary)]">¿No tenés cuenta? Tu agencia te invita.</p>
      </div>
    </div>
  );
}
