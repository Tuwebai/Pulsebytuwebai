import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SsoAccessError, signInWithSsoToken } from '@/features/auth/services/ssoService';

const SSO_TOKEN_STORAGE_KEY = 'pulse_sso_token';

let activeSsoToken: string | null = null;
let activeSsoRequest: Promise<string> | null = null;

function readSsoToken(searchParams: URLSearchParams): string | null {
  const tokenFromUrl = searchParams.get('token');

  if (tokenFromUrl) {
    sessionStorage.setItem(SSO_TOKEN_STORAGE_KEY, tokenFromUrl);
    return tokenFromUrl;
  }

  return sessionStorage.getItem(SSO_TOKEN_STORAGE_KEY);
}

function clearSsoToken() {
  sessionStorage.removeItem(SSO_TOKEN_STORAGE_KEY);
  activeSsoToken = null;
  activeSsoRequest = null;
}

export default function SSOPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'access_pending'>('verifying');

  useEffect(() => {
    const token = readSsoToken(searchParams);

    if (typeof window !== 'undefined' && searchParams.get('token')) {
      window.history.replaceState({}, document.title, '/auth/sso');
    }

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const processSso = async () => {
      try {
        if (activeSsoToken !== token || !activeSsoRequest) {
          activeSsoToken = token;
          activeSsoRequest = signInWithSsoToken(token);
        }

        const redirectPath = await activeSsoRequest;
        clearSsoToken();
        navigate(redirectPath, { replace: true });
      } catch (error) {
        if (error instanceof SsoAccessError && error.code === 'access_pending') {
          clearSsoToken();
          setStatus('access_pending');
          return;
        }

        clearSsoToken();
        navigate('/login?error=sso_invalid', { replace: true });
      }
    };

    void processSso();
  }, [navigate, searchParams]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex max-w-sm flex-col items-center gap-6 text-center">
          <svg
            aria-label="Pulse"
            height="64"
            role="img"
            viewBox="0 0 100 100"
            width="64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id="pulse-sso-clip">
                <circle cx="50" cy="50" r="37" />
              </clipPath>
            </defs>
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="38"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.2"
            />
            <g clipPath="url(#pulse-sso-clip)">
              <path
                d="M12 50 L26 50 L34 26 L44 74 L52 38 L60 50 L88 50"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </g>
            <circle className="pulse-logo-dot" cx="60" cy="50" fill="#3B9EF5" r="2.5" />
          </svg>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-[18px] font-medium uppercase tracking-[0.35em] text-[var(--text-primary)]">
                Pulse
              </p>
              <p className="text-[11px] font-light tracking-[0.22em] text-[rgba(240,244,255,0.86)]">
                by <span className="brand-gradient-text font-medium">TuWebAI</span>
              </p>
            </div>

            {status === 'access_pending' ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-primary)]">
                  Tu acceso a Pulse todavia no fue habilitado.
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Un administrador tiene que confirmar tu alta en el dashboard antes de que puedas entrar.
                </p>
                <button
                  className="rounded-full border border-[var(--border-default)] px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]"
                  onClick={() => navigate('/login', { replace: true })}
                  type="button"
                >
                  Volver al login
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">Verificando acceso...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
