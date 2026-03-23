import { AlertCircle, CreditCard, Download, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/core/components';
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
  payments
}: PaymentsTableProps) {
  if (loading) {
    return (
      <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--signal)]" />
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Cargando historial de pagos</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Estamos sincronizando tu información de pagos. Esto puede tomar unos segundos.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger-dim)]">
            <AlertCircle className="h-8 w-8 text-[var(--danger)]" strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 text-lg font-medium text-[var(--text-primary)]">Error al cargar los pagos</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{error}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="rounded-[10px] bg-[var(--signal)] px-5 text-white hover:bg-[var(--signal-dim)]"
              onClick={onRetryLoad}
              type="button"
            >
              <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Reintentar
            </Button>
            <Button
              className="rounded-[10px] border border-[var(--border-default)] bg-transparent px-5 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              onClick={onCreatePayment}
              type="button"
              variant="outline"
            >
              Crear pago
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (payments.length === 0) {
    return (
      <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-14">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
            <CreditCard className="h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 text-lg font-medium text-[var(--text-primary)]">No tienes pagos registrados</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            Tu historial va a aparecer acá cuando registres el primer pago o una nueva transacción quede acreditada.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="rounded-[10px] bg-[var(--signal)] px-5 text-white hover:bg-[var(--signal-dim)]"
              onClick={onCreatePayment}
              type="button"
            >
              Crear primer pago
            </Button>
            <Button
              className="rounded-[10px] border border-[var(--border-default)] bg-transparent px-5 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              onClick={onRetryLoad}
              type="button"
              variant="outline"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </section>
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
                  <Badge variant={getPaymentStatusVariant(payment.status)}>
                    {getPaymentStatusLabel(payment.status)}
                  </Badge>
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
