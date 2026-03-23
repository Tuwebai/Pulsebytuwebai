import { Button } from '@/components/ui/button';
import { PulseLogo } from './PulseLogo';

export interface PulseEmptyStateProps {
  onConnect?: () => void;
}

const WHATSAPP_SUPPORT_URL = 'https://wa.me/5491130187377?text=Necesito%20ayuda%20con%20Pulse';

export default function PulseEmptyState({ onConnect }: PulseEmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--signal-glow)]"
        style={{ boxShadow: '0 0 40px var(--signal-glow)' }}
      >
        <PulseLogo animated size={56} variant="night" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-[var(--text-primary)]">Los datos de tu web aparecen acá</h2>
        <p className="max-w-xl text-sm text-[var(--text-secondary)]">
          Conectá tu dominio para ver cuántas personas te están visitando cada día.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button
          className="rounded-[10px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
          onClick={onConnect}
        >
          Conectar mi web →
        </Button>

        <a
          className="text-sm text-[var(--text-secondary)] underline decoration-[var(--border-strong)] underline-offset-4 transition-colors hover:text-[var(--signal)]"
          href={WHATSAPP_SUPPORT_URL}
          rel="noreferrer"
          target="_blank"
        >
          ¿Necesitás ayuda? Escribinos
        </a>
      </div>
    </div>
  );
}
