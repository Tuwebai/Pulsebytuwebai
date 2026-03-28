import { Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminSettingsReferenceCardProps {
  onSaveReference: () => void;
}

export function AdminSettingsReferenceCard({ onSaveReference }: AdminSettingsReferenceCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-3">
        <div className="rounded-[16px] border border-[var(--signal-border)] bg-[var(--signal-glow)] p-3">
          <Cog className="h-5 w-5 text-[var(--signal)]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-[20px] font-medium text-[var(--text-primary)]">Referencia operativa</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Ajustes internos para mantener el lenguaje del panel consistente.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Nombre visible del producto</label>
          <Input defaultValue="Pulse by TuWebAI" className="mt-2 border-white/10 bg-[var(--bg-elevated)]" />
        </div>

        <div>
          <label className="text-[13px] font-medium text-[var(--text-primary)]">Huso horario operativo</label>
          <Select defaultValue="utc">
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

      <div className="mt-5 rounded-[18px] border border-dashed border-white/10 bg-[var(--bg-base)]/70 px-4 py-3 text-[13px] text-[var(--text-secondary)]">
        Esta referencia todavía no persiste cambios. El objetivo de este slice es separar la cuenta admin del perfil
        cliente y dejar la superficie lista para endurecer settings después.
      </div>

      <div className="mt-5 flex justify-end">
        <Button className="bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]" onClick={onSaveReference}>
          Guardar referencia
        </Button>
      </div>
    </section>
  );
}
