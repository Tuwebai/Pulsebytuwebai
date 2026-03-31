import { Navigate } from 'react-router-dom';
import {
  SupportContactPanel,
  SupportResponseModal,
  SupportSummaryRow,
  SupportTicketForm,
  SupportTicketsPanel,
} from '@/features/support';
import { useSupportPage } from '@/features/support/hooks/useSupportPage';

export default function SupportPage() {
  const support = useSupportPage();

  if (!support.user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-tour="support-header">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Soporte</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Hacé seguimiento de tus consultas y mantené la conversación con el equipo en un solo lugar.
            </p>
          </div>
        </section>

        <div data-tour="support-summary">
          <SupportSummaryRow
            closedCount={support.closedTickets}
            openCount={support.openTickets}
            progressCount={support.progressTickets}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div data-tour="support-contact">
            <SupportContactPanel projectsCount={support.projectsCount} />
          </div>
          <div data-tour="support-form">
            <SupportTicketForm formData={support.formData} onChange={support.setFormData} onSubmit={support.handleSubmitTicket} />
          </div>
        </div>

        <div data-tour="support-tickets">
          <SupportTicketsPanel
            error={support.error}
            loading={support.loading}
            tickets={support.tickets}
            userEmail={support.user.email}
            onReply={support.setRespondingTicketId}
            onRetry={support.handleRetryLoad}
          />
        </div>
      </div>

      <SupportResponseModal
        responseText={support.responseText}
        ticket={support.respondingTicket}
        onChange={support.setResponseText}
        onClose={() => {
          support.setRespondingTicketId(null);
          support.setResponseText('');
        }}
        onSubmit={() => {
          void support.handleClientResponse();
        }}
      />
    </>
  );
}
