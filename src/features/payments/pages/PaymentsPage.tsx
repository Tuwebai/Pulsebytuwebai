import { Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import PaymentsSummaryRow from '../components/PaymentsSummaryRow';
import PaymentsTable from '../components/PaymentsTable';
import CreatePaymentDialog from '../components/CreatePaymentDialog';
import PaymentDetailDialog from '../components/PaymentDetailDialog';
import { usePaymentsPage } from '../hooks/usePaymentsPage';

export default function PaymentsPage() {
  const { user } = useApp();
  const {
    error,
    isDetailModalOpen,
    isPaymentModalOpen,
    loading,
    pagos,
    processingPayment,
    selectedPago,
    closeDetailModal,
    closePaymentModal,
    handleCreatePayment,
    handleDownloadInvoice,
    handleRetryLoad,
    openDetailModal,
    openPaymentModal,
  } = usePaymentsPage(user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">Pagos</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Revisá tu historial de pagos, estados de cobro y facturas desde un solo lugar.
          </p>
        </div>

        <Button
          className="rounded-[10px] bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]"
          onClick={openPaymentModal}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Nuevo pago
        </Button>
      </section>

      <PaymentsSummaryRow payments={pagos} />

      <PaymentsTable
        error={error}
        loading={loading}
        onCreatePayment={openPaymentModal}
        onDownloadInvoice={handleDownloadInvoice}
        onRetryLoad={handleRetryLoad}
        onSelectPayment={openDetailModal}
        payments={pagos}
      />

      <PaymentDetailDialog
        onClose={closeDetailModal}
        onDownloadInvoice={handleDownloadInvoice}
        open={isDetailModalOpen}
        payment={selectedPago}
      />

      <CreatePaymentDialog
        onClose={closePaymentModal}
        onCreatePayment={handleCreatePayment}
        open={isPaymentModalOpen}
        processingPayment={processingPayment}
      />
    </div>
  );
}
