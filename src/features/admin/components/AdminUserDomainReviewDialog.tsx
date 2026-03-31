import { useState } from 'react';
import { CheckCircle2, Globe, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminUserDomainReviewFields } from '@/features/admin/components/AdminUserDomainReviewFields';
import { AdminUserDialogShell } from '@/features/admin/users/components/AdminUserDialogShell';
import {
  reviewUserWebsite,
  type AdminWebsiteReviewResult,
  type WebsiteReviewStatus,
} from '@/features/admin/services/pulseDomainAdminService';
import { toast } from '@/hooks/use-toast';

export interface AdminDomainUser {
  id: string;
  email: string | null;
  website?: string | null;
  website_status?: WebsiteReviewStatus | null;
  website_review_notes?: string | null;
  project_ga4_property_id?: string | null;
}

interface AdminUserDomainReviewDialogProps {
  user: AdminDomainUser;
  triggerLabel?: string;
  onUpdated: (result: AdminWebsiteReviewResult) => void;
}

function getStatusLabel(status?: WebsiteReviewStatus | null) {
  switch (status) {
    case 'approved':
      return 'Aprobada';
    case 'pending_review':
      return 'Pendiente';
    case 'rejected':
      return 'Rechazada';
    default:
      return 'Sin URL';
  }
}

function getStatusClassName(status?: WebsiteReviewStatus | null) {
  switch (status) {
    case 'approved':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'rejected':
      return 'border-red-500/25 bg-red-500/10 text-red-300';
    case 'pending_review':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    default:
      return 'border-white/10 bg-white/[0.04] text-slate-400';
  }
}

export function AdminUserDomainReviewDialog({
  user,
  triggerLabel = 'Gestionar URL',
  onUpdated,
}: AdminUserDomainReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState(user.website ?? '');
  const [ga4PropertyId, setGa4PropertyId] = useState(user.project_ga4_property_id ?? '');
  const [notes, setNotes] = useState(user.website_review_notes ?? '');
  const [submittingAction, setSubmittingAction] = useState<'save_pending' | 'approve' | 'reject' | null>(null);

  const handleSubmit = async (action: 'save_pending' | 'approve' | 'reject') => {
    try {
      setSubmittingAction(action);
      const result = await reviewUserWebsite({
        userId: user.id,
        domain,
        action,
        ga4PropertyId,
        notes,
      });

      onUpdated(result);
      setOpen(false);

      toast({
        title:
          action === 'approve'
            ? 'URL aprobada'
            : action === 'reject'
              ? 'URL rechazada'
              : 'URL guardada para revisión',
        description:
          action === 'approve'
            ? 'El dominio del cliente quedó listo para Pulse.'
            : action === 'reject'
              ? 'La URL quedó marcada como rechazada para este cliente.'
              : 'La URL quedó pendiente de revisión del equipo.',
      });
    } catch (error) {
      toast({
        title: 'No pudimos actualizar la configuración',
        description: error instanceof Error ? error.message : 'Intentá de nuevo en unos segundos.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDomain(user.website ?? '');
          setGa4PropertyId(user.project_ga4_property_id ?? '');
          setNotes(user.website_review_notes ?? '');
          setOpen(true);
        }}
        className="border-white/10 bg-[var(--bg-base)] text-slate-200 hover:border-white/15 hover:bg-[var(--bg-elevated)]"
      >
        <Globe size={14} className="mr-1.5" />
        {triggerLabel}
      </Button>

      <AdminUserDialogShell
        open={open}
        onOpenChange={setOpen}
        kicker="Pulse admin · dominio"
        title="Revisar URL del cliente"
        description={`Validá la URL de ${user.email ?? 'este cliente'} y dejá listo el dominio para Pulse.`}
        icon={Globe}
        ariaDescribedBy="domain-review-description"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-white/10 bg-[var(--bg-elevated)] text-slate-100 hover:border-white/15 hover:bg-[var(--bg-elevated)]"
            >
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleSubmit('save_pending')}
              disabled={submittingAction !== null}
              className="border-white/10 bg-[var(--bg-base)] text-slate-100 hover:border-white/15 hover:bg-[var(--bg-elevated)]"
            >
              {submittingAction === 'save_pending' ? 'Guardando...' : 'Guardar pendiente'}
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleSubmit('reject')}
              disabled={submittingAction !== null}
              className="border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/15"
            >
              <XCircle size={14} className="mr-1.5" />
              {submittingAction === 'reject' ? 'Procesando...' : 'Rechazar'}
            </Button>
            <Button
              onClick={() => void handleSubmit('approve')}
              disabled={submittingAction !== null}
              className="bg-signal text-white hover:bg-signal/90"
            >
              <CheckCircle2 size={14} className="mr-1.5" />
              {submittingAction === 'approve' ? 'Procesando...' : 'Aprobar URL'}
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={getStatusClassName(user.website_status)}>
            {getStatusLabel(user.website_status)}
          </Badge>
          {user.project_ga4_property_id ? (
            <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-slate-300">
              GA4 configurado
            </Badge>
          ) : null}
        </div>

        <AdminUserDomainReviewFields
          userId={user.id}
          domain={domain}
          ga4PropertyId={ga4PropertyId}
          notes={notes}
          onDomainChange={setDomain}
          onGa4PropertyIdChange={setGa4PropertyId}
          onNotesChange={setNotes}
        />

        <div className="rounded-2xl border border-white/10 bg-[var(--bg-base)] px-4 py-3">
          <p className="text-sm leading-6 text-slate-400">
            Si aprobás la URL, Pulse actualiza el dominio del proyecto más reciente. Si además cargás el Property ID, la conexión con métricas queda lista.
          </p>
        </div>
      </AdminUserDialogShell>
    </>
  );
}
