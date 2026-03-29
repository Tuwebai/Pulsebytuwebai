import { PulseEmptyState } from '@/core/components';
import { usePulseDomainRequest } from '../hooks/usePulseDomainRequest';
import PulseDomainRequestDialog from './PulseDomainRequestDialog';

interface PulseDomainRequestGateProps {
  ga4PropertyId?: string | null;
  hasProject?: boolean;
}

function getConnectLabel(status: 'missing' | 'pending_review' | 'approved' | 'rejected', hasReachedLimit: boolean) {
  if (status === 'pending_review' || status === 'approved' || hasReachedLimit) {
    return 'Ver estado del dominio ->';
  }

  return status === 'rejected' ? 'Reenviar dominio ->' : 'Enviar dominio ->';
}

export default function PulseDomainRequestGate({ ga4PropertyId, hasProject = true }: PulseDomainRequestGateProps) {
  const domainRequest = usePulseDomainRequest();

  return (
    <>
      <PulseEmptyState
        connectLabel={getConnectLabel(domainRequest.status, domainRequest.hasReachedLimit)}
        ga4PropertyId={ga4PropertyId}
        hasProject={hasProject}
        onConnect={domainRequest.openDialog}
        website={domainRequest.website}
        websiteStatus={domainRequest.status}
      />
      <PulseDomainRequestDialog
        canSubmit={domainRequest.canSubmit}
        domain={domainRequest.domain}
        hasReachedLimit={domainRequest.hasReachedLimit}
        onDomainChange={domainRequest.setDomain}
        onOpenChange={domainRequest.setOpen}
        onSubmit={domainRequest.submit}
        open={domainRequest.open}
        remainingAttempts={domainRequest.remainingAttempts}
        status={domainRequest.status}
        submitting={domainRequest.submitting}
        website={domainRequest.website}
        websiteReviewNotes={domainRequest.websiteReviewNotes}
      />
    </>
  );
}
