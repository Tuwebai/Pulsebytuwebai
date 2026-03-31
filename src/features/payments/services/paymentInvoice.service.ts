import { PAYMENT_TYPES, formatCurrency } from '@/lib/mercadopago';
import type { User } from '@/contexts/appContext.types';
import type { Payment } from '@/types';
import { getPaymentPlanName, getPaymentStatusLabel } from '../payments.utils';

function sanitizeSegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getInvoiceFileName(payment: Payment): string {
  const planSegment = sanitizeSegment(getPaymentPlanName(payment)) || 'plan';
  const dateSegment = new Date(payment.createdAt).toLocaleDateString('sv-SE');
  return `factura-pulse-${planSegment}-${dateSegment}.pdf`;
}

function buildInvoiceHtml(payment: Payment, user: User) {
  const paymentType = PAYMENT_TYPES[payment.paymentType as keyof typeof PAYMENT_TYPES];
  const features = payment.features.length > 0 ? payment.features : paymentType?.features ?? [];
  const customerName = user.full_name || user.email;
  const amount = formatCurrency(payment.amount, payment.currency);
  const paidDate = new Date(payment.paidAt || payment.updatedAt || payment.createdAt).toLocaleDateString('es-AR');

  return `
    <div style="width:900px;background:#0b0f1e;color:#f0f4ff;font-family:'DM Sans',Arial,sans-serif;padding:40px 44px;">
      <div style="border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);background:linear-gradient(180deg,#121a31 0%,#17142d 100%);box-shadow:0 24px 64px rgba(0,0,0,0.42);">
        <div style="padding:32px 36px;background:radial-gradient(circle at top center, rgba(59,158,245,0.2), transparent 35%),radial-gradient(circle at top right, rgba(123,76,212,0.22), transparent 32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent 26%);border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-start;">
            <div>
              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#3b9ef5;font-weight:600;">Factura Pulse</div>
              <h1 style="margin:14px 0 0;font-size:34px;line-height:1.05;font-weight:700;">${getPaymentPlanName(payment)}</h1>
              <p style="margin:12px 0 0;color:#8b9ac0;font-size:14px;line-height:1.6;max-width:460px;">
                Comprobante del plan contratado desde Pulse para tu sitio web.
              </p>
            </div>
            <div style="min-width:230px;border:1px solid rgba(59,158,245,0.18);background:rgba(7,13,24,0.42);border-radius:20px;padding:18px 20px;">
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8b9ac0;">Resumen</div>
              <div style="margin-top:12px;font-size:30px;font-weight:700;">${amount}</div>
              <div style="margin-top:10px;font-size:13px;color:#8b9ac0;">Estado: ${getPaymentStatusLabel(payment.status)}</div>
              <div style="margin-top:4px;font-size:13px;color:#8b9ac0;">Emitida: ${paidDate}</div>
            </div>
          </div>
        </div>
        <div style="padding:30px 36px 34px;">
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">
            <div style="border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px 20px;background:rgba(255,255,255,0.02);">
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#4a5580;">Cliente</div>
              <div style="margin-top:10px;font-size:18px;font-weight:600;">${customerName}</div>
              <div style="margin-top:6px;color:#8b9ac0;font-size:14px;">${user.email}</div>
            </div>
            <div style="border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px 20px;background:rgba(255,255,255,0.02);">
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#4a5580;">Referencia</div>
              <div style="margin-top:10px;font-size:18px;font-weight:600;">FAC-${payment.id.slice(-6).toUpperCase()}</div>
              <div style="margin-top:6px;color:#8b9ac0;font-size:14px;">ID ${payment.id}</div>
            </div>
          </div>
          <div style="margin-top:22px;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
            <div style="display:grid;grid-template-columns:minmax(0,1.7fr) 120px 160px;background:rgba(255,255,255,0.03);padding:14px 20px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8b9ac0;">
              <span>Concepto</span>
              <span>Cantidad</span>
              <span>Total</span>
            </div>
            <div style="display:grid;grid-template-columns:minmax(0,1.7fr) 120px 160px;padding:20px;border-top:1px solid rgba(255,255,255,0.06);">
              <div>
                <div style="font-size:17px;font-weight:600;">${getPaymentPlanName(payment)}</div>
                <div style="margin-top:6px;font-size:14px;color:#8b9ac0;">${payment.description}</div>
              </div>
              <div style="font-size:15px;font-weight:600;">1</div>
              <div style="font-size:18px;font-weight:700;">${amount}</div>
            </div>
          </div>
          <div style="margin-top:22px;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:20px;background:rgba(255,255,255,0.02);">
            <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#4a5580;">Incluye</div>
            <ul style="margin:14px 0 0;padding-left:18px;color:#8b9ac0;font-size:14px;line-height:1.7;">
              ${features.map((feature) => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-top:26px;">
            <p style="margin:0;max-width:430px;color:#8b9ac0;font-size:13px;line-height:1.6;">
              Pulse by TuWebAI. Este comprobante resume el movimiento registrado en tu dashboard y el alcance del plan contratado.
            </p>
            <div style="text-align:right;">
              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#4a5580;">Total</div>
              <div style="margin-top:8px;font-size:30px;font-weight:700;">${amount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function downloadPaymentInvoicePdf(payment: Payment, user: User) {
  const { jsPDF } = await import('jspdf');
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '900px';
  container.innerHTML = buildInvoiceHtml(payment, user);
  document.body.appendChild(container);

  try {
    const doc = new jsPDF({
      format: 'a4',
      orientation: 'portrait',
      unit: 'px',
    });
    const fileName = getInvoiceFileName(payment);

    doc.setDocumentProperties({
      title: `Factura Pulse - ${getPaymentPlanName(payment)}`,
      subject: `Comprobante de ${getPaymentPlanName(payment)}`,
      author: 'Pulse by TuWebAI',
      creator: 'Pulse by TuWebAI',
      keywords: 'Pulse, factura, pago, TuWebAI',
    });

    await new Promise<void>((resolve) => {
      doc.html(container, {
        autoPaging: 'text',
        callback: () => resolve(),
        html2canvas: {
          backgroundColor: '#0b0f1e',
          scale: 0.56,
        },
        margin: [18, 18, 18, 18],
        width: 760,
        windowWidth: 980,
      });
    });

    const pdfBlob = doc.output('blob');
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  } finally {
    document.body.removeChild(container);
  }
}
