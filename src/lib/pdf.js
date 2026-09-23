import { formatMoney, formatDate } from "./format";

export function generateInvoicePdf(
  doc,
  { invoice, items, client, profile, currency, subtotal, tax, discount, total }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const dark = [15, 23, 18];
  const muted = [102, 112, 105];
  const line = [220, 226, 222];
  const green = [16, 122, 72];
  let y = margin;

  const addPageIfNeeded = (height = 10) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const text = (value, x, yy, options = {}) => {
    doc.text(String(value ?? ""), x, yy, options);
  };

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  text(profile?.business_name || "Your Business", margin, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  let businessY = y + 12;
  if (profile?.full_name) {
    text(profile.full_name, margin, businessY);
    businessY += 4.5;
  }
  if (profile?.email) {
    text(profile.email, margin, businessY);
  }

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  text("INVOICE", pageWidth - margin, y + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  text(`#${invoice?.invoice_number || "—"}`, pageWidth - margin, y + 12, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(...green);
  text(String(invoice?.status || "draft").toUpperCase(), pageWidth - margin, y + 17, { align: "right" });

  y += 27;
  doc.setDrawColor(...line);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setTextColor(...muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  text("BILL TO", margin, y);
  text("ISSUE DATE", margin + contentWidth * 0.48, y);
  text("DUE DATE", pageWidth - margin, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...dark);
  text(client?.company || client?.name || "—", margin, y);
  text(formatDate(invoice?.issue_date), margin + contentWidth * 0.48, y);
  text(formatDate(invoice?.due_date), pageWidth - margin, y, { align: "right" });

  y += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  if (client?.company && client?.name) {
    text(client.name, margin, y);
    y += 4.2;
  }
  if (client?.email) {
    text(client.email, margin, y);
    y += 4.2;
  }
  if (client?.phone) {
    text(client.phone, margin, y);
    y += 4.2;
  }
  if (client?.address) {
    const addressLines = doc.splitTextToSize(String(client.address), contentWidth * 0.38);
    doc.text(addressLines, margin, y);
    y += addressLines.length * 4.2;
  }

  y = Math.max(y + 6, margin + 55);

  const cols = {
    description: margin,
    qty: margin + contentWidth * 0.67,
    rate: margin + contentWidth * 0.79,
    amount: pageWidth - margin,
  };

  doc.setFillColor(246, 248, 246);
  doc.rect(margin, y, contentWidth, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...muted);
  text("DESCRIPTION", cols.description + 3, y + 5.8);
  text("QTY", cols.qty, y + 5.8, { align: "right" });
  text("RATE", cols.rate, y + 5.8, { align: "right" });
  text("AMOUNT", cols.amount - 2, y + 5.8, { align: "right" });
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  for (const item of items) {
    const quantity = Number(item?.quantity || 0);
    const unitPrice = Number(item?.unit_price || 0);
    const amount = Number.isFinite(Number(item?.amount))
      ? Number(item.amount)
      : quantity * unitPrice;
    const description = doc.splitTextToSize(
      String(item?.description || "Item"),
      contentWidth * 0.61
    );
    const rowHeight = Math.max(9, description.length * 4.2 + 4);
    addPageIfNeeded(rowHeight + 2);
    doc.setTextColor(...dark);
    doc.text(description, cols.description + 3, y + 5.5);
    doc.setTextColor(...muted);
    text(quantity, cols.qty, y + 5.5, { align: "right" });
    text(formatMoney(unitPrice, currency), cols.rate, y + 5.5, { align: "right" });
    doc.setTextColor(...dark);
    text(formatMoney(amount, currency), cols.amount - 2, y + 5.5, { align: "right" });
    doc.setDrawColor(...line);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
    y += rowHeight;
  }

  if (items.length === 0) {
    addPageIfNeeded(12);
    doc.setTextColor(...muted);
    doc.setFontSize(8.5);
    text("No line items", margin + 3, y + 6);
    y += 12;
  }

  y += 8;
  addPageIfNeeded(45);
  const summaryX = margin + contentWidth * 0.58;
  const summaryRight = pageWidth - margin;
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  text("Subtotal", summaryX, y);
  text(formatMoney(subtotal, currency), summaryRight, y, { align: "right" });
  y += 6;
  text("Tax", summaryX, y);
  text(formatMoney(tax, currency), summaryRight, y, { align: "right" });
  y += 6;
  text("Discount", summaryX, y);
  text(formatMoney(discount, currency), summaryRight, y, { align: "right" });
  y += 3;
  doc.setDrawColor(...line);
  doc.line(summaryX, y, summaryRight, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  text("TOTAL", summaryX, y);
  text(formatMoney(total, currency), summaryRight, y, { align: "right" });
  y += 13;

  if (invoice?.notes || invoice?.terms) {
    addPageIfNeeded(35);
    doc.setDrawColor(...line);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    const leftWidth = contentWidth * 0.46;
    if (invoice?.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...muted);
      text("NOTES", margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...dark);
      const lines = doc.splitTextToSize(String(invoice.notes), leftWidth);
      doc.text(lines, margin, y + 5);
    }
    if (invoice?.terms) {
      const termsX = margin + contentWidth * 0.54;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...muted);
      text("PAYMENT TERMS", termsX, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...dark);
      const lines = doc.splitTextToSize(String(invoice.terms), leftWidth);
      doc.text(lines, termsX, y + 5);
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(`Generated by InvoiceAI · ${currency}`, margin, pageHeight - 8);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 8, {
      align: "right",
    });
  }
}