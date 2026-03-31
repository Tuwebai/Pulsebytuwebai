import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AdminUserDomainReviewFieldsProps {
  userId: string;
  domain: string;
  ga4PropertyId: string;
  notes: string;
  onDomainChange: (value: string) => void;
  onGa4PropertyIdChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export function AdminUserDomainReviewFields({
  userId,
  domain,
  ga4PropertyId,
  notes,
  onDomainChange,
  onGa4PropertyIdChange,
  onNotesChange,
}: AdminUserDomainReviewFieldsProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/70 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor={`admin-domain-${userId}`}>
          URL propuesta
        </label>
        <Input
          id={`admin-domain-${userId}`}
          value={domain}
          onChange={(event) => onDomainChange(event.target.value)}
          placeholder="tuempresa.com"
          className="h-10 border-white/10 bg-[var(--bg-base)] text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor={`admin-ga4-${userId}`}>
          Property ID de GA4
        </label>
        <Input
          id={`admin-ga4-${userId}`}
          value={ga4PropertyId}
          onChange={(event) => onGa4PropertyIdChange(event.target.value)}
          placeholder="123456789"
          inputMode="numeric"
          className="h-10 border-white/10 bg-[var(--bg-base)] text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200" htmlFor={`admin-domain-notes-${userId}`}>
          Notas del equipo
        </label>
        <Textarea
          id={`admin-domain-notes-${userId}`}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Ejemplo: falta corregir subdominio o esperar confirmación del cliente."
          className="min-h-[96px] border-white/10 bg-[var(--bg-base)] text-slate-100 placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}
