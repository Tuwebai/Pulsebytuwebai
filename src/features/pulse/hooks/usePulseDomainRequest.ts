import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/core/notifications/hooks/useToast';
import {
  canSubmitDomainRequest,
  getDomainRequestAttemptCount,
  saveDomainRequestAttemptCount,
  submitPulseDomainRequest,
} from '../services/pulseDomainRequest.service';

export function usePulseDomainRequest() {
  const { refreshData, updateUserSettings, user } = useApp();
  const [domain, setDomain] = useState(user?.website ?? '');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDomain(user?.website ?? '');
  }, [user?.website]);

  const attemptCount = useMemo(
    () => getDomainRequestAttemptCount(user ? { id: user.id, website_submitted_at: user.website_submitted_at ?? null } : null),
    [user],
  );

  const status = user?.website_status ?? 'missing';
  const canSubmit = canSubmitDomainRequest(status, attemptCount);
  const hasReachedLimit = !canSubmit && status === 'rejected';

  const openDialog = () => setOpen(true);

  const submit = async () => {
    if (!user?.id || !canSubmit) {
      return false;
    }

    setSubmitting(true);

    try {
      const result = await submitPulseDomainRequest(user.id, domain);
      const nextAttemptCount = Math.max(attemptCount + 1, 1);

      saveDomainRequestAttemptCount(user.id, nextAttemptCount);
      await updateUserSettings({
        website: result.normalizedDomain,
        website_status: 'pending_review',
        website_submitted_at: new Date().toISOString(),
        website_reviewed_at: null,
        website_reviewed_by: null,
        website_review_notes: null,
      });
      await refreshData();

      toast({
        title: 'Dominio enviado',
        description: 'Ya recibimos tu dominio. Nuestro equipo lo va a revisar para dejar Pulse listo con tus datos reales.',
      });

      setOpen(false);
      return true;
    } catch (error) {
      toast({
        title: 'No pudimos enviar el dominio',
        description:
          error instanceof Error
            ? error.message
            : 'Probá de nuevo en unos segundos o escribinos si necesitás ayuda.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    attemptCount,
    canSubmit,
    domain,
    hasReachedLimit,
    open,
    openDialog,
    setDomain,
    setOpen,
    status,
    submit,
    submitting,
    website: user?.website ?? null,
    websiteReviewNotes: user?.website_review_notes ?? null,
  };
}
