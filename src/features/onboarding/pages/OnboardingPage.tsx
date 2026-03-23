import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PulseLogo } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import { usePulseOnboarding } from '@/hooks/usePulseOnboarding';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshData } = useApp();
  const { domain, fullName, saveDomain, complete, submitting } = usePulseOnboarding();
  const [step, setStep] = useState(1);
  const [siteUrl, setSiteUrl] = useState(domain);

  const dots = useMemo(() => [1, 2, 3], []);

  const handleContinueToReady = async () => {
    await saveDomain(siteUrl);
    setStep(3);
  };

  const handleFinish = async () => {
    try {
      await complete();
    } catch (error) {
      console.error('Error al completar onboarding:', error);
    } finally {
      await refreshData();
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 py-10">
      <div className="w-full max-w-2xl rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex justify-center gap-2">
          {dots.map((dot) => (
            <span
              key={dot}
              className={`h-2.5 w-2.5 rounded-full ${dot <= step ? 'bg-[var(--signal)]' : 'bg-[var(--bg-subtle)]'}`}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <PulseLogo animated size={76} variant="night" />
            <h1 className="mt-8 text-[32px] font-medium text-[var(--text-primary)]">
              Bienvenido a Pulse, {fullName || 'cliente'}
            </h1>
            <p className="mt-4 max-w-lg text-[14px] text-[var(--text-secondary)]">
              Acá vas a ver en tiempo real cómo está rindiendo tu web.
            </p>
            <Button
              className="mt-8 rounded-[10px] bg-[var(--signal)] px-6 text-white hover:bg-[var(--signal-dim)]"
              onClick={() => setStep(2)}
            >
              Empezar →
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-10 text-center">
            <h1 className="text-[24px] font-medium text-[var(--text-primary)]">¿Cuál es la URL de tu sitio?</h1>
            <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
              La usamos para conectar los datos de visitas.
            </p>

            <div className="mx-auto mt-8 max-w-md">
              <Input
                ariaLabel="URL del sitio"
                className="h-12 rounded-[10px] border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                onChange={(event) => setSiteUrl(event.target.value)}
                placeholder="tuempresa.com"
                value={siteUrl}
              />
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                className="rounded-[10px] bg-[var(--signal)] px-6 text-white hover:bg-[var(--signal-dim)]"
                disabled={submitting}
                onClick={handleContinueToReady}
              >
                Continuar →
              </Button>
              <button
                className="text-sm text-[var(--text-secondary)] underline underline-offset-4"
                onClick={() => setStep(3)}
                type="button"
              >
                Completar después
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--signal-border)] bg-[var(--signal-glow)]">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 52 52">
                <circle
                  cx="26"
                  cy="26"
                  r="22"
                  stroke="var(--signal)"
                  strokeDasharray="138"
                  strokeDashoffset="0"
                  strokeWidth="2.5"
                />
                <path
                  d="M17 27.5l6 6L36 20.5"
                  stroke="var(--signal)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              </svg>
            </div>

            <h1 className="mt-8 text-[24px] font-normal text-[var(--text-primary)]">¡Tu dashboard está listo!</h1>
            <p className="mt-3 max-w-md text-[14px] text-[var(--text-secondary)]">
              En las próximas horas van a aparecer los datos de tu web.
            </p>

            <Button
              className="mt-8 rounded-[10px] bg-[var(--signal)] px-6 text-white hover:bg-[var(--signal-dim)]"
              disabled={submitting}
              onClick={handleFinish}
            >
              Ver mi dashboard →
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
