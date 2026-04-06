import { formatCurrency } from '@/features/payments/services/mercadoPago';
import type { User } from '@/contexts/appContext.types';
import type { Payment } from '@/types';
import { getPaymentPlanFeatures, getPaymentPlanName, getPaymentStatusLabel } from '../payments.utils';

function sanitizeSegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getInvoiceDocumentPrefix(payment: Payment) {
  return payment.status === 'approved' ? 'comprobante-pago-pulse' : 'resumen-pago-pulse';
}

function getInvoiceFileName(payment: Payment): string {
  const planSegment = sanitizeSegment(getPaymentPlanName(payment)) || 'plan';
  const statusSegment = sanitizeSegment(getPaymentStatusLabel(payment.status)) || 'estado';
  const dateSegment = new Date(payment.createdAt).toLocaleDateString('sv-SE');
  return `${getInvoiceDocumentPrefix(payment)}-${statusSegment}-${planSegment}-${dateSegment}.pdf`;
}

function getInvoiceDocumentTitle(payment: Payment) {
  return payment.status === 'approved' ? 'Comprobante de pago' : 'Resumen de movimiento';
}

function paintPageBackground(doc: InstanceType<typeof import('jspdf').jsPDF>) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
}

function ensurePageSpace(doc: InstanceType<typeof import('jspdf').jsPDF>, currentY: number, requiredHeight: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredHeight <= pageHeight - 32) {
    return currentY;
  }

  doc.addPage();
  paintPageBackground(doc);
  return 32;
}

function drawWrappedText(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawLabelValueCard(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  title: string,
  detail: string,
) {
  doc.setDrawColor(219, 232, 251);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, height, 10, 10, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(label.toUpperCase(), x + 14, y + 18);

  doc.setFontSize(11);
  doc.setTextColor(11, 15, 30);
  const titleLines = doc.splitTextToSize(title, width - 28);
  doc.text(titleLines.slice(0, 2), x + 14, y + 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const detailLines = doc.splitTextToSize(detail, width - 28);
  doc.text(detailLines.slice(0, 2), x + 14, y + 51);
}

function drawPulseMark(doc: InstanceType<typeof import('jspdf').jsPDF>, x: number, y: number, size: number) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const scale = size / 100;

  doc.setDrawColor(120, 138, 170);
  doc.setLineWidth(1.2 * scale);
  doc.circle(centerX, centerY, 38 * scale, 'S');

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2 * scale);
  doc.lines(
    [
      [14 * scale, 0],
      [8 * scale, -24 * scale],
      [10 * scale, 48 * scale],
      [8 * scale, -36 * scale],
      [8 * scale, 12 * scale],
      [28 * scale, 0],
    ],
    x + 12 * scale,
    y + 50 * scale,
    [1, 1],
    'S',
    false,
  );

  doc.setFillColor(59, 158, 245);
  doc.circle(x + 60 * scale, y + 50 * scale, 2.5 * scale, 'F');
}

function drawBrandLine(doc: InstanceType<typeof import('jspdf').jsPDF>, x: number, y: number, width: number) {
  const segments = [
    [59, 158, 245],
    [123, 76, 212],
    [224, 64, 160],
    [255, 157, 0],
  ] as const;
  const segmentWidth = width / segments.length;

  segments.forEach((segment, index) => {
    doc.setFillColor(segment[0], segment[1], segment[2]);
    doc.rect(x + index * segmentWidth, y, segmentWidth, 5, 'F');
  });
}

