import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function generateInvoiceNumber() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `INV-${year}${month}${day}-${random}`;
}

function createEmptyItem() {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unit_price: "",
  };
}

export default function InvoiceModal({
  userId,
  clients,
  currency = "USD",
  invoice = null,
  onClose,
  onSaved,
}) {
  const isEditing = Boolean(invoice);

  const [form, setForm] = useState({
    clientId: "",
    invoiceNumber: generateInvoiceNumber(),
    issueDate: getToday(),
    dueDate: getDueDate(),
    taxRate: "0",
    discount: "0",
    notes: "",
    terms: "Payment due within the agreed payment terms.",
  });

  const [items, setItems] = useState([
    createEmptyItem(),
  ]);

  const [existingItemIds, setExistingItemIds] = useState(
    []
  );

  const [loadingItems, setLoadingItems] = useState(
    isEditing
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = clients.find(
    (client) => client.id === form.clientId
  );

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;

      return sum + quantity * unitPrice;
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    const taxRate = Number(form.taxRate) || 0;

    return subtotal * (taxRate / 100);
  }, [subtotal, form.taxRate]);

  const discountAmount = useMemo(() => {
    return Math.max(Number(form.discount) || 0, 0);
  }, [form.discount]);

  const total = useMemo(() => {
    return Math.max(
      subtotal + taxAmount - discountAmount,
      0
    );
  }, [subtotal, taxAmount, discountAmount]);

  useEffect(() => {
    let cancelled = false;

    const loadInvoice = async () => {
      if (!invoice) {
        setForm({
          clientId: "",
          invoiceNumber: generateInvoiceNumber(),
          issueDate: getToday(),
          dueDate: getDueDate(),
          taxRate: "0",
          discount: "0",
          notes: "",
          terms:
            "Payment due within the agreed payment terms.",
        });

        setItems([createEmptyItem()]);
        setExistingItemIds([]);
        setLoadingItems(false);
        setError("");

        return;
      }

      setLoadingItems(true);
      setError("");

      const subtotalValue = Number(invoice.subtotal) || 0;
      const taxValue = Number(invoice.tax) || 0;

      const calculatedTaxRate =
        subtotalValue > 0
          ? (taxValue / subtotalValue) * 100
          : 0;

      setForm({
        clientId: invoice.client_id || "",
        invoiceNumber:
          invoice.invoice_number || generateInvoiceNumber(),
        issueDate:
          invoice.issue_date || getToday(),
        dueDate:
          invoice.due_date || getDueDate(),
        taxRate: String(
          Number.isFinite(calculatedTaxRate)
            ? roundMoney(calculatedTaxRate)
            : 0
        ),
        discount: String(
          Number(invoice.discount) || 0
        ),
        notes: invoice.notes || "",
        terms:
          invoice.terms ||
          "Payment due within the agreed payment terms.",
      });

      const {
        data: invoiceItems,
        error: itemsError,
      } = await supabase
        .from("invoice_items")
        .select(
          "id, invoice_id, description, quantity, unit_price, amount"
        )
        .eq("invoice_id", invoice.id)
        .order("id", {
          ascending: true,
        });

      if (cancelled) {
        return;
      }

      if (itemsError) {
        console.error(
          "Invoice items loading error:",
          itemsError
        );

        setError(
          itemsError.message ||
            "We couldn't load the invoice items."
        );

        setItems([createEmptyItem()]);
        setExistingItemIds([]);
        setLoadingItems(false);

        return;
      }

      if (!invoiceItems?.length) {
        setItems([createEmptyItem()]);
        setExistingItemIds([]);
      } else {
        setItems(
          invoiceItems.map((item) => ({
            id:
              item.id ||
              crypto.randomUUID(),
            description:
              item.description || "",
            quantity: String(
              item.quantity ?? 1
            ),
            unit_price: String(
              item.unit_price ?? ""
            ),
          }))
        );

        setExistingItemIds(
          invoiceItems
            .map((item) => item.id)
            .filter(Boolean)
        );
      }

      setLoadingItems(false);
    };

    loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [invoice]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose, saving]);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      createEmptyItem(),
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (loadingItems) {
      return;
    }

    if (!form.clientId) {
      setError("Please select a client.");
      return;
    }

    if (!form.invoiceNumber.trim()) {
      setError("Invoice number is required.");
      return;
    }

    if (!form.issueDate) {
      setError("Issue date is required.");
      return;
    }

    if (!form.dueDate) {
      setError("Due date is required.");
      return;
    }

    if (
      new Date(form.dueDate) <
      new Date(form.issueDate)
    ) {
      setError(
        "Due date cannot be earlier than the issue date."
      );
      return;
    }

    const validItems = items.filter(
      (item) => item.description.trim()
    );

    if (validItems.length === 0) {
      setError(
        "Add at least one invoice line item."
      );
      return;
    }

    const hasInvalidItem = validItems.some(
      (item) =>
        Number(item.quantity) <= 0 ||
        Number(item.unit_price) < 0 ||
        !Number.isFinite(Number(item.quantity)) ||
        !Number.isFinite(Number(item.unit_price))
    );

    if (hasInvalidItem) {
      setError(
        "Check the quantity and unit price on each line item."
      );
      return;
    }

    const taxRate = Math.max(
      Number(form.taxRate) || 0,
      0
    );

    const discount = Math.max(
      Number(form.discount) || 0,
      0
    );

    if (taxRate > 100) {
      setError("Tax rate cannot be greater than 100%.");
      return;
    }

    if (discount > subtotal + taxAmount) {
      setError(
        "Discount cannot be greater than the invoice amount."
      );
      return;
    }

    setSaving(true);

    let createdInvoiceId = null;

    try {
      const invoicePayload = {
        user_id: userId,
        client_id: form.clientId,
        invoice_number: form.invoiceNumber.trim(),
        issue_date: form.issueDate,
        due_date: form.dueDate,
        status: isEditing
          ? invoice.status || "draft"
          : "draft",
        currency,
        subtotal: roundMoney(subtotal),
        tax: roundMoney(taxAmount),
        discount: roundMoney(discount),
        total: roundMoney(total),
        notes: form.notes.trim() || null,
        terms: form.terms.trim() || null,
      };

      let invoiceId;

      if (isEditing) {
        const {
          error: invoiceError,
        } = await supabase
          .from("invoices")
          .update(invoicePayload)
          .eq("id", invoice.id)
          .eq("user_id", userId);

        if (invoiceError) {
          throw invoiceError;
        }

        invoiceId = invoice.id;
      } else {
        const {
          data: createdInvoice,
          error: invoiceError,
        } = await supabase
          .from("invoices")
          .insert(invoicePayload)
          .select("id")
          .single();

        if (invoiceError) {
          throw invoiceError;
        }

        createdInvoiceId = createdInvoice.id;
        invoiceId = createdInvoice.id;
      }

      const invoiceItems = validItems.map(
        (item) => ({
          invoice_id: invoiceId,
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unit_price: roundMoney(
            Number(item.unit_price)
          ),
          amount: roundMoney(
            Number(item.quantity) *
              Number(item.unit_price)
          ),
        })
      );

      if (isEditing) {
        /*
         * Insert the replacement items first.
         * This prevents the invoice from being left
         * without line items if the insert fails.
         *
         * We also select the inserted IDs so that if
         * the original item cleanup fails, only the
         * newly inserted replacement rows are removed.
         */
        const {
          data: insertedItems,
          error: insertItemsError,
        } = await supabase
          .from("invoice_items")
          .insert(invoiceItems)
          .select("id");

        if (insertItemsError) {
          throw insertItemsError;
        }

        const insertedItemIds =
          insertedItems
            ?.map((item) => item.id)
            .filter(Boolean) || [];

        /*
         * Delete only the line items that existed before
         * this edit. Their database IDs were captured when
         * the invoice was loaded.
         */
        if (existingItemIds.length) {
          const {
            error: deleteItemsError,
          } = await supabase
            .from("invoice_items")
            .delete()
            .in(
              "id",
              existingItemIds
            );

          if (deleteItemsError) {
            console.error(
              "Invoice item cleanup error:",
              deleteItemsError
            );

            /*
             * Roll back the replacement rows if the
             * original rows could not be removed.
             */
            if (insertedItemIds.length) {
              await supabase
                .from("invoice_items")
                .delete()
                .in(
                  "id",
                  insertedItemIds
                );
            }

            throw deleteItemsError;
          }
        }
      } else {
        const {
          error: itemsError,
        } = await supabase
          .from("invoice_items")
          .insert(invoiceItems);

        if (itemsError) {
          throw itemsError;
        }
      }

      await onSaved();
    } catch (saveError) {
      console.error(
        "Invoice save error:",
        saveError
      );

      if (createdInvoiceId) {
        await supabase
          .from("invoice_items")
          .delete()
          .eq(
            "invoice_id",
            createdInvoiceId
          );

        await supabase
          .from("invoices")
          .delete()
          .eq("id", createdInvoiceId)
          .eq("user_id", userId);
      }

      if (
        saveError?.code === "23505" ||
        saveError?.message
          ?.toLowerCase()
          .includes("invoice_number")
      ) {
        setError(
          "That invoice number already exists. Please use another one."
        );
      } else {
        setError(
          saveError?.message ||
            `We couldn't ${
              isEditing
                ? "update"
                : "create"
            } this invoice.`
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">
      <button
        aria-label="Close invoice modal"
        onClick={() => !saving && onClose()}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-emerald-200/[0.08] bg-[#090D0A] shadow-2xl shadow-black/50">
        <div className="flex shrink-0 items-center justify-between border-b border-emerald-200/[0.06] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/[0.08] bg-emerald-300/[0.04]">
              <FileText
                size={16}
                className="text-emerald-300"
              />
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
                {isEditing
                  ? "EDIT INVOICE"
                  : "NEW INVOICE"}
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                {isEditing
                  ? "Edit invoice"
                  : "Create invoice"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200/[0.06] text-[#69746D] transition hover:text-[#F5F7F5] disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {loadingItems ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw
                size={18}
                className="animate-spin text-emerald-300"
              />

              <p className="text-xs text-[#69746D]">
                Loading invoice...
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="min-h-0 overflow-y-auto"
          >
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.75fr]">
              <div>
                <SectionLabel>
                  Invoice details
                </SectionLabel>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Client"
                    required
                    value={form.clientId}
                    onChange={(value) =>
                      updateForm(
                        "clientId",
                        value
                      )
                    }
                    options={clients.map(
                      (client) => ({
                        value: client.id,
                        label:
                          client.company ||
                          client.name,
                      })
                    )}
                    placeholder={
                      clients.length
                        ? "Select a client"
                        : "Add a client first"
                    }
                    disabled={
                      clients.length === 0
                    }
                  />

                  <FormField
                    label="Invoice number"
                    required
                    value={form.invoiceNumber}
                    onChange={(value) =>
                      updateForm(
                        "invoiceNumber",
                        value
                      )
                    }
                    placeholder="INV-20260922-1234"
                  />

                  <FormField
                    label="Issue date"
                    type="date"
                    value={form.issueDate}
                    onChange={(value) =>
                      updateForm(
                        "issueDate",
                        value
                      )
                    }
                  />

                  <FormField
                    label="Due date"
                    type="date"
                    value={form.dueDate}
                    onChange={(value) =>
                      updateForm(
                        "dueDate",
                        value
                      )
                    }
                  />
                </div>

                {selectedClient && (
                  <div className="mt-4 rounded-xl border border-emerald-200/[0.05] bg-white/[0.015] p-4">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
                      BILL TO
                    </p>

                    <p className="mt-2 text-xs font-medium">
                      {selectedClient.name}
                    </p>

                    {selectedClient.company && (
                      <p className="mt-1 text-[10px] text-[#69746D]">
                        {selectedClient.company}
                      </p>
                    )}

                    {selectedClient.email && (
                      <p className="mt-1 text-[10px] text-[#536058]">
                        {selectedClient.email}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <SectionLabel>
                      Line items
                    </SectionLabel>

                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-300/[0.08] bg-emerald-300/[0.03] px-3 py-2 text-[10px] font-medium text-emerald-200 transition hover:bg-emerald-300/[0.07]"
                    >
                      <Plus size={12} />
                      Add item
                    </button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-emerald-200/[0.06]">
                    <div className="hidden grid-cols-[1fr_90px_120px_100px_36px] gap-3 border-b border-emerald-200/[0.05] bg-white/[0.015] px-3 py-2 text-[8px] uppercase tracking-[0.12em] text-[#536058] sm:grid">
                      <span>Description</span>
                      <span>Qty</span>
                      <span>Unit price</span>
                      <span className="text-right">
                        Amount
                      </span>
                      <span />
                    </div>

                    <div className="divide-y divide-emerald-200/[0.04]">
                      {items.map((item) => {
                        const amount =
                          (Number(
                            item.quantity
                          ) || 0) *
                          (Number(
                            item.unit_price
                          ) || 0);

                        return (
                          <div
                            key={item.id}
                            className="grid gap-3 p-3 sm:grid-cols-[1fr_90px_120px_100px_36px] sm:items-center"
                          >
                            <div>
                              <label className="mb-1 block text-[8px] uppercase tracking-[0.12em] text-[#536058] sm:hidden">
                                Description
                              </label>

                              <input
                                value={
                                  item.description
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.id,
                                    "description",
                                    event.target
                                      .value
                                  )
                                }
                                placeholder="Design services"
                                className="h-10 w-full rounded-lg border border-emerald-200/[0.06] bg-white/[0.02] px-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-[8px] uppercase tracking-[0.12em] text-[#536058] sm:hidden">
                                Quantity
                              </label>

                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={
                                  item.quantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.id,
                                    "quantity",
                                    event.target
                                      .value
                                  )
                                }
                                className="h-10 w-full rounded-lg border border-emerald-200/[0.06] bg-white/[0.02] px-3 text-xs text-[#F5F7F5] outline-none focus:border-emerald-300/20"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-[8px] uppercase tracking-[0.12em] text-[#536058] sm:hidden">
                                Unit price
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.unit_price
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateItem(
                                    item.id,
                                    "unit_price",
                                    event.target
                                      .value
                                  )
                                }
                                placeholder="0.00"
                                className="h-10 w-full rounded-lg border border-emerald-200/[0.06] bg-white/[0.02] px-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
                              />
                            </div>

                            <div className="flex items-center justify-between sm:block">
                              <span className="text-[8px] uppercase tracking-[0.12em] text-[#536058] sm:hidden">
                                Amount
                              </span>

                              <p className="text-right text-xs font-medium">
                                {formatCurrency(
                                  amount,
                                  currency
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  item.id
                                )
                              }
                              disabled={
                                items.length ===
                                1
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#536058] transition hover:bg-red-300/[0.03] hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-20 sm:h-8 sm:w-8"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <SectionLabel>
                    Additional information
                  </SectionLabel>

                  <div className="mt-4">
                    <TextAreaField
                      label="Notes"
                      value={form.notes}
                      onChange={(value) =>
                        updateForm(
                          "notes",
                          value
                        )
                      }
                      placeholder="Thank you for your business."
                    />
                  </div>

                  <div className="mt-4">
                    <TextAreaField
                      label="Payment terms"
                      value={form.terms}
                      onChange={(value) =>
                        updateForm(
                          "terms",
                          value
                        )
                      }
                      placeholder="Payment due within 30 days."
                    />
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>
                  Invoice summary
                </SectionLabel>

                <div className="mt-4 rounded-2xl border border-emerald-200/[0.06] bg-white/[0.015] p-5">
                  <div className="flex items-center justify-between border-b border-emerald-200/[0.05] pb-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
                        {form.invoiceNumber}
                      </p>

                      <p className="mt-1 text-xs text-[#69746D]">
                        {isEditing
                          ? `${capitalize(
                              invoice?.status ||
                                "draft"
                            )} invoice`
                          : "Draft invoice"}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/[0.05]">
                      <FileText
                        size={15}
                        className="text-emerald-300/70"
                      />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <SummaryRow
                      label="Subtotal"
                      value={formatCurrency(
                        subtotal,
                        currency
                      )}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#69746D]">
                          Tax
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={
                              form.taxRate
                            }
                            onChange={(
                              event
                            ) =>
                              updateForm(
                                "taxRate",
                                event.target
                                  .value
                              )
                            }
                            className="h-7 w-16 rounded-md border border-emerald-200/[0.06] bg-white/[0.02] px-2 text-[10px] text-[#F5F7F5] outline-none focus:border-emerald-300/20"
                          />

                          <span className="text-[10px] text-[#536058]">
                            %
                          </span>
                        </div>
                      </div>

                      <p className="text-xs">
                        {formatCurrency(
                          taxAmount,
                          currency
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#69746D]">
                          Discount
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-[#536058]">
                            {currency}
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              form.discount
                            }
                            onChange={(
                              event
                            ) =>
                              updateForm(
                                "discount",
                                event.target
                                  .value
                              )
                            }
                            className="h-7 w-24 rounded-md border border-emerald-200/[0.06] bg-white/[0.02] px-2 text-[10px] text-[#F5F7F5] outline-none focus:border-emerald-300/20"
                          />
                        </div>
                      </div>

                      <p className="text-xs">
                        -{" "}
                        {formatCurrency(
                          discountAmount,
                          currency
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-emerald-200/[0.06] pt-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
                          Total
                        </p>

                        <p className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-emerald-200">
                          {formatCurrency(
                            total,
                            currency
                          )}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-300/[0.06] px-2 py-1 text-[8px] uppercase tracking-[0.1em] text-emerald-300/70">
                        {capitalize(
                          invoice?.status ||
                            "draft"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-200/[0.05] bg-emerald-300/[0.015] p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-emerald-300/60">
                    {isEditing
                      ? "Editing invoice"
                      : "What happens next"}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#69746D]">
                    {isEditing
                      ? "Your changes will be saved to this existing invoice. Its current status will remain unchanged."
                      : "Your invoice will be saved as a draft. You can review it before sending it to your client."}
                  </p>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-300/[0.08] bg-red-300/[0.03] px-3 py-3 text-xs leading-5 text-red-200/80">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-emerald-200/[0.06] bg-[#080C09] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-emerald-200/[0.07] px-4 py-3 text-xs text-[#69746D] transition hover:text-[#F5F7F5] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  clients.length === 0 ||
                  loadingItems
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={13}
                      className="animate-spin"
                    />
                    {isEditing
                      ? "Saving..."
                      : "Creating..."}
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    {isEditing
                      ? "Save changes"
                      : "Save draft"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-emerald-300/60">
      {children}
    </p>
  );
}

function FormField({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#536058]">
        {label}

        {required && (
          <span className="ml-1 text-emerald-300">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] px-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
      />
    </label>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#536058]">
        {label}

        {required && (
          <span className="ml-1 text-emerald-300">
            *
          </span>
        )}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          className="h-11 w-full appearance-none rounded-xl border border-emerald-200/[0.07] bg-[#0B100C] px-3 pr-9 text-xs text-[#F5F7F5] outline-none focus:border-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#536058]"
        />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#536058]">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] px-3 py-3 text-xs leading-5 text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
      />
    </label>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-[#69746D]">
        {label}
      </p>

      <p className="text-xs">{value}</p>
    </div>
  );
}

function formatCurrency(value, currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${Number(
      value || 0
    ).toFixed(2)}`;
  }
}

function roundMoney(value) {
  return (
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100
  );
}

function capitalize(value) {
  const text = String(value || "draft");

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}