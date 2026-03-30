import React, { useEffect, useState } from 'react';
import { CreditCard, Download, Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/core/components';
import { useApp } from '@/contexts/AppContext';
import { PaymentsSummaryRow, PaymentsTable } from '@/features/payments';
import { getPaymentStatusLabel, getPaymentStatusVariant } from '@/features/payments/payments.utils';
import { PAYMENT_TYPES, formatCurrency } from '@/lib/mercadopago';
import { createMercadoPagoPreference, getUserPayments } from '@/lib/services/paymentService';
import { toast } from '@/hooks/use-toast';
import type { Payment } from '@/types';

const Facturacion = React.memo(() => {
  const { user } = useApp();
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPago, setSelectedPago] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = getUserPayments(user.id, user.email, (payments) => {
      try {
        setPagos(payments || []);
        setError(null);
        setLoading(false);
        clearTimeout(timeoutId);
      } catch {
        setError('Error al cargar los pagos. Inténtalo de nuevo.');
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleDownloadInvoice = (payment: Payment) => {
    if (payment.invoiceUrl) {
      window.open(payment.invoiceUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const invoiceData = {
      amount: formatCurrency(payment.amount, payment.currency),
      client: user.full_name || user.email,
      concept: payment.description,
      date: new Date(payment.createdAt).toLocaleDateString('es-AR'),
      number: `FAC-${payment.id.slice(-6)}`,
      status: payment.status
    };

    const invoiceText = [
      `FACTURA ${invoiceData.number}`,
      '',
      `Fecha: ${invoiceData.date}`,
      `Cliente: ${invoiceData.client}`,
      `Concepto: ${invoiceData.concept}`,
      `Monto: ${invoiceData.amount}`,
      `Estado: ${getPaymentStatusLabel(invoiceData.status)}`
    ].join('\n');

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `factura-${invoiceData.number}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleRetryLoad = () => {
    setLoading(true);
    setError(null);
    setPagos([]);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Tiempo de espera agotado. Verifica tu conexión e inténtalo de nuevo.');
    }, 5000);

    const unsubscribe = getUserPayments(user.id, user.email, (payments) => {
      try {
        setPagos(payments || []);
        setError(null);
        setLoading(false);
        clearTimeout(timeoutId);
      } catch {
        setError('Error al cargar los pagos. Inténtalo de nuevo.');
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  };

  const handleCreatePayment = async (paymentType: string) => {
    setProcessingPayment(true);

    try {
      const preference = await createMercadoPagoPreference({
        paymentType,
        userEmail: user.email,
        userId: user.id,
        userName: user.full_name || user.email
      });

      if (preference.initPoint) {
        window.open(preference.initPoint, '_blank', 'noopener,noreferrer');
        toast({
          title: 'Pago iniciado',
          description: 'Se abrió la página de pago en una nueva pestaña.'
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el pago. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

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
          onClick={() => setIsPaymentModalOpen(true)}
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
        onCreatePayment={() => setIsPaymentModalOpen(true)}
        onDownloadInvoice={handleDownloadInvoice}
        onRetryLoad={handleRetryLoad}
        onSelectPayment={(payment) => {
          setSelectedPago(payment);
          setIsDetailModalOpen(true);
        }}
        payments={pagos}
      />

      <Dialog onOpenChange={setIsDetailModalOpen} open={isDetailModalOpen}>
        <DialogContent className="max-w-2xl rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
          {selectedPago ? (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-medium text-[var(--text-primary)]">Detalle del pago</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="ID" value={selectedPago.id} />
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">Estado</p>
                  <div className="mt-2">
                    <Badge variant={getPaymentStatusVariant(selectedPago.status)}>
                      {getPaymentStatusLabel(selectedPago.status)}
                    </Badge>
                  </div>
                </div>
                <DetailItem label="Monto" monospace value={formatCurrency(selectedPago.amount, selectedPago.currency)} />
                <DetailItem
                  label="Fecha"
                  value={new Date(selectedPago.createdAt).toLocaleDateString('es-AR')}
                />
                <div className="md:col-span-2">
                  <DetailItem label="Descripción" value={selectedPago.description} />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button
                  className="rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  onClick={() => setIsDetailModalOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cerrar
                </Button>
                <Button
                  className="rounded-[10px] bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]"
                  onClick={() => handleDownloadInvoice(selectedPago)}
                  type="button"
                >
                  <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Descargar factura
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsPaymentModalOpen} open={isPaymentModalOpen}>
        <DialogContent className="max-w-2xl rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-[var(--text-primary)]">Crear nuevo pago</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(PAYMENT_TYPES).map(([key, value]) => (
                <button
                  className="rounded-[14px] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-5 text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={processingPayment}
                  key={key}
                  onClick={() => void handleCreatePayment(key)}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--bg-surface)]">
                      <CreditCard className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{value.label}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{value.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                className="rounded-[10px] border border-[var(--border-default)] bg-transparent px-4 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                onClick={() => setIsPaymentModalOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

function DetailItem({
  label,
  value,
  monospace = false
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-2 text-sm text-[var(--text-primary)] ${monospace ? 'font-data' : ''}`}>{value}</p>
    </div>
  );
}

Facturacion.displayName = 'Facturacion';

export default Facturacion;