function drawStatusPill(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  x: number,
  y: number,
  label: string,
  tone: 'signal' | 'success' | 'warning',
) {
  const palette =
    tone === 'success'
      ? { bg: [34, 197, 94], text: [255, 255, 255] }
      : tone === 'warning'
        ? { bg: [245, 158, 11], text: [11, 15, 30] }
        : { bg: [59, 158, 245], text: [255, 255, 255] };

  const pillWidth = Math.max(64, doc.getTextWidth(label) + 18);
  doc.setFillColor(palette.bg[0], palette.bg[1], palette.bg[2]);
  doc.roundedRect(x, y, pillWidth, 16, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(palette.text[0], palette.text[1], palette.text[2]);
  doc.text(label, x + 9, y + 10.5);
}

export async function downloadPaymentInvoicePdf(payment: Payment, user: User) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    format: 'a4',
    orientation: 'portrait',
    unit: 'px',
  });
  const fileName = getInvoiceFileName(payment);
  const features = getPaymentPlanFeatures(payment);
  const customerName = user.full_name || user.email;
  const customerEmail = user.email;
  const amount = formatCurrency(payment.amount, payment.currency);
  const paidDate = new Date(payment.paidAt || payment.updatedAt || payment.createdAt).toLocaleDateString('es-AR');
  const createdDate = new Date(payment.createdAt).toLocaleDateString('es-AR');
  const paymentMethod = payment.paymentMethod || 'Mercado Pago';
  const description = payment.description;
  const documentTitle = getInvoiceDocumentTitle(payment);
  const statusLabel = getPaymentStatusLabel(payment.status);
  const referenceCode = `PULSE-${payment.id.slice(-6).toUpperCase()}`;
  const planName = getPaymentPlanName(payment);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;

  doc.setDocumentProperties({
    title: `${documentTitle} - ${planName}`,
    subject: `${documentTitle} de ${planName}`,
    author: 'Pulse by TuWebAI',
    creator: 'Pulse by TuWebAI',
    keywords: 'Pulse, comprobante, pago, TuWebAI',
  });

  paintPageBackground(doc);
  drawBrandLine(doc, margin, 20, contentWidth);

  doc.setDrawColor(219, 232, 251);
  doc.setFillColor(11, 15, 30);
  doc.roundedRect(margin, 34, contentWidth, 126, 20, 20, 'FD');

  doc.setDrawColor(41, 88, 140);
  doc.setLineWidth(1);
  doc.circle(pageWidth - 80, 72, 36, 'S');
  doc.circle(pageWidth - 64, 88, 54, 'S');

  drawPulseMark(doc, margin + 18, 50, 34);

  const summaryCardWidth = 140;
  const summaryCardX = pageWidth - margin - summaryCardWidth - 18;
  const heroTextX = margin + 60;
  const heroTextWidth = summaryCardX - heroTextX - 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(139, 154, 192);
  doc.text('PULSE BY TUWEBAI', heroTextX, 68);

  doc.setFontSize(18);
  doc.setTextColor(240, 244, 255);
  const titleLines = doc.splitTextToSize(documentTitle, heroTextWidth);
  doc.text(titleLines, margin + 18, 102);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(139, 154, 192);
  const heroCopy =
    `${description}. Pulse presenta este movimiento con contexto claro para que puedas entender el servicio, el estado y el valor registrado sin salir del dashboard.`;
  const titleBlockHeight = titleLines.length * 11;
  drawWrappedText(doc, heroCopy, margin + 18, 114 + titleBlockHeight, heroTextWidth, 11);

  doc.setDrawColor(255, 255, 255,);
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(summaryCardX, 54, summaryCardWidth, 92, 18, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(139, 154, 192);
  doc.text('TOTAL REGISTRADO', summaryCardX + 14, 74);

  doc.setFont('courier', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(240, 244, 255);
  doc.text(amount, summaryCardX + 14, 98);
  drawStatusPill(
    doc,
    summaryCardX + 14,
    106,
    statusLabel,
    payment.status === 'approved' ? 'success' : payment.status === 'pending' ? 'warning' : 'signal',
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(139, 154, 192);
  doc.text(`Emitido ${paidDate}`, summaryCardX + 14, 132);

  drawLabelValueCard(doc, margin, 176, 190, 64, 'Cliente', customerName, customerEmail);
  drawLabelValueCard(doc, margin + 206, 176, 190, 64, 'Referencia', referenceCode, `Creado el ${createdDate}`);

  doc.setDrawColor(219, 227, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 258, contentWidth, 82, 16, 16, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CONCEPTO', margin + 14, 278);
  doc.text('CANT.', margin + 274, 278);
  doc.text('TOTAL', margin + 338, 278);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 14, 286, pageWidth - margin - 14, 286);

  doc.setFontSize(12);
  doc.setTextColor(11, 15, 30);
  doc.text(doc.splitTextToSize(planName, 210).slice(0, 2), margin + 14, 306);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  drawWrappedText(doc, description, margin + 14, 320, 210, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 15, 30);
  doc.text('1', margin + 278, 306);

  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.text(amount, margin + 332, 306);

  let currentY = 360;
  const visibleFeatures = features.filter(Boolean);
  const featureHeights = visibleFeatures.map((feature) => {
    const lineCount = doc.splitTextToSize(feature, 190).length;
    return lineCount * 11 + 3;
  });
  const featuresBlockHeight = featureHeights.reduce((total, height) => total + height, 0);
  const detailsBlockHeight = 4 * 16;
  const infoCardsHeight = Math.max(110, Math.max(featuresBlockHeight + 42, detailsBlockHeight + 44));
  currentY = ensurePageSpace(doc, currentY, infoCardsHeight + 22);

  doc.setDrawColor(219, 232, 251);
  doc.setFillColor(252, 253, 255);
  doc.roundedRect(margin, currentY, 244, infoCardsHeight, 16, 16, 'FD');
  doc.roundedRect(margin + 258, currentY, 138, infoCardsHeight, 16, 16, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('INCLUYE', margin + 18, currentY + 22);
  doc.text('DATOS DEL PAGO', margin + 272, currentY + 22);

  let featuresY = currentY + 40;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  visibleFeatures.forEach((feature) => {
    doc.setFillColor(59, 158, 245);
    doc.circle(margin + 22, featuresY - 4, 2, 'F');
    featuresY = drawWrappedText(doc, feature, margin + 34, featuresY, 190, 11) + 3;
  });

  let detailsY = currentY + 40;
  const paymentDetails = [
    ['Metodo', paymentMethod],
    ['Estado', statusLabel],
    ['Fecha', paidDate],
    ['Plan', planName],
  ];

  paymentDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(11, 15, 30);
    doc.text(`${label}:`, margin + 272, detailsY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    detailsY = drawWrappedText(doc, value, margin + 308, detailsY, 76, 11) + 5;
  });

  currentY += infoCardsHeight + 8;
  const footerHeight = 42;
  const footerY = Math.max(currentY, doc.internal.pageSize.getHeight() - footerHeight - 26);

  doc.setFillColor(11, 15, 30);
  doc.roundedRect(margin, footerY, contentWidth, footerHeight, 16, 16, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(139, 154, 192);
  drawWrappedText(
    doc,
    'Pulse traduce movimientos y servicios a lenguaje claro para que puedas revisar pagos, comprobantes y proximos pasos con una presentacion profesional y consistente con tu dashboard.',
    margin + 18,
    footerY + 17,
    220,
    8.5,
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(147, 197, 253);
  doc.text('TOTAL FINAL', pageWidth - 132, footerY + 16);

  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(amount, pageWidth - 132, footerY + 31);

  await doc.save(fileName, { returnPromise: true });
}
