import { ArrowLeft, Dot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PulseLogo, PulseWordmark } from '@/core/components';
import { SUPPORT_CONTACT } from '@/config/supportContact';
import type { LegalDocumentContent } from '@/features/legal/legalContent';

interface LegalDocumentPageProps {
  content: LegalDocumentContent;
}

export default function LegalDocumentPage({ content }: LegalDocumentPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,158,245,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(123,76,212,0.18),transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[20px] border border-[var(--border-default)] bg-[rgba(17,24,39,0.88)] px-4 py-3 shadow-[0_18px_40px_rgba(2,6,23,0.24)] backdrop-blur">
          <div className="flex items-center gap-3">
            <PulseLogo size={38} variant="night" />
            <div>
              <PulseWordmark className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]" />
              <h1 className="text-sm font-medium text-[var(--text-primary)]">{content.title}</h1>
            </div>
          </div>

          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--signal-border)] hover:text-[var(--text-primary)]"
            to="/login"
          >
            <ArrowLeft size={16} />
            Volver al login
          </Link>
        </header>

        <main className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-[28px] border border-[var(--border-default)] bg-[rgba(17,24,39,0.94)] p-6 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-8">
            <div className="mb-8 border-b border-[var(--border-subtle)] pb-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--signal)]">{content.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl">
                {content.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                {content.summary}
              </p>
              <div className="mt-4 inline-flex items-center rounded-full border border-[var(--signal-border)] bg-[var(--signal-glow)] px-3 py-1 text-xs text-[var(--text-primary)]">
                {content.effectiveDateLabel}
              </div>
            </div>

            <div className="space-y-5 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              {content.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {content.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-elevated)]/60 p-4 text-sm leading-6 text-[var(--text-secondary)]"
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-8">
              {content.sections.map((section) => (
                <section key={section.title} className="border-t border-[var(--border-subtle)] pt-8 first:border-t-0 first:pt-0">
                  <h3 className="text-xl font-medium text-[var(--text-primary)]">{section.title}</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.bullets?.length ? (
                    <div className="mt-4 space-y-3">
                      {section.bullets.map((bullet) => (
                        <div key={bullet} className="flex gap-3 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                          <Dot className="mt-1 shrink-0 text-[var(--signal)]" size={20} />
                          <p>{bullet}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-[var(--border-default)] bg-[rgba(17,24,39,0.94)] p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Canales Pulse</p>
              <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                <p>Consultas legales o de privacidad</p>
                <a className="text-[var(--text-primary)] underline underline-offset-4" href={`mailto:${SUPPORT_CONTACT.publicEmail}`}>
                  {SUPPORT_CONTACT.publicEmail}
                </a>
                <p>{SUPPORT_CONTACT.phoneDisplay}</p>
                <p>{SUPPORT_CONTACT.hoursDisplay}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Lectura rápida</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Si tenés dudas concretas sobre tu acceso, tu proyecto o el tratamiento de tus datos, escribinos y lo revisamos
                con contexto real de tu cuenta.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

