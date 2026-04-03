import { PulseFeedbackState } from '@/core/components';
import type { Payment } from '@/types';
import PaymentsTableDesktop from './PaymentsTableDesktop';
import PaymentsTableMobile from './PaymentsTableMobile';

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
        description="Estamos sincronizando tu información de pagos. Esto puede tomar unos segundos."
        title="Cargando historial de pagos"
        variant="loading"
      />
    );
  }

  if (error) {
    return (
      <PulseFeedbackState
        description={error}
        primaryAction={{ label: 'Reintentar', onClick: onRetryLoad }}
        secondaryAction={{ label: 'Crear pago', onClick: onCreatePayment, variant: 'secondary' }}
        title="Error al cargar los pagos"
        variant="error"
      />
    );
  }

  if (payments.length === 0) {
    return (
      <PulseFeedbackState
        description="Tu historial va a aparecer acá cuando registres el primer pago o una nueva transacción quede acreditada."
        primaryAction={{ label: 'Crear primer pago', onClick: onCreatePayment }}
        secondaryAction={{ label: 'Actualizar', onClick: onRetryLoad, variant: 'secondary' }}
        title="Todavía no tienes pagos registrados"
        variant="empty"
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bandeja activa</p>
        <h2 className="mt-2 text-xl font-medium text-slate-50">Historial de pagos</h2>
        <p className="mt-1 max-w-[680px] text-sm text-slate-400">
          Encontrá tus movimientos, revisá el estado de cada cobro y descargá la factura sin salir de Pulse.
        </p>
      </div>

      <div className="mt-5">
        <PaymentsTableMobile
          onDownloadInvoice={onDownloadInvoice}
          onSelectPayment={onSelectPayment}
          payments={payments}
        />
        <PaymentsTableDesktop
          onDownloadInvoice={onDownloadInvoice}
          onSelectPayment={onSelectPayment}
          payments={payments}
        />
      </div>
    </section>
  );
}
