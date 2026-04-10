import { ArrowRight, Bell, ChartNoAxesCombined, LifeBuoy, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORT_CONTACT } from '@/config/supportContact';
import { PulseLogo, PulseWordmark } from '@/core/components';
import { useApp } from '@/contexts/useApp';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';
import { pulsePublicHomeHighlights, pulsePublicHomeSections } from '@/features/marketing/pulsePublicHome.content';

const featureIcons = [ChartNoAxesCombined, LifeBuoy, Bell];

export default function PulsePublicHomePage() {
  const { authReady, isAuthenticated, user } = useApp();
  const primaryHref = authReady && isAuthenticated ? getPostLoginPath(user) : '/login';
  const primaryLabel = authReady && isAuthenticated ? 'Ir a Pulse' : 'Ingresar a Pulse';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,158,245,0.20),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(123,76,212,0.16),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[22px] border border-[var(--border-default)] bg-[rgba(17,24,39,0.86)] px-4 py-3 shadow-[0_18px_40px_rgba(2,6,23,0.24)] backdrop-blur">
          <div className="flex items-center gap-3">
            <PulseLogo animated size={42} variant="night" />
            <div>
              <PulseWordmark className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Dashboard privado para clientes</p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" to="/politica-privacidad">
              Privacidad
            </Link>
            <Link className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" to="/terminos-condiciones">
              Términos
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-[var(--signal-border)] bg-[var(--signal-glow)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--signal)]"
              to={primaryHref}
            >
              {primaryLabel}
              <ArrowRight size={16} />
            </Link>
          </nav>
        </header>

        <main className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:py-14">
          <section className="rounded-[30px] border border-[var(--border-default)] bg-[rgba(17,24,39,0.90)] p-6 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-8 lg:p-10">
            <div className="inline-flex items-center rounded-full border border-[var(--signal-border)] bg-[var(--signal-glow)] px-3 py-1 text-xs text-[var(--text-primary)]">
              Seguimiento claro, soporte real y contexto útil
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-medium tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
              <PulseWordmark /> ordena métricas, proyecto y soporte en una sola vista.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              Pulse es el espacio privado donde cada cliente puede entender qué está pasando con su web, qué avances ya están
              en curso y qué decisiones siguen en agenda, sin perderse en lenguaje técnico.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-[var(--signal)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--signal-dim)]"
                to={primaryHref}
              >
                {primaryLabel}
                <ArrowRight size={16} />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-5 py-3 text-sm text-[var(--text-secondary)] transition hover:border-[var(--signal-border)] hover:text-[var(--text-primary)]"
                to="/login"
              >
                Acceso por invitación
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {pulsePublicHomeHighlights.map((highlight) => (
                <div key={highlight} className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-elevated)]/60 p-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {highlight}
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            {pulsePublicHomeSections.map((section, index) => {
              const Icon = featureIcons[index] ?? ShieldCheck;

              return (
                <div key={section.title} className="rounded-[24px] border border-[var(--border-default)] bg-[rgba(17,24,39,0.92)] p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-[var(--signal-border)] bg-[var(--signal-glow)] p-2 text-[var(--signal)]">
                      <Icon size={18} />
                    </div>
                    <h2 className="text-lg font-medium text-[var(--text-primary)]">{section.title}</h2>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{section.body}</p>
                </div>
              );
            })}

            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-[var(--signal-border)] bg-[var(--signal-glow)] p-2 text-[var(--signal)]">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-lg font-medium text-[var(--text-primary)]">Información pública para acceso seguro</h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                Esta página explica el propósito de Pulse, cómo funciona el acceso y dónde consultar nuestras políticas para
                privacidad y términos del servicio.
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                Contacto: <a className="text-[var(--text-primary)] underline underline-offset-4" href={`mailto:${SUPPORT_CONTACT.publicEmail}`}>{SUPPORT_CONTACT.publicEmail}</a>
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}



