import { Cog } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { AdminSettingsPreferences } from '@/features/admin/settings/hooks/useAdminSettingsPreferences';

interface AdminSettingsReferenceCardProps {
  preferences: AdminSettingsPreferences;
  onPreferenceChange: <Key extends keyof AdminSettingsPreferences>(
    key: Key,
    value: AdminSettingsPreferences[Key],
  ) => void;
}

export function AdminSettingsReferenceCard({
  preferences,
  onPreferenceChange,
}: AdminSettingsReferenceCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Referencia operativa</p>
          <h3 className="text-xl font-semibold text-slate-50">Base visual del equipo</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Preferencias locales del panel admin para sostener consistencia de trabajo.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)]">
          <Cog className="h-4 w-4 text-[var(--signal)]" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Nombre visible del panel</label>
          <Input
            className="mt-2 border-white/10 bg-[var(--bg-elevated)]"
            onChange={(event) => onPreferenceChange('productLabel', event.target.value)}
            value={preferences.productLabel}
          />
        </div>

        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Huso horario operativo</label>
          <Select
            onValueChange={(value) => onPreferenceChange('timezone', value as AdminSettingsPreferences['timezone'])}
            value={preferences.timezone}
          >
            <SelectTrigger className="mt-2 border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Nueva York</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Idioma base del equipo</label>
          <Select
            onValueChange={(value) => onPreferenceChange('locale', value as AdminSettingsPreferences['locale'])}
            value={preferences.locale}
          >
            <SelectTrigger className="mt-2 border-white/10 bg-[var(--bg-elevated)] text-[var(--text-primary)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es-AR">Español</SelectItem>
              <SelectItem value="en-US">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3 text-[13px] leading-5 text-[var(--text-secondary)]">
        Estos ajustes viven en este navegador. Sirven para ordenar la operación del equipo sin tocar todavía configuraciones sensibles del sistema.
      </div>
    </section>
  );
}
