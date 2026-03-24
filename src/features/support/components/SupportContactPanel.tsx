import { Clock3, Mail, MessageCircleHeart, Phone } from 'lucide-react';

function ContactRow({
  icon,
  title,
  value,
  color
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[12px] border"
        style={{ backgroundColor: `${color}29`, borderColor: `${color}45` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-[13px] text-[var(--text-secondary)]">{value}</p>
      </div>
    </div>
  );
}

interface SupportContactPanelProps {
  projectsCount: number;
}

export default function SupportContactPanel({ projectsCount }: SupportContactPanelProps) {
  return (
    <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[color:rgba(59,158,245,0.25)] bg-[color:rgba(59,158,245,0.14)]">
          <MessageCircleHeart className="h-5 w-5 text-[var(--signal)]" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-[16px] font-medium text-[var(--text-primary)]">Canales de soporte</h2>
          <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
            Estamos disponibles para ayudarte con dudas de tu web, pagos o seguimiento del proyecto.
          </p>
          <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">Proyectos asociados: {projectsCount}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <ContactRow
          color="#3B9EF5"
          icon={<Mail className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.5} />}
          title="Email"
          value="soporte@tuweb-ai.com"
        />
        <ContactRow
          color="#22C55E"
          icon={<Phone className="h-4 w-4 text-[var(--success)]" strokeWidth={1.5} />}
          title="Telefono"
          value="+54 9 3571 417960"
        />
        <ContactRow
          color="#F59E0B"
          icon={<Clock3 className="h-4 w-4 text-[var(--warning)]" strokeWidth={1.5} />}
          title="Horario de atencion"
          value="Lunes a viernes de 9:00 a 20:00"
        />
      </div>
    </section>
  );
}
