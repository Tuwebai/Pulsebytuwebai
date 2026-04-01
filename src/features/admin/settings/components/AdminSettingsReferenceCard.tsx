import { Cog } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AdminSettingsReferenceCard() {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Referencia operativa
          </p>
          <h3 className="text-xl font-semibold text-slate-50">Ajustes internos del equipo</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Configuración base para mantener el panel consistente y listo para endurecer settings después.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)]">
          <Cog className="h-4 w-4 text-[var(--signal)]" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Nombre visible del producto</label>
          <Input defaultValue="Pulse by TuWebAI" className="mt-2 border-white/10 bg-[var(--bg-elevated)]" />
        </div>

        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Huso horario operativo</label>
          <Select defaultValue="art">
            <SelectTrigger className="mt-2 border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">UTC</SelectItem>
              <SelectItem value="art">ART</SelectItem>
              <SelectItem value="est">EST</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Idioma base del equipo</label>
          <Select defaultValue="es">
            <SelectTrigger className="mt-2 border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Estado actual</p>
          <p className="mt-2 text-sm font-medium text-slate-100">Referencia visual lista</p>
        </div>
        <div className="rounded-[18px] border border-dashed border-white/10 bg-[var(--bg-base)]/70 px-4 py-3 text-[13px] text-[var(--text-secondary)]">
          Este bloque todavía no persiste cambios reales. En este slice queda alineado al panel admin y listo para endurecer settings después.
        </div>
      </div>
    </section>
  );
}
