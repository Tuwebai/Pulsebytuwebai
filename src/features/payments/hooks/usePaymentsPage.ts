import { useCallback, useEffect, useRef, useState } from 'react';
import { createMercadoPagoPreference, getUserPayments } from '@/features/payments/services/payment.service';
import { toast } from '@/core/notifications/hooks/useToast';
import type { User } from '@/contexts/appContext.types';
import type { Payment } from '@/types';
import { downloadPaymentInvoicePdf } from '../services/paymentInvoice.service';

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
  handleDownloadInvoice: (payment: Payment) => Promise<void>;
  handleRetryPayment: (payment: Payment) => Promise<void>;
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

  useEffect(() => {
    if (!selectedPago) {
      return;
    }

    const nextSelectedPayment = pagos.find((payment) => payment.id === selectedPago.id) ?? null;
    setSelectedPago(nextSelectedPayment);
  }, [pagos, selectedPago]);

  const handleDownloadInvoice = useCallback(async (payment: Payment) => {
    if (!user) {
      return;
    }

    try {
      await downloadPaymentInvoicePdf(payment, user);
    } catch (error) {
      console.error('Error al generar la factura PDF:', error);
      toast({
        title: 'No pudimos descargar la factura',
        description: 'Inténtalo de nuevo en unos segundos.',
        variant: 'destructive',
      });
    }
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

  const handleRetryPayment = useCallback(async (payment: Payment) => {
    if (!payment.paymentType) {
      toast({
        title: 'No pudimos reabrir este pago',
        description: 'Este movimiento no tiene un plan asociado para volver a intentarlo.',
        variant: 'destructive',
      });
      return;
    }

    await handleCreatePayment(payment.paymentType);
  }, [handleCreatePayment]);

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
    handleRetryPayment,
    handleRetryLoad: syncPayments,
    openDetailModal: (payment) => {
      setSelectedPago(payment);
      setIsDetailModalOpen(true);
    },
    openPaymentModal: () => setIsPaymentModalOpen(true),
  };
}
