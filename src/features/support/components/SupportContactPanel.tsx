import { Clock3, Mail, MessageCircleHeart } from 'lucide-react';
import { SUPPORT_CONTACT } from '@/config/supportContact';
import { AccentIcon } from '@/core/components';

const contactToneGlowMap = {
  danger:
    'shadow-[0_0_0_1px_var(--danger-dim),0_0_18px_color-mix(in_srgb,var(--danger)_34%,transparent),0_10px_28px_rgba(0,0,0,0.24)]',
  success:
    'shadow-[0_0_0_1px_var(--success-dim),0_0_20px_color-mix(in_srgb,var(--success)_38%,transparent),0_10px_28px_rgba(0,0,0,0.24)]',
  warning:
    'shadow-[0_0_0_1px_var(--warning-dim),0_0_18px_color-mix(in_srgb,var(--warning)_36%,transparent),0_10px_28px_rgba(0,0,0,0.24)]',
  signal:
    'shadow-[0_0_0_1px_var(--signal-glow),0_0_18px_color-mix(in_srgb,var(--signal)_34%,transparent),0_10px_28px_rgba(0,0,0,0.24)]',
} as const;

function ContactRow({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: 'signal' | 'success' | 'warning' | 'danger';
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
      <AccentIcon className={contactToneGlowMap[tone]} tone={tone}>
        {icon}
      </AccentIcon>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-[13px] text-[var(--text-secondary)]">{value}</p>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px] drop-shadow-[0_0_10px_rgba(34,197,94,0.42)]"
      style={{ color: '#22C55E' }}
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
    <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-start gap-3">
        <AccentIcon size="md" tone="signal">
          <MessageCircleHeart className="h-5 w-5 text-[var(--signal)]" strokeWidth={1.5} />
        </AccentIcon>
        <div>
          <h2 className="text-[16px] font-medium text-[var(--text-primary)]">Canales de soporte</h2>
          <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
            Estamos disponibles para ayudarte con dudas de tu web, pagos o seguimiento del proyecto.
          </p>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">Proyectos asociados: {projectsCount}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <ContactRow
          icon={<Mail className="h-4 w-4 text-white" strokeWidth={1.8} />}
          tone="danger"
          title="Email"
          value={SUPPORT_CONTACT.publicEmail}
        />
        <ContactRow
          icon={<WhatsAppIcon />}
          tone="success"
          title="Teléfono"
          value={SUPPORT_CONTACT.phoneDisplay}
        />
        <ContactRow
          icon={<Clock3 className="h-[18px] w-[18px] text-[#FBBF24]" strokeWidth={1.85} />}
          tone="warning"
          title="Horario de atención"
          value={SUPPORT_CONTACT.hoursDisplay}
        />
      </div>
    </section>
  );
}
