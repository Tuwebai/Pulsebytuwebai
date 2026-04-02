import { Navigate } from 'react-router-dom';
import {
  SupportContactPanel,
  SupportHeader,
  SupportSummaryRow,
  SupportTicketForm,
  SupportTicketsPanel,
} from '@/features/support';
import { storeSupportChatIntent } from '@/features/support/supportChat.events';
import { useSupportPage } from '@/features/support/hooks/useSupportPage';

export default function SupportPage() {
  const support = useSupportPage();

  if (!support.user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <div className="space-y-6">
        <div data-tour="support-header">
          <SupportHeader />
        </div>

        <div data-tour="support-summary">
          <SupportSummaryRow
            closedCount={support.closedTickets}
            openCount={support.openTickets}
            progressCount={support.progressTickets}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
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
            onReply={(ticketId) => storeSupportChatIntent({ scope: 'client', ticketId, focusInput: true })}
            onRetry={support.handleRetryLoad}
          />
        </div>
      </div>
    </>
  );
}
