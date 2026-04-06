import { AlertTriangle } from 'lucide-react';

import { toast } from '@/core/notifications/hooks/useToast';
import { Badge } from '@/core/ui/badge';
import { AccountDeletionRequestDialog } from '@/features/profile/components/AccountDeletionRequestDialog';
import { PROFILE_SURFACE_CLASSNAME } from '@/features/profile/constants/profile.constants';
import { useAccountDeletionRequest } from '@/features/profile/hooks/useAccountDeletionRequest';
import { useRequestAccountDeletion } from '@/features/profile/hooks/useRequestAccountDeletion';

function formatRequestDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function DangerZone() {
  const { data: request, isLoading } = useAccountDeletionRequest();
  const { requestDeletion, isRequesting } = useRequestAccountDeletion();
  const isPending = request?.state === 'pending';
  const deniedResponse = request?.state === 'denied' ? request.response : null;
  const requestedAt = formatRequestDate(request?.requestedAt);

  const handleRequestDeletion = async (reason: string) => {
    try {
      await requestDeletion(reason);
      toast({
        title: 'Solicitud enviada',
        description: 'Tu pedido ya quedó en revisión y el equipo lo va a validar antes de avanzar.',
      });
    } catch (error) {
      toast({
        title: 'No pudimos enviar tu solicitud',
        description: error instanceof Error ? error.message : 'Intentá nuevamente en unos minutos.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section
      className={`${PROFILE_SURFACE_CLASSNAME} border-[rgba(255,92,122,0.3)]`}
      data-tour="profile-danger-zone"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_auto] lg:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--danger-dim)] p-2 text-[var(--danger)]">
            <AlertTriangle className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h3 className="text-[14px] font-medium text-[var(--danger)]">Zona de cuenta</h3>
              <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">
                La baja no se ejecuta automáticamente. Primero la revisa un administrador de TuWebAI.
              </p>
            </div>

            {isLoading ? null : isPending ? (
              <div className="space-y-2">
                <Badge variant="outline" className="border-amber-400/30 bg-amber-500/15 text-amber-100">
                  Solicitud en revisión
                </Badge>
                <p className="text-[13px] leading-5 text-[var(--text-secondary)]">
                  {requestedAt
                    ? `Recibimos tu pedido el ${requestedAt}. Te vamos a avisar cuando quede resuelto.`
                    : 'Tu pedido ya quedó en revisión. Te vamos a avisar cuando quede resuelto.'}
                </p>
              </div>
            ) : deniedResponse ? (
              <div className="space-y-2">
                <Badge variant="outline" className="border-signal/30 bg-signal/10 text-signal">
                  Solicitud revisada
                </Badge>
                <p className="text-[13px] leading-5 text-[var(--text-secondary)]">{deniedResponse}</p>
              </div>
            ) : null}
          </div>
        </div>

        {isPending ? null : (
          <AccountDeletionRequestDialog isBusy={isRequesting} onSubmit={handleRequestDeletion} />
        )}
      </div>
    </section>
  );
}
