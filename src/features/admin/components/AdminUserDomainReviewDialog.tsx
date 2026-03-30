import { useMemo, useState } from 'react';
import { CheckCircle2, Globe, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

function getStatusVariant(status?: WebsiteReviewStatus | null): 'default' | 'secondary' {
  if (status === 'approved') {
    return 'default';
  }

  return 'secondary';
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

  const statusLabel = useMemo(() => getStatusLabel(user.website_status), [user.website_status]);

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
              : 'URL guardada para revision',
        description:
          action === 'approve'
            ? result.project_created
              ? result.project_ga4_property_id
                ? 'La URL quedó aprobada, creamos el proyecto operativo y también quedó cargado el Property ID de GA4.'
                : 'La URL quedó aprobada y también creamos el proyecto operativo del cliente en Pulse.'
              : result.project_ga4_property_id
                ? 'El dominio quedó listo en el proyecto y también guardamos el Property ID de GA4.'
                : 'El dominio ya quedó listo para usarse en el proyecto del cliente.'
            : action === 'reject'
              ? 'La URL quedó marcada como rechazada para este cliente.'
              : 'La URL quedó pendiente para revisión del equipo.',
      });
    } catch (error) {
      toast({
        title: 'No pudimos actualizar la configuración',
        description: error instanceof Error ? error.message : 'Intenta de nuevo en unos segundos.',
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
        className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900/30 dark:border-slate-700 dark:text-slate-200"
      >
        <Globe size={14} className="mr-1" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-[var(--text-primary)]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle>Revisión de URL del cliente</DialogTitle>
              <Badge variant={getStatusVariant(user.website_status)}>{statusLabel}</Badge>
            </div>
            <DialogDescription className="text-[var(--text-secondary)]">
              Cliente: {user.email ?? 'Sin email'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor={`admin-domain-${user.id}`}>
                URL propuesta
              </label>
              <Input
                id={`admin-domain-${user.id}`}
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="tuempresa.com"
                className="border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor={`admin-ga4-${user.id}`}>
                Property ID de GA4
              </label>
              <Input
                id={`admin-ga4-${user.id}`}
                value={ga4PropertyId}
                onChange={(event) => setGa4PropertyId(event.target.value)}
                placeholder="123456789"
                inputMode="numeric"
                className="border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Opcional. Si lo completás al aprobar, Pulse ya queda listo para la ingesta real de métricas.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor={`admin-domain-notes-${user.id}`}>
                Notas internas
              </label>
              <Textarea
                id={`admin-domain-notes-${user.id}`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ejemplo: esperar confirmación del cliente o corregir subdominio."
                className="min-h-[96px] border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
              />
            </div>

            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Si aprobás la URL, también se actualiza el dominio del proyecto más reciente del cliente. Si completás el Property ID, dejás listo el proyecto para la conexión real de GA4.
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => void handleSubmit('save_pending')}
                loading={submittingAction === 'save_pending'}
              >
                Guardar pendiente
              </Button>
              <Button
                variant="outline"
                onClick={() => void handleSubmit('reject')}
                loading={submittingAction === 'reject'}
                leftIcon={<XCircle size={14} />}
              >
                Rechazar
              </Button>
              <Button
                onClick={() => void handleSubmit('approve')}
                loading={submittingAction === 'approve'}
                leftIcon={<CheckCircle2 size={14} />}
              >
                Aprobar URL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
