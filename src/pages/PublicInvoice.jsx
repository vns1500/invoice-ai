import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  Download,
  Loader2,
  Receipt,
} from "lucide-react";
import jsPDF from "jspdf";
import { supabase } from "../lib/supabase";
import { formatMoney, formatDate } from "../lib/format";
import { generateInvoicePdf } from "../lib/pdf";

function getInvoiceAmount(invoice) {
  const total = Number(invoice?.total);

  if (Number.isFinite(total) && total > 0) {
    return total;
  }

  const subtotal = Number(invoice?.subtotal || 0);
  const tax = Number(invoice?.tax || 0);
  const discount = Number(invoice?.discount || 0);
  const calculatedTotal = subtotal + tax - discount;

  return Number.isFinite(calculatedTotal) ? Math.max(calculatedTotal, 0) : 0;
}

export default function PublicInvoice() {
  const { token } = useParams();

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(
    token ? "" : "This invoice link is invalid."
  );
  const [data, setData] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * This calls a Postgres function (see supabase/sql) instead of
         * querying tables directly. The function only returns a row
         * when the exact token matches, so an anonymous visitor can
         * never browse or enumerate other people's invoices - simply
         * knowing this table has a public_token column isn't enough.
         */
        const { data: result, error: rpcError } = await supabase.rpc(
          "get_public_invoice",
          { token }
        );

        if (!mounted) return;

        if (rpcError) {
          throw rpcError;
        }

        if (!result) {
          setError("This invoice link is invalid or has been revoked.");
          setData(null);
          return;
        }

        setData(result);
      } catch (loadError) {
        console.error("Public invoice load error:", loadError);

        if (mounted) {
          setError(
            loadError?.message || "We couldn't load this invoice."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (token) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleDownloadPdf = async () => {
    if (!data) return;

    setPdfGenerating(true);

    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      generateInvoicePdf(doc, {
        invoice: data.invoice,
        items: data.items || [],
        client: data.client || {},
        profile: data.profile || {},
        currency: data.invoice?.currency || "USD",
        subtotal: Number(data.invoice?.subtotal || 0),
        tax: Number(data.invoice?.tax || 0),
        discount: Number(data.invoice?.discount || 0),
        total: getInvoiceAmount(data.invoice),
      });

      const safeNumber = String(
        data.invoice?.invoice_number || "invoice"
      ).replace(/[^a-z0-9_-]+/gi, "-");

      doc.save(`Invoice-${safeNumber}.pdf`);
    } catch (generationError) {
      console.error("Public invoice PDF error:", generationError);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Loader2 size={20} className="animate-spin text-emerald-300" />
          <p className="text-xs uppercase tracking-[0.18em] text-[#536058]">
            Loading invoice
          </p>
        </div>
      </Shell>
    );
  }

  if (error || !data) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03]">
            <AlertTriangle size={18} className="text-red-300/70" />
          </div>
          <h1 className="text-xl font-semibold tracking-[-0.03em] text-[#F5F7F5]">
            Invoice not available
          </h1>
          <p className="max-w-sm text-sm leading-6 text-[#69746D]">
            {error || "This invoice link is invalid or has been revoked."}
          </p>
        </div>
      </Shell>
    );
  }

  const { invoice, client, items = [], profile } = data;
  const currency = invoice?.currency || "USD";
  const subtotal = Number(invoice?.subtotal || 0);
  const tax = Number(invoice?.tax || 0);
  const discount = Number(invoice?.discount || 0);
  const total = getInvoiceAmount(invoice);
  const status = String(invoice?.status || "draft").toLowerCase();

  return (
    <Shell>
      <div className="rounded-[1.75rem] border border-emerald-200/[0.08] bg-[#090D0A] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[#F5F7F5]">
              {profile?.business_name || "Invoice"}
            </p>
            {profile?.full_name && (
              <p className="mt-1 text-xs text-[#69746D]">
                {profile.full_name}
              </p>
            )}
            {profile?.email && (
              <p className="text-xs text-[#69746D]">{profile.email}</p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[#F5F7F5]">
              INVOICE
            </p>
            <p className="mt-1 text-xs text-[#69746D]">
              #{invoice?.invoice_number || "—"}
            </p>
            <span className="mt-2 inline-block rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-emerald-200">
              {status}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-emerald-200/[0.06] pt-6 sm:grid-cols-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
              Bill to
            </p>
            <p className="mt-2 text-sm text-[#F5F7F5]">
              {client?.company || client?.name || "—"}
            </p>
            {client?.company && client?.name && (
              <p className="mt-0.5 text-xs text-[#69746D]">{client.name}</p>
            )}
            {client?.email && (
              <p className="mt-0.5 text-xs text-[#69746D]">{client.email}</p>
            )}
            {client?.phone && (
              <p className="mt-0.5 text-xs text-[#69746D]">{client.phone}</p>
            )}
            {client?.address && (
              <p className="mt-0.5 whitespace-pre-line text-xs text-[#69746D]">
                {client.address}
              </p>
            )}
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
              Issue date
            </p>
            <p className="mt-2 text-sm text-[#F5F7F5]">
              {formatDate(invoice?.issue_date)}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
              Due date
            </p>
            <p className="mt-2 text-sm text-[#F5F7F5]">
              {formatDate(invoice?.due_date)}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-emerald-200/[0.06]">
          <div className="grid grid-cols-[1fr_0.6fr_0.7fr_0.7fr] gap-3 bg-white/[0.02] px-4 py-3 text-[9px] uppercase tracking-[0.1em] text-[#536058]">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="divide-y divide-emerald-200/[0.05]">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[#536058]">
                No line items
              </div>
            ) : (
              items.map((item) => {
                const quantity = Number(item?.quantity || 0);
                const unitPrice = Number(item?.unit_price || 0);
                const amount = Number.isFinite(Number(item?.amount))
                  ? Number(item.amount)
                  : quantity * unitPrice;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_0.6fr_0.7fr_0.7fr] gap-3 px-4 py-3 text-xs text-[#8A948D]"
                  >
                    <span className="text-[#F5F7F5]">
                      {item?.description || "Item"}
                    </span>
                    <span className="text-right">{quantity}</span>
                    <span className="text-right">
                      {formatMoney(unitPrice, currency)}
                    </span>
                    <span className="text-right text-[#F5F7F5]">
                      {formatMoney(amount, currency)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#69746D]">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#69746D]">
              <span>Tax</span>
              <span>{formatMoney(tax, currency)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#69746D]">
              <span>Discount</span>
              <span>{formatMoney(discount, currency)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-emerald-200/[0.08] pt-2 text-sm font-semibold text-[#F5F7F5]">
              <span>Total</span>
              <span>{formatMoney(total, currency)}</span>
            </div>
          </div>
        </div>

        {(invoice?.notes || invoice?.terms) && (
          <div className="mt-8 grid gap-6 border-t border-emerald-200/[0.06] pt-6 sm:grid-cols-2">
            {invoice?.notes && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
                  Notes
                </p>
                <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[#8A948D]">
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice?.terms && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
                  Payment terms
                </p>
                <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[#8A948D]">
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-end border-t border-emerald-200/[0.06] pt-6">
          <button
            onClick={handleDownloadPdf}
            disabled={pdfGenerating}
            className="flex items-center gap-2 rounded-xl bg-[#F5F7F5] px-4 py-3 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pdfGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {pdfGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050706] px-5 py-10 sm:py-16">
      <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/[0.035] blur-[140px]" />

      <div className="relative mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-8 flex w-fit items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#69746D] transition hover:text-[#F5F7F5]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200/[0.08] bg-emerald-300/[0.04]">
            <Receipt size={13} className="text-emerald-300" />
          </span>
          INVOICEAI
        </Link>

        {children}
      </div>
    </div>
  );
}