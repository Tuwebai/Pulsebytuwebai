import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import CreatePaymentDialog from '../components/CreatePaymentDialog';
import PaymentDetailDialog from '../components/PaymentDetailDialog';
import PaymentsHeader from '../components/PaymentsHeader';
import PaymentsSummaryRow from '../components/PaymentsSummaryRow';
import PaymentsTable from '../components/PaymentsTable';
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
    handleRetryPayment,
    handleRetryLoad,
    openDetailModal,
    openPaymentModal,
  } = usePaymentsPage(user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="space-y-6">
      <PaymentsHeader onCreatePayment={openPaymentModal} />

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
        onRetryPayment={handleRetryPayment}
        open={isDetailModalOpen}
        payment={selectedPago}
        processingPayment={processingPayment}
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
