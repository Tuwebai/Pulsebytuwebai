import type { ReactNode } from 'react';
import { Clock3, Mail, MessageCircleHeart } from 'lucide-react';
import { SUPPORT_CONTACT } from '@/config/supportContact';

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      style={{ color: 'var(--success)' }}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.11 4.89A9.86 9.86 0 0 0 12.07 2C6.58 2 2.1 6.47 2.1 11.97c0 1.75.46 3.46 1.34 4.97L2 22l5.2-1.36a9.95 9.95 0 0 0 4.77 1.22h.01c5.49 0 9.97-4.47 9.97-9.97 0-2.66-1.04-5.16-2.84-7Zm-7.13 15.3h-.01a8.25 8.25 0 0 1-4.2-1.15l-.3-.17-3.08.81.82-3-.2-.31a8.28 8.28 0 0 1-1.28-4.4c0-4.57 3.72-8.29 8.3-8.29 2.21 0 4.3.86 5.86 2.43a8.24 8.24 0 0 1 2.42 5.87c0 4.57-3.72 8.29-8.3 8.29Zm4.54-6.19c-.25-.12-1.48-.73-1.71-.81-.23-.09-.39-.12-.56.12-.17.24-.64.81-.79.98-.15.18-.29.2-.54.07-.25-.12-1.05-.39-2-1.25-.74-.66-1.25-1.48-1.39-1.73-.15-.24-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.24.25-.41.08-.18.04-.33-.02-.46-.07-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.45.06-.69.32-.24.27-.91.89-.91 2.16 0 1.27.94 2.51 1.07 2.68.13.18 1.82 2.78 4.41 3.89.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.48-.6 1.69-1.18.21-.58.21-1.07.15-1.17-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}

interface SupportContactPanelProps {
  projectsCount: number;
}

export default function SupportContactPanel({ projectsCount }: SupportContactPanelProps) {
  return (
    <section className="flex h-full flex-col rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/92 p-4 shadow-2xl sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--signal-glow)] text-[var(--signal)]">
          <MessageCircleHeart className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Canales activos</p>
          <h2 className="mt-2 text-lg font-medium text-[var(--text-primary)]">Cómo hablar con el equipo</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Si necesitas ayuda con tu web, pagos o seguimiento, acá tienes los canales disponibles.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <ContactRow
          icon={<Mail className="h-4 w-4" strokeWidth={1.7} />}
          title="Email principal"
          toneClassName="bg-[var(--signal-glow)] text-[var(--signal)]"
          value={SUPPORT_CONTACT.publicEmail}
        />
        <ContactRow
          icon={<WhatsAppIcon />}
          title="WhatsApp"
          toneClassName="bg-[var(--success-dim)] text-[var(--success)]"
          value={SUPPORT_CONTACT.phoneDisplay}
        />
        <ContactRow
          icon={<Clock3 className="h-4 w-4" strokeWidth={1.7} />}
          title="Horario de atención"
          toneClassName="bg-[var(--warning-dim)] text-[var(--warning)]"
          value={SUPPORT_CONTACT.hoursDisplay}
        />
      </div>

      <div className="mt-auto rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-elevated)]/55 px-4 py-3 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Contexto actual</p>
        <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">Proyectos asociados: {projectsCount}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Esto nos ayuda a responder con más contexto cuando abras una consulta.</p>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  title,
  toneClassName,
  value,
}: {
  icon: ReactNode;
  title: string;
  toneClassName: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-elevated)]/55 px-4 py-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClassName}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{value}</p>
      </div>
    </div>
  );
}
