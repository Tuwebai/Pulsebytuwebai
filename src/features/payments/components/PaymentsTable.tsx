import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, PulseFeedbackState } from '@/core/components';
import { formatCurrency } from '@/lib/mercadopago';
import type { Payment } from '@/types';
import { getPaymentStatusLabel, getPaymentStatusVariant } from '../payments.utils';

interface PaymentsTableProps {
  error: string | null;
  loading: boolean;
  onCreatePayment: () => void;
  onDownloadInvoice: (payment: Payment) => void;
  onRetryLoad: () => void;
  onSelectPayment: (payment: Payment) => void;
  payments: Payment[];
}

export default function PaymentsTable({
  error,
  loading,
  onCreatePayment,
  onDownloadInvoice,
  onRetryLoad,
  onSelectPayment,
  payments,
}: PaymentsTableProps) {
  if (loading) {
    return (
      <PulseFeedbackState
        description="Estamos sincronizando tu informacion de pagos. Esto puede tomar unos segundos."
        title="Cargando historial de pagos"
        variant="loading"
      />
    );
  }

  if (error) {
    return (
      <PulseFeedbackState
        description={error}
        primaryAction={{
          label: 'Reintentar',
          onClick: onRetryLoad,
        }}
        secondaryAction={{
          label: 'Crear pago',
          onClick: onCreatePayment,
          variant: 'secondary',
        }}
        title="Error al cargar los pagos"
        variant="error"
      />
    );
  }

  if (payments.length === 0) {
    return (
      <PulseFeedbackState
        description="Tu historial va a aparecer aca cuando registres el primer pago o una nueva transaccion quede acreditada."
        primaryAction={{
          label: 'Crear primer pago',
          onClick: onCreatePayment,
        }}
        secondaryAction={{
          label: 'Actualizar',
          onClick: onRetryLoad,
          variant: 'secondary',
        }}
        title="No tienes pagos registrados"
        variant="empty"
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h2 className="text-base font-medium text-[var(--text-primary)]">Historial de pagos</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Lista completa de todos tus pagos y transacciones registradas.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-left text-[10px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              <th className="px-5 py-3 font-medium">Concepto</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Monto</th>
              <th className="px-5 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                className="cursor-pointer border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-elevated)] last:border-b-0"
                key={payment.id}
                onClick={() => onSelectPayment(payment)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--bg-elevated)]">
                      <FileText className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{payment.description}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">ID {payment.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                  {new Date(payment.createdAt).toLocaleDateString('es-AR')}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={getPaymentStatusVariant(payment.status)}>{getPaymentStatusLabel(payment.status)}</Badge>
                </td>
                <td className="px-5 py-4 font-data text-sm text-[var(--text-primary)]">
                  {formatCurrency(payment.amount, payment.currency)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    className="rounded-[10px] border border-[var(--border-default)] bg-transparent px-3 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDownloadInvoice(payment);
                    }}
                    type="button"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
