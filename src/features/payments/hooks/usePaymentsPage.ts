import { useCallback, useEffect, useRef, useState } from 'react';
import { createMercadoPagoPreference, getUserPayments } from '@/lib/services/paymentService';
import { formatCurrency } from '@/lib/mercadopago';
import { toast } from '@/hooks/use-toast';
import type { User } from '@/contexts/appContext.types';
import type { Payment } from '@/types';

interface UsePaymentsPageReturn {
  error: string | null;
  isDetailModalOpen: boolean;
  isPaymentModalOpen: boolean;
  loading: boolean;
  pagos: Payment[];
  processingPayment: boolean;
  selectedPago: Payment | null;
  closeDetailModal: () => void;
  closePaymentModal: () => void;
  handleCreatePayment: (paymentType: string) => Promise<void>;
  handleDownloadInvoice: (payment: Payment) => void;
  handleRetryLoad: () => void;
  openDetailModal: (payment: Payment) => void;
  openPaymentModal: () => void;
}

export function usePaymentsPage(user: User | null): UsePaymentsPageReturn {
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPago, setSelectedPago] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const unsubscribeRef = useRef<VoidFunction | null>(null);

  const clearSyncState = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
  }, []);

  const syncPayments = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    clearSyncState();
    setLoading(true);

    timeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      setError('Tiempo de espera agotado. Verifica tu conexión e inténtalo de nuevo.');
    }, 5000);

    unsubscribeRef.current = getUserPayments(user.id, user.email, (payments) => {
      try {
        setPagos(payments || []);
        setError(null);
        setLoading(false);
      } catch {
        setError('Error al cargar los pagos. Inténtalo de nuevo.');
        setLoading(false);
      } finally {
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    });
  }, [clearSyncState, user]);

  useEffect(() => {
    syncPayments();
    return clearSyncState;
  }, [clearSyncState, syncPayments]);

  const handleDownloadInvoice = useCallback((payment: Payment) => {
    if (!user) {
      return;
    }

    if (payment.invoiceUrl) {
      window.open(payment.invoiceUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const invoiceText = [
      `FACTURA FAC-${payment.id.slice(-6)}`,
      '',
      `Fecha: ${new Date(payment.createdAt).toLocaleDateString('es-AR')}`,
      `Cliente: ${user.full_name || user.email}`,
      `Concepto: ${payment.description}`,
      `Monto: ${formatCurrency(payment.amount, payment.currency)}`,
      `Estado: ${payment.status}`,
    ].join('\n');

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `factura-FAC-${payment.id.slice(-6)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [user]);

  const handleCreatePayment = useCallback(async (paymentType: string) => {
    if (!user) {
      return;
    }

    setProcessingPayment(true);

    try {
      const preference = await createMercadoPagoPreference({
        paymentType,
        userEmail: user.email,
        userId: user.id,
        userName: user.full_name || user.email,
      });

      if (preference.initPoint) {
        window.open(preference.initPoint, '_blank', 'noopener,noreferrer');
        toast({
          title: 'Pago iniciado',
          description: 'Se abrió la página de pago en una nueva pestaña.',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el pago. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  }, [user]);

  return {
    error,
    isDetailModalOpen,
    isPaymentModalOpen,
    loading,
    pagos,
    processingPayment,
    selectedPago,
    closeDetailModal: () => setIsDetailModalOpen(false),
    closePaymentModal: () => setIsPaymentModalOpen(false),
    handleCreatePayment,
    handleDownloadInvoice,
    handleRetryLoad: syncPayments,
    openDetailModal: (payment) => {
      setSelectedPago(payment);
      setIsDetailModalOpen(true);
    },
    openPaymentModal: () => setIsPaymentModalOpen(true),
  };
}
