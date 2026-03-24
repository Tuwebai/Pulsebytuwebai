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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dots = useMemo(() => [1, 2, 3], []);
  const hasDomainInput = siteUrl.trim().length > 0;

  const handleContinueToReady = async () => {
    setErrorMessage(null);

    try {
      if (hasDomainInput) {
        await saveDomain(siteUrl);
      }

      setStep(3);
    } catch (error) {
      console.error('Error al guardar el sitio en onboarding:', error);
      setErrorMessage('No pudimos guardar tu sitio ahora. Podés intentarlo de nuevo o hacerlo después desde Configuración.');
    }
  };

  const handleSkipDomain = () => {
    setErrorMessage(null);
    setStep(3);
  };

  const handleFinish = async () => {
    setErrorMessage(null);

    try {
      await complete();
      await refreshData();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al completar onboarding:', error);
      setErrorMessage('No pudimos terminar tu bienvenida ahora. Probá otra vez en unos segundos.');
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

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">
            {errorMessage}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <PulseLogo animated size={76} variant="night" />
            <h1 className="mt-8 text-[32px] font-medium text-[var(--text-primary)]">
              Bienvenido a Pulse, {fullName || 'cliente'}
            </h1>
            <p className="mt-4 max-w-lg text-[14px] text-[var(--text-secondary)]">
              En pocos segundos vas a tener listo tu espacio para seguir cómo rinde tu web y tu proyecto en un solo lugar.
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
              Podés cargarla ahora para dejarla vinculada o hacerlo después desde Configuración.
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
                {hasDomainInput ? 'Guardar y continuar →' : 'Continuar →'}
              </Button>
              <button
                className="text-sm text-[var(--text-secondary)] underline underline-offset-4"
                onClick={handleSkipDomain}
                type="button"
              >
                Omitir por ahora
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

            <h1 className="mt-8 text-[24px] font-normal text-[var(--text-primary)]">Ya podés entrar a Pulse</h1>
            <p className="mt-3 max-w-md text-[14px] text-[var(--text-secondary)]">
              {hasDomainInput
                ? 'Tu sitio ya quedó registrado. Cuando los datos estén conectados, vas a empezar a ver movimiento acá.'
                : 'Ya podés empezar a usar Pulse. Si después querés sumar tu sitio, lo podés hacer desde Configuración.'}
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
