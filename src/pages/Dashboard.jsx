import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Download,
  Edit3,
  FileText,
  LayoutDashboard,
  LogOut,
  Link2,
  Unlink2,
  Mail,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import InvoiceModal from "../components/InvoiceModal";
import jsPDF from "jspdf";
//import { formatMoney, formatDate, formatShortDate } from "../lib/format";
//import { getPublicInvoiceUrl } from "../lib/publicInvoice";
//import { generateInvoicePdf } from "../lib/pdf";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Invoices", icon: FileText },
  { label: "Clients", icon: Users },
  { label: "Payments", icon: CircleDollarSign },
];

const invoiceStatuses = [
  "all",
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
];

/* =========================================================
   INVOICE HELPERS
========================================================= */

function getInvoiceStatus(invoice) {
  return String(invoice?.status || "")
    .trim()
    .toLowerCase();
}

function getInvoiceAmount(invoice) {
  const total = Number(invoice?.total);

  if (Number.isFinite(total) && total > 0) {
    return total;
  }

  const subtotal = Number(invoice?.subtotal || 0);
  const tax = Number(invoice?.tax || 0);
  const discount = Number(invoice?.discount || 0);

  const calculatedTotal =
    subtotal + tax - discount;

  return Number.isFinite(calculatedTotal)
    ? Math.max(calculatedTotal, 0)
    : 0;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Overview");

  const [dashboardData, setDashboardData] = useState(null);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [clientsError, setClientsError] = useState("");

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!user?.id) return;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const profileResult = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              email: user.email ?? null,
            },
            {
              onConflict: "id",
              ignoreDuplicates: true,
            }
          )
          .select(
            "currency, full_name, business_name, email"
          )
          .maybeSingle();

        if (profileResult.error) {
          throw profileResult.error;
        }

        const currency =
          profileResult.data?.currency || "USD";

        const invoicesResult = await supabase
          .from("invoices")
          .select(
            `
              id,
              invoice_number,
              issue_date,
              due_date,
              status,
              currency,
              subtotal,
              tax,
              discount,
              total,
              notes,
              terms,
              created_at,
              clients (
                id,
                name,
                company,
                email,
                phone,
                address
              )
            `
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (invoicesResult.error) {
          throw invoicesResult.error;
        }

        const invoices = invoicesResult.data || [];

        /*
         * Normalize all invoice data before calculating
         * dashboard metrics.
         */
        const activeInvoices = invoices.filter(
          (invoice) =>
            getInvoiceStatus(invoice) !==
            "cancelled"
        );

        /*
         * PAID
         *
         * Revenue comes ONLY from invoices whose
         * status is "paid".
         */
        const paidInvoices = invoices.filter(
          (invoice) =>
            getInvoiceStatus(invoice) === "paid"
        );

        /*
         * OUTSTANDING
         *
         * Only sent and overdue invoices are
         * considered outstanding.
         */
        const outstandingInvoices =
          invoices.filter((invoice) => {
            const status =
              getInvoiceStatus(invoice);

            return (
              status === "sent" ||
              status === "overdue"
            );
          });

        /*
         * DRAFT
         */
        const draftInvoices = invoices.filter(
          (invoice) =>
            getInvoiceStatus(invoice) ===
            "draft"
        );

        /*
         * TOTAL INVOICED
         */
        const totalInvoiced =
          activeInvoices.reduce(
            (sum, invoice) =>
              sum + getInvoiceAmount(invoice),
            0
          );

        /*
         * REVENUE
         *
         * Explicitly calculate from PAID invoices.
         * This is intentionally independent of
         * outstanding invoices.
         */
        const paidRevenue =
          paidInvoices.reduce(
            (sum, invoice) =>
              sum + getInvoiceAmount(invoice),
            0
          );

        /*
         * OUTSTANDING AMOUNT
         *
         * Explicitly calculate only from
         * sent/overdue invoices.
         */
        const outstandingAmount =
          outstandingInvoices.reduce(
            (sum, invoice) =>
              sum + getInvoiceAmount(invoice),
            0
          );

        /*
         * COLLECTION RATE
         */
        const collectionBase =
          paidRevenue + outstandingAmount;

        const collectionRate =
          collectionBase > 0
            ? (paidRevenue / collectionBase) * 100
            : 0;

        /*
         * Helpful development logging.
         * This confirms exactly what Supabase returned
         * after marking an invoice as paid.
         */
        console.log("InvoiceAI dashboard metrics:", {
          invoices: invoices.map((invoice) => ({
            id: invoice.id,
            number: invoice.invoice_number,
            status: getInvoiceStatus(invoice),
            total: invoice.total,
            calculatedAmount:
              getInvoiceAmount(invoice),
          })),
          paidInvoices: paidInvoices.length,
          paidRevenue,
          outstandingInvoices:
            outstandingInvoices.length,
          outstandingAmount,
        });

        setDashboardData({
          profile: profileResult.data,
          currency,
          invoices,
          activeInvoices,
          paidInvoices,
          outstandingInvoices,
          draftInvoices,
          totalInvoiced,
          paidRevenue,
          outstandingAmount,
          collectionRate,
          revenueChart:
            buildRevenueChart(invoices),
        });
      } catch (dashboardError) {
        console.error(
          "Dashboard loading error:",
          dashboardError
        );

        setError(
          dashboardError?.message ||
            "We couldn't load your workspace data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, user?.email]
  );

  const loadClients = useCallback(async () => {
    if (!user?.id) return;

    setClientsLoading(true);
    setClientsError("");

    try {
      const {
        data,
        error: clientsQueryError,
      } = await supabase
        .from("clients")
        .select(
          "id, name, email, company, phone, address, notes, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (clientsQueryError) {
        throw clientsQueryError;
      }

      setClients(data || []);
    } catch (clientsQueryError) {
      console.error(
        "Clients loading error:",
        clientsQueryError
      );

      setClientsError(
        clientsQueryError?.message ||
          "We couldn't load your clients."
      );
    } finally {
      setClientsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard();
    loadClients();
  }, [loadDashboard, loadClients]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavigation = (label) => {
    setActive(label);
    setSidebarOpen(false);
  };

  const openAddClient = () => {
    setEditingClient(null);
    setClientModalOpen(true);
  };

  const openEditClient = (client) => {
    setEditingClient(client);
    setClientModalOpen(true);
  };

  const openInvoiceCreator = () => {
    if (clients.length === 0) {
      setActive("Clients");
      return;
    }

    setEditingInvoice(null);
    setInvoiceModalOpen(true);
  };

  const openEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setInvoiceModalOpen(true);
  };

  const openViewInvoice = async (invoice) => {
    setViewingInvoice({
      ...invoice,
      items: [],
      itemsLoading: true,
      itemsError: "",
    });

    try {
      const { data, error: itemsError } = await supabase
        .from("invoice_items")
        .select("id, description, quantity, unit_price, amount")
        .eq("invoice_id", invoice.id);

      if (itemsError) {
        throw itemsError;
      }

      setViewingInvoice((current) =>
        current?.id === invoice.id
          ? { ...current, items: data || [], itemsLoading: false }
          : current
      );
    } catch (itemsError) {
      console.error("Invoice items loading error:", itemsError);
      setViewingInvoice((current) =>
        current?.id === invoice.id
          ? {
              ...current,
              items: [],
              itemsLoading: false,
              itemsError: itemsError?.message || "We couldn't load invoice items.",
            }
          : current
      );
    }
  };

  const closeClientModal = () => {
    setClientModalOpen(false);
    setEditingClient(null);
  };

  const handleClientSaved = async () => {
    closeClientModal();
    await loadClients();
  };

  const handleDeleteClient = async (client) => {
    const confirmed = window.confirm(
      `Delete ${client.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    setClientsError("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("clients")
        .delete()
        .eq("id", client.id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      await loadClients();
    } catch (deleteError) {
      console.error(
        "Client deletion error:",
        deleteError
      );

      setClientsError(
        deleteError?.message ||
          "We couldn't delete this client."
      );
    }
  };

  const closeInvoiceModal = () => {
    setInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

  const handleInvoiceSaved = async () => {
    closeInvoiceModal();
    await loadDashboard({ silent: true });
  };

  const handleInvoiceChanged = async () => {
    await loadDashboard({ silent: true });
  };

  const email = user?.email || "your workspace";

  const displayName =
    dashboardData?.profile?.full_name ||
    email.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen bg-[#050706] text-[#F5F7F5]">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-emerald-200/[0.06] bg-[#080C09] transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center justify-between border-b border-emerald-200/[0.06] px-6">
            <a
              href="/"
              className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200/[0.08] bg-emerald-300/[0.04]">
                <Zap
                  size={14}
                  className="text-emerald-300"
                />
              </span>

              INVOICEAI
            </a>

            <button
              onClick={() => setSidebarOpen(false)}
              className="text-[#536058] lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 px-3 py-6">
            <p className="px-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[#536058]">
              Workspace
            </p>

            <nav className="mt-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const selected =
                  active === item.label;

                return (
                  <button
                    key={item.label}
                    onClick={() =>
                      handleNavigation(
                        item.label
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? "bg-emerald-300/[0.06] text-emerald-200"
                        : "text-[#69746D] hover:bg-white/[0.02] hover:text-[#F5F7F5]"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <p className="mt-9 px-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[#536058]">
              Account
            </p>

            <nav className="mt-3">
              <button
                onClick={() =>
                  handleNavigation("Settings")
                }
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active === "Settings"
                    ? "bg-emerald-300/[0.06] text-emerald-200"
                    : "text-[#69746D] hover:bg-white/[0.02] hover:text-[#F5F7F5]"
                }`}
              >
                <Settings size={16} />
                Settings
              </button>
            </nav>
          </div>

          <div className="border-t border-emerald-200/[0.06] p-4">
            <div className="mb-3 rounded-xl border border-emerald-200/[0.06] bg-white/[0.015] p-3">
              <p className="truncate text-xs text-[#8A948D]">
                {email}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#536058]">
                Personal workspace
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#69746D] transition hover:bg-red-300/[0.03] hover:text-red-200/80"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-emerald-200/[0.06] px-5 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="text-[#69746D] lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#536058]">
                  {active}
                </p>

                <h1 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                  Good morning, {displayName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  loadDashboard({
                    silent: true,
                  })
                }
                disabled={refreshing}
                aria-label="Refresh dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/[0.07] text-[#69746D] transition hover:border-emerald-300/20 hover:text-[#F5F7F5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/[0.07] text-[#69746D] transition hover:border-emerald-300/20 hover:text-[#F5F7F5]">
                <Bell size={16} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </button>

              <button className="hidden items-center gap-2 rounded-xl border border-emerald-200/[0.07] px-3 py-2 text-xs text-[#69746D] transition hover:text-[#F5F7F5] sm:flex">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300/10 text-[8px] text-emerald-200">
                  {email
                    .charAt(0)
                    .toUpperCase()}
                </span>

                Account

                <ChevronDown size={12} />
              </button>
            </div>
          </header>

          <div className="relative overflow-hidden p-5 sm:p-8">
            <div className="pointer-events-none absolute right-[-200px] top-[-200px] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.025] blur-[120px]" />

            {active === "Overview" ? (
              <Overview
                data={dashboardData}
                loading={loading}
                error={error}
                onCreateInvoice={
                  openInvoiceCreator
                }
              />
            ) : active === "Invoices" ? (
              <InvoicesSection
                userId={user.id}
                invoices={
                  dashboardData?.invoices || []
                }
                currency={
                  dashboardData?.currency ||
                  "USD"
                }
                loading={loading}
                error={error}
                onCreateInvoice={
                  openInvoiceCreator
                }
                onViewInvoice={openViewInvoice}
                onEditInvoice={openEditInvoice}
                onChanged={
                  handleInvoiceChanged
                }
              />
            ) : active === "Clients" ? (
              <ClientsSection
                clients={clients}
                loading={clientsLoading}
                error={clientsError}
                onAdd={openAddClient}
                onEdit={openEditClient}
                onDelete={
                  handleDeleteClient
                }
              />
            ) : active === "Payments" ? (
              <PaymentsSection
                invoices={
                  dashboardData?.invoices || []
                }
                currency={
                  dashboardData?.currency ||
                  "USD"
                }
                loading={loading}
                error={error}
              />
            ) : active === "Settings" ? (
              <SettingsSection
                user={user}
                profile={dashboardData?.profile}
                currency={
                  dashboardData?.currency ||
                  "USD"
                }
                onSaved={() =>
                  loadDashboard({
                    silent: true,
                  })
                }
              />
            ) : (
              <PlaceholderSection
                title={active}
              />
            )}
          </div>
        </main>
      </div>

      {clientModalOpen && (
        <ClientModal
          userId={user.id}
          client={editingClient}
          onClose={closeClientModal}
          onSaved={handleClientSaved}
        />
      )}

      {invoiceModalOpen && (
        <InvoiceModal
          userId={user.id}
          clients={clients}
          currency={
            dashboardData?.currency ||
            "USD"
          }
          invoice={editingInvoice}
          onClose={closeInvoiceModal}
          onSaved={handleInvoiceSaved}
        />
      )}

      {viewingInvoice && (
        <InvoicePreviewModal
          invoice={viewingInvoice}
          currency={
            viewingInvoice.currency ||
            dashboardData?.currency ||
            "USD"
          }
          profile={dashboardData?.profile}
          onClose={() => setViewingInvoice(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  data,
  loading,
  error,
  onCreateInvoice,
}) {
  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03]">
            <Zap
              size={18}
              className="text-red-300/70"
            />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
            Couldn't load your workspace
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#69746D]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const currency =
    data?.currency || "USD";

  return (
    <div className="relative">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
            BUSINESS OVERVIEW
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Your money, in motion.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#69746D]">
            Track invoices, clients, payments, and cash flow from one workspace.
          </p>
        </div>

        <button
          onClick={onCreateInvoice}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#F5F7F5] px-4 py-3 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0]"
        >
          <Plus size={14} />
          Create invoice
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total invoiced"
          value={formatMoney(
            data.totalInvoiced,
            currency
          )}
          change={`${data.activeInvoices.length} active`}
        />

        <MetricCard
          label="Revenue"
          value={formatMoney(
            data.paidRevenue,
            currency
          )}
          change={`${data.paidInvoices.length} paid`}
        />

        <MetricCard
          label="Outstanding"
          value={formatMoney(
            data.outstandingAmount,
            currency
          )}
          change={
            data.outstandingInvoices
              .length
              ? `${data.outstandingInvoices.length} open`
              : data.draftInvoices.length
                ? `${data.draftInvoices.length} draft`
                : "Nothing due"
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <RevenueCard
          chart={data.revenueChart}
          currency={currency}
        />

        <CollectionHealth
          rate={data.collectionRate}
        />
      </div>

      <RecentInvoices
        invoices={data.invoices}
        currency={currency}
      />
    </div>
  );
}

/* =========================================================
   INVOICES
========================================================= */

function InvoicesSection({
  userId,
  invoices,
  currency,
  loading,
  error,
  onCreateInvoice,
  onViewInvoice,
  onEditInvoice,
  onChanged,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [deletingId, setDeletingId] =
    useState(null);
  const [updatingId, setUpdatingId] =
    useState(null);
  const [actionError, setActionError] =
    useState("");

  const filteredInvoices = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return invoices.filter((invoice) => {
      const status =
        getInvoiceStatus(invoice);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const client = invoice.clients;

      return [
        invoice.invoice_number,
        status,
        client?.name,
        client?.company,
        client?.email,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [
    invoices,
    search,
    statusFilter,
  ]);

  const statusCounts = useMemo(() => {
    return {
      all: invoices.length,

      draft: invoices.filter(
        (invoice) =>
          getInvoiceStatus(invoice) ===
          "draft"
      ).length,

      sent: invoices.filter(
        (invoice) =>
          getInvoiceStatus(invoice) ===
          "sent"
      ).length,

      paid: invoices.filter(
        (invoice) =>
          getInvoiceStatus(invoice) ===
          "paid"
      ).length,

      overdue: invoices.filter(
        (invoice) =>
          getInvoiceStatus(invoice) ===
          "overdue"
      ).length,

      cancelled: invoices.filter(
        (invoice) =>
          getInvoiceStatus(invoice) ===
          "cancelled"
      ).length,
    };
  }, [invoices]);

  const handleStatusChange = async (
    invoice,
    nextStatus
  ) => {
    const currentStatus =
      getInvoiceStatus(invoice);

    if (currentStatus === nextStatus) {
      return;
    }

    setActionError("");
    setUpdatingId(invoice.id);

    try {
      const {
        data: updatedInvoice,
        error: updateError,
      } = await supabase
        .from("invoices")
        .update({
          status: nextStatus,
        })
        .eq("id", invoice.id)
        .eq("user_id", userId)
        .select("id, status, total")
        .single();

      if (updateError) {
        throw updateError;
      }

      if (!updatedInvoice) {
        throw new Error(
          "The invoice status could not be updated."
        );
      }

      const savedStatus =
        getInvoiceStatus(
          updatedInvoice
        );

      if (
        savedStatus !== nextStatus
      ) {
        throw new Error(
          `Invoice status was not updated. Expected "${nextStatus}" but received "${savedStatus || "empty"}".`
        );
      }

      console.log(
        "Invoice status updated:",
        {
          id: updatedInvoice.id,
          status:
            updatedInvoice.status,
          total:
            updatedInvoice.total,
        }
      );

      await onChanged();
    } catch (updateError) {
      console.error(
        "Invoice status update error:",
        updateError
      );

      setActionError(
        updateError?.message ||
          "We couldn't update this invoice."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteInvoice = async (
    invoice
  ) => {
    const confirmed = window.confirm(
      `Delete invoice #${invoice.invoice_number}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    setDeletingId(invoice.id);

    try {
      const {
        error: itemsDeleteError,
      } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoice.id);

      if (itemsDeleteError) {
        throw itemsDeleteError;
      }

      const {
        error: invoiceDeleteError,
      } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.id)
        .eq("user_id", userId);

      if (invoiceDeleteError) {
        throw invoiceDeleteError;
      }

      await onChanged();
    } catch (deleteError) {
      console.error(
        "Invoice deletion error:",
        deleteError
      );

      setActionError(
        deleteError?.message ||
          "We couldn't delete this invoice."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <InvoicesLoading />;
  }

  if (error) {
    return (
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03]">
            <FileText
              size={18}
              className="text-red-300/70"
            />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
            Couldn't load invoices
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#69746D]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
            INVOICE MANAGEMENT
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Your invoices.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#69746D]">
            Create, manage, and track every invoice from one place.
          </p>
        </div>

        <button
          onClick={onCreateInvoice}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#F5F7F5] px-4 py-3 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0]"
        >
          <Plus size={14} />
          Create invoice
        </button>
      </div>

      {actionError && (
        <div className="mt-5 rounded-xl border border-red-300/[0.08] bg-red-300/[0.03] px-4 py-3 text-xs leading-5 text-red-200/80">
          {actionError}
        </div>
      )}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {invoiceStatuses.map((status) => (
          <button
            key={status}
            onClick={() =>
              setStatusFilter(status)
            }
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[9px] uppercase tracking-[0.1em] transition ${
              statusFilter === status
                ? "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200"
                : "border-emerald-200/[0.06] bg-white/[0.015] text-[#536058] hover:text-[#8A948D]"
            }`}
          >
            {capitalize(status)}

            <span
              className={`rounded-full px-1.5 py-0.5 text-[8px] ${
                statusFilter === status
                  ? "bg-emerald-300/10 text-emerald-200"
                  : "bg-white/[0.03] text-[#536058]"
              }`}
            >
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A]">
        <div className="flex flex-col gap-4 border-b border-emerald-200/[0.05] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium">
              All invoices
            </p>

            <p className="mt-1 text-[10px] text-[#536058]">
              Showing{" "}
              {filteredInvoices.length}{" "}
              of {invoices.length} invoices.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536058]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search invoices..."
              className="h-10 w-full rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] pl-9 pr-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
            />
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <EmptyInvoicesState
            hasSearch={
              Boolean(search.trim()) ||
              statusFilter !== "all"
            }
            onCreateInvoice={
              onCreateInvoice
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1050px]">
              <div className="grid grid-cols-[1.2fr_1.25fr_0.8fr_0.8fr_0.8fr_0.75fr_1.15fr] gap-4 border-b border-emerald-200/[0.05] px-6 py-3 text-[8px] uppercase tracking-[0.14em] text-[#536058]">
                <span>Invoice</span>
                <span>Client</span>
                <span>Issue date</span>
                <span>Due date</span>
                <span>Status</span>
                <span className="text-right">
                  Amount
                </span>
                <span className="text-right">
                  Actions
                </span>
              </div>

              <div className="divide-y divide-emerald-200/[0.04]">
                {filteredInvoices.map(
                  (invoice) => (
                    <InvoiceManagementRow
                      key={invoice.id}
                      invoice={invoice}
                      currency={currency}
                      updating={
                        updatingId ===
                        invoice.id
                      }
                      deleting={
                        deletingId ===
                        invoice.id
                      }
                      onStatusChange={
                        handleStatusChange
                      }
                      onView={onViewInvoice}
                      onEdit={onEditInvoice}
                      onDelete={
                        handleDeleteInvoice
                      }
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceManagementRow({
  invoice,
  currency,
  updating,
  deleting,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
}) {
  const status =
    getInvoiceStatus(invoice);

  const clientName =
    invoice.clients?.company ||
    invoice.clients?.name ||
    invoice.clients?.email ||
    "No client";

  const canSend =
    status === "draft";

  const canMarkPaid =
    status === "sent" ||
    status === "overdue";

  const canReturnToDraft =
    status === "sent" ||
    status === "paid" ||
    status === "overdue";

  return (
    <div className="grid grid-cols-[1.2fr_1.25fr_0.8fr_0.8fr_0.8fr_0.75fr_1.15fr] items-center gap-4 px-6 py-4 transition hover:bg-white/[0.015]">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[#F5F7F5]">
          #{invoice.invoice_number}
        </p>

        <p className="mt-1 text-[9px] text-[#536058]">
          {formatShortDate(
            invoice.created_at
          )}
        </p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs text-[#69746D]">
          {clientName}
        </p>

        {invoice.clients?.email && (
          <p className="mt-1 truncate text-[9px] text-[#536058]">
            {invoice.clients.email}
          </p>
        )}
      </div>

      <p className="text-[10px] text-[#69746D]">
        {formatDate(invoice.issue_date)}
      </p>

      <p
        className={`text-[10px] ${
          status === "overdue"
            ? "text-orange-200/80"
            : "text-[#69746D]"
        }`}
      >
        {formatDate(invoice.due_date)}
      </p>

      <StatusBadge status={status} />

      <p className="text-right text-xs font-medium">
        {formatMoney(
          getInvoiceAmount(invoice),
          currency
        )}
      </p>

      <div className="flex items-center justify-end gap-2">
        {canSend && (
          <ActionButton
            label="Mark sent"
            icon={
              <ArrowUpRight size={12} />
            }
            disabled={
              updating || deleting
            }
            onClick={() =>
              onStatusChange(
                invoice,
                "sent"
              )
            }
          />
        )}

        {canMarkPaid && (
          <ActionButton
            label="Mark paid"
            icon={<Check size={12} />}
            disabled={
              updating || deleting
            }
            onClick={() =>
              onStatusChange(
                invoice,
                "paid"
              )
            }
          />
        )}

        {canReturnToDraft && (
          <ActionButton
            label="Draft"
            icon={
              <FileText size={12} />
            }
            disabled={
              updating || deleting
            }
            onClick={() =>
              onStatusChange(
                invoice,
                "draft"
              )
            }
          />
        )}

        <ActionButton
          label="View"
          icon={<FileText size={12} />}
          disabled={updating || deleting}
          onClick={() => onView(invoice)}
        />

        <ActionButton
          label="Edit"
          icon={<Edit3 size={12} />}
          disabled={updating || deleting}
          onClick={() => onEdit(invoice)}
        />

        <button
          onClick={() =>
            onDelete(invoice)
          }
          disabled={
            updating || deleting
          }
          aria-label={`Delete invoice ${invoice.invoice_number}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200/[0.06] text-[#536058] transition hover:border-red-300/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {deleting ? (
            <RefreshCw
              size={12}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={12} />
          )}
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  disabled,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200/[0.06] bg-white/[0.01] px-2.5 text-[9px] text-[#69746D] transition hover:border-emerald-300/20 hover:bg-emerald-300/[0.03] hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}

      <span className="hidden xl:inline">
        {label}
      </span>
    </button>
  );
}

function EmptyInvoicesState({
  hasSearch,
  onCreateInvoice,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/[0.06] bg-emerald-300/[0.025]">
        {hasSearch ? (
          <Search
            size={18}
            className="text-[#536058]"
          />
        ) : (
          <FileText
            size={18}
            className="text-[#536058]"
          />
        )}
      </div>

      <p className="mt-5 text-sm text-[#69746D]">
        {hasSearch
          ? "No invoices found"
          : "No invoices yet"}
      </p>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#536058]">
        {hasSearch
          ? "Try a different search term or status filter."
          : "Create your first invoice and start tracking your business cash flow."}
      </p>

      {!hasSearch && (
        <button
          onClick={onCreateInvoice}
          className="mx-auto mt-6 flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05] px-4 py-2.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-300/[0.09]"
        >
          <Plus size={14} />
          Create your first invoice
        </button>
      )}
    </div>
  );
}

/* =========================================================
   INVOICE PREVIEW + PDF
========================================================= */

function InvoicePreviewModal({
  invoice,
  currency,
  profile,
  onClose,
}) {
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !pdfGenerating) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, pdfGenerating]);

  const client = invoice?.clients || {};
  const items = invoice?.items || [];
  const subtotal = Number(invoice?.subtotal || 0);
  const tax = Number(invoice?.tax || 0);
  const discount = Number(invoice?.discount || 0);
  const total = getInvoiceAmount(invoice);

  const handleDownloadPdf = async () => {
    if (invoice?.itemsLoading) return;

    setPdfGenerating(true);
    setPdfError("");

    try {
      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
      });

      generateInvoicePdf(doc, {
        invoice,
        items,
        client,
        profile,
        currency,
        subtotal,
        tax,
        discount,
        total,
      });

      const safeNumber = String(
        invoice?.invoice_number || invoice?.id || "invoice"
      ).replace(/[^a-z0-9_-]+/gi, "-");

      doc.save(`Invoice-${safeNumber}.pdf`);
    } catch (generationError) {
      console.error("Invoice PDF generation error:", generationError);
      setPdfError(
        generationError?.message ||
          "We couldn't generate the PDF. Please try again."
      );
    } finally {
      setPdfGenerating(false);
    }
  };

  return createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !pdfGenerating
        ) {
          onClose();
        }
      }}
    >
      <div className="relative z-[101] flex max-h-[92vh] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-emerald-200/[0.08] bg-[#080C09] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-emerald-200/[0.06] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
              INVOICE PREVIEW
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              Invoice #{invoice?.invoice_number || "—"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfGenerating || invoice?.itemsLoading}
              className="flex items-center gap-2 rounded-xl bg-[#F5F7F5] px-3.5 py-2.5 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pdfGenerating ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              {pdfGenerating ? "Generating..." : "Download PDF"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={pdfGenerating}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200/[0.06] text-[#69746D] transition hover:text-[#F5F7F5] disabled:opacity-50"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          {pdfError && (
            <div className="mb-4 rounded-xl border border-red-300/[0.08] bg-red-300/[0.03] px-4 py-3 text-xs leading-5 text-red-200/80">
              {pdfError}
            </div>
          )}

          {invoice?.itemsLoading ? (
            <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-emerald-200/[0.07] bg-white">
              <div className="text-center text-gray-500">
                <RefreshCw size={18} className="mx-auto animate-spin" />
                <p className="mt-3 text-sm">Loading invoice items...</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 text-gray-900 shadow-xl sm:p-10">
              <div className="flex flex-col justify-between gap-6 border-b border-gray-200 pb-7 sm:flex-row">
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    {profile?.business_name || "Your Business"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {profile?.full_name || ""}
                  </p>
                  {profile?.email && (
                    <p className="mt-1 text-xs text-gray-500">
                      {profile.email}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-3xl font-bold tracking-tight">INVOICE</p>
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    #{invoice?.invoice_number || "—"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 sm:justify-end">
                    <StatusBadge status={invoice?.status} />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 border-b border-gray-200 py-6 sm:grid-cols-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">Bill to</p>
                  <p className="mt-2 text-sm font-semibold">{client.company || client.name || "—"}</p>
                  {client.company && client.name && (
                    <p className="mt-1 text-xs text-gray-500">{client.name}</p>
                  )}
                  {client.email && <p className="mt-1 break-all text-xs text-gray-500">{client.email}</p>}
                  {client.phone && <p className="mt-1 text-xs text-gray-500">{client.phone}</p>}
                  {client.address && <p className="mt-1 whitespace-pre-line text-xs text-gray-500">{client.address}</p>}
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">Issue date</p>
                  <p className="mt-2 text-sm font-medium">{formatDate(invoice?.issue_date)}</p>
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">Due date</p>
                  <p className="mt-2 text-sm font-medium">{formatDate(invoice?.due_date)}</p>
                </div>
              </div>

              <div className="mt-7 overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-[1fr_0.25fr_0.45fr_0.45fr] gap-3 bg-gray-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-gray-400">No line items</div>
                  ) : (
                    items.map((item) => {
                      const quantity = Number(item.quantity || 0);
                      const unitPrice = Number(item.unit_price || 0);
                      const amount = Number.isFinite(Number(item.amount))
                        ? Number(item.amount)
                        : quantity * unitPrice;
                      return (
                        <div key={item.id} className="grid grid-cols-[1fr_0.25fr_0.45fr_0.45fr] gap-3 px-4 py-3 text-xs">
                          <span className="break-words text-gray-700">{item.description || "Item"}</span>
                          <span className="text-right text-gray-500">{quantity}</span>
                          <span className="text-right text-gray-500">{formatMoney(unitPrice, currency)}</span>
                          <span className="text-right font-medium text-gray-800">{formatMoney(amount, currency)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-7 flex justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <SummaryRow label="Subtotal" value={formatMoney(subtotal, currency)} />
                  <SummaryRow label="Tax" value={formatMoney(tax, currency)} />
                  <SummaryRow label="Discount" value={formatMoney(discount, currency)} />
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold">Total</p>
                      <p className="text-xl font-bold">{formatMoney(total, currency)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(invoice?.notes || invoice?.terms) && (
                <div className="mt-8 grid gap-6 border-t border-gray-200 pt-6 sm:grid-cols-2">
                  {invoice?.notes && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">Notes</p>
                      <p className="mt-2 whitespace-pre-line text-xs leading-5 text-gray-600">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice?.terms && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">Payment terms</p>
                      <p className="mt-2 whitespace-pre-line text-xs leading-5 text-gray-600">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>,
    document.body
  );
}

/*
 * Shared summary row used inside the (white-background) invoice
 * preview card above. This was previously missing from this file,
 * which caused a ReferenceError and crashed the whole app (blank/
 * black screen) whenever "View" was clicked on an invoice.
 */
function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function generateInvoicePdf(
  doc,
  {
    invoice,
    items,
    client,
    profile,
    currency,
    subtotal,
    tax,
    discount,
    total,
  }
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
    businessY += 4.5;
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
    doc.text(
      `Generated by InvoiceAI · ${currency}`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }
}

/* =========================================================
   PAYMENTS
========================================================= */

function PaymentsSection({
  invoices,
  currency,
  loading,
  error,
}) {
  const [search, setSearch] = useState("");

  const paidInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          getInvoiceStatus(invoice) ===
          "paid"
      ),
    [invoices]
  );

  const filteredPayments = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return paidInvoices;
    }

    return paidInvoices.filter(
      (invoice) => {
        const client =
          invoice.clients;

        return [
          invoice.invoice_number,
          client?.name,
          client?.company,
          client?.email,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );
      }
    );
  }, [paidInvoices, search]);

  const totalCollected =
    paidInvoices.reduce(
      (sum, invoice) =>
        sum + getInvoiceAmount(invoice),
      0
    );

  const averagePayment =
    paidInvoices.length > 0
      ? totalCollected /
        paidInvoices.length
      : 0;

  if (loading) {
    return <PaymentsLoading />;
  }

  if (error) {
    return (
      <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03]">
            <CircleDollarSign
              size={18}
              className="text-red-300/70"
            />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
            Couldn't load payments
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#69746D]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div>
        <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
          PAYMENT TRACKING
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
          Your payments.
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#69746D]">
          Track money collected from invoices that have been marked as paid.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <PaymentMetricCard
          label="Total collected"
          value={formatMoney(
            totalCollected,
            currency
          )}
          detail={
            paidInvoices.length === 1
              ? "1 payment"
              : `${paidInvoices.length} payments`
          }
        />

        <PaymentMetricCard
          label="Payments received"
          value={String(
            paidInvoices.length
          )}
          detail="Paid invoices"
        />

        <PaymentMetricCard
          label="Average payment"
          value={formatMoney(
            averagePayment,
            currency
          )}
          detail="Per paid invoice"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A]">
        <div className="flex flex-col gap-4 border-b border-emerald-200/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-medium">
              Payment history
            </p>

            <p className="mt-1 text-[10px] text-[#536058]">
              Payments are based on invoices marked as paid.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536058]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search payments..."
              className="h-10 w-full rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] pl-9 pr-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
            />
          </div>
        </div>

        {filteredPayments.length ===
        0 ? (
          <EmptyPaymentsState
            hasSearch={Boolean(
              search.trim()
            )}
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">
              <div className="grid grid-cols-[1.1fr_1.25fr_0.9fr_0.9fr_0.8fr] gap-4 border-b border-emerald-200/[0.05] px-6 py-3 text-[8px] uppercase tracking-[0.14em] text-[#536058]">
                <span>Invoice</span>
                <span>Client</span>
                <span>Invoice date</span>
                <span>Status</span>
                <span className="text-right">
                  Amount
                </span>
              </div>

              <div className="divide-y divide-emerald-200/[0.04]">
                {filteredPayments.map(
                  (invoice) => (
                    <PaymentRow
                      key={invoice.id}
                      invoice={invoice}
                      currency={currency}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentMetricCard({
  label,
  value,
  detail,
}) {
  return (
    <div className="rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[#536058]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-2 text-[10px] text-[#536058]">
        {detail}
      </p>
    </div>
  );
}

function PaymentRow({
  invoice,
  currency,
}) {
  const clientName =
    invoice.clients?.company ||
    invoice.clients?.name ||
    invoice.clients?.email ||
    "No client";

  return (
    <div className="grid grid-cols-[1.1fr_1.25fr_0.9fr_0.9fr_0.8fr] items-center gap-4 px-6 py-4 transition hover:bg-white/[0.015]">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-[#F5F7F5]">
          #{invoice.invoice_number}
        </p>

        <p className="mt-1 text-[9px] text-[#536058]">
          Payment from invoice
        </p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs text-[#69746D]">
          {clientName}
        </p>

        {invoice.clients?.email && (
          <p className="mt-1 truncate text-[9px] text-[#536058]">
            {invoice.clients.email}
          </p>
        )}
      </div>

      <p className="text-[10px] text-[#69746D]">
        {formatDate(
          invoice.issue_date
        )}
      </p>

      <StatusBadge status="paid" />

      <p className="text-right text-xs font-medium text-emerald-200">
        {formatMoney(
          getInvoiceAmount(invoice),
          currency
        )}
      </p>
    </div>
  );
}

function EmptyPaymentsState({
  hasSearch,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/[0.06] bg-emerald-300/[0.025]">
        {hasSearch ? (
          <Search
            size={18}
            className="text-[#536058]"
          />
        ) : (
          <CircleDollarSign
            size={18}
            className="text-[#536058]"
          />
        )}
      </div>

      <p className="mt-5 text-sm text-[#69746D]">
        {hasSearch
          ? "No payments found"
          : "No payments yet"}
      </p>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#536058]">
        {hasSearch
          ? "Try a different invoice number, client name, or company."
          : "Payments will appear here when you mark an invoice as paid."}
      </p>
    </div>
  );
}

/* =========================================================
   CLIENTS
========================================================= */

function ClientsSection({
  clients,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState("");

  const filteredClients = clients.filter(
    (client) => {
      const query = search
        .toLowerCase()
        .trim();

      if (!query) return true;

      return [
        client.name,
        client.email,
        client.company,
        client.phone,
        client.address,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    }
  );

  return (
    <div className="relative">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
            CLIENT MANAGEMENT
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Your clients.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#69746D]">
            Keep client information organized and ready for every invoice.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#F5F7F5] px-4 py-3 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0]"
        >
          <Plus size={14} />
          Add client
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A]">
        <div className="flex flex-col gap-4 border-b border-emerald-200/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-medium">
              All clients
            </p>

            <p className="mt-1 text-[10px] text-[#536058]">
              {clients.length}{" "}
              {clients.length === 1
                ? "client"
                : "clients"}{" "}
              in your workspace.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536058]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search clients..."
              className="h-10 w-full rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] pl-9 pr-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
            />
          </div>
        </div>

        {loading ? (
          <ClientsLoading />
        ) : error ? (
          <div className="p-6">
            <div className="rounded-xl border border-red-300/[0.08] bg-red-300/[0.03] px-4 py-4 text-xs leading-5 text-red-200/80">
              {error}
            </div>
          </div>
        ) : filteredClients.length ===
          0 ? (
          <EmptyClientsState
            hasSearch={Boolean(
              search.trim()
            )}
            onAdd={onAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_0.7fr] gap-4 border-b border-emerald-200/[0.05] px-6 py-3 text-[8px] uppercase tracking-[0.14em] text-[#536058]">
                <span>Client</span>
                <span>Company</span>
                <span>Contact</span>
                <span>Added</span>
                <span className="text-right">
                  Actions
                </span>
              </div>

              <div className="divide-y divide-emerald-200/[0.04]">
                {filteredClients.map(
                  (client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientRow({
  client,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_0.7fr] items-center gap-4 px-6 py-4 transition hover:bg-white/[0.015]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200/[0.07] bg-emerald-300/[0.04] text-[10px] font-medium text-emerald-200">
          {getInitials(client.name)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[#F5F7F5]">
            {client.name}
          </p>

          <p className="mt-1 truncate text-[9px] text-[#536058]">
            {client.email ||
              "No email provided"}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <Building2
          size={13}
          className="shrink-0 text-[#536058]"
        />

        <span className="truncate text-xs text-[#69746D]">
          {client.company ||
            "Independent"}
        </span>
      </div>

      <div className="space-y-1">
        {client.email && (
          <div className="flex items-center gap-2">
            <Mail
              size={11}
              className="text-[#536058]"
            />

            <span className="truncate text-[10px] text-[#69746D]">
              {client.email}
            </span>
          </div>
        )}

        {client.phone && (
          <div className="flex items-center gap-2">
            <CircleDollarSign
              size={11}
              className="text-[#536058]"
            />

            <span className="truncate text-[10px] text-[#69746D]">
              {client.phone}
            </span>
          </div>
        )}

        {!client.email &&
          !client.phone && (
            <span className="text-[10px] text-[#536058]">
              No contact details
            </span>
          )}
      </div>

      <p className="text-[10px] text-[#69746D]">
        {formatShortDate(
          client.created_at
        )}
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => onEdit(client)}
          aria-label={`Edit ${client.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200/[0.06] text-[#536058] transition hover:border-emerald-300/20 hover:text-emerald-200"
        >
          <Edit3 size={13} />
        </button>

        <button
          onClick={() => onDelete(client)}
          aria-label={`Delete ${client.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200/[0.06] text-[#536058] transition hover:border-red-300/20 hover:text-red-200"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function EmptyClientsState({
  hasSearch,
  onAdd,
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/[0.06] bg-emerald-300/[0.025]">
        {hasSearch ? (
          <Search
            size={18}
            className="text-[#536058]"
          />
        ) : (
          <Users
            size={18}
            className="text-[#536058]"
          />
        )}
      </div>

      <p className="mt-5 text-sm text-[#69746D]">
        {hasSearch
          ? "No clients found"
          : "No clients yet"}
      </p>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#536058]">
        {hasSearch
          ? "Try a different name, company, email, or phone number."
          : "Add your first client to start creating invoices and tracking your business relationships."}
      </p>

      {!hasSearch && (
        <button
          onClick={onAdd}
          className="mx-auto mt-6 flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05] px-4 py-2.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-300/[0.09]"
        >
          <Plus size={14} />
          Add your first client
        </button>
      )}
    </div>
  );
}

/* =========================================================
   CLIENT MODAL
========================================================= */

function ClientModal({
  userId,
  client,
  onClose,
  onSaved,
}) {
  const isEditing = Boolean(client);

  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    company: client?.company || "",
    phone: client?.phone || "",
    address: client?.address || "",
    notes: client?.notes || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !saving
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [onClose, saving]);

  const handleChange = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError(
        "Client name is required."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name,
        email:
          form.email.trim() || null,
        company:
          form.company.trim() || null,
        phone:
          form.phone.trim() || null,
        address:
          form.address.trim() || null,
        notes:
          form.notes.trim() || null,
      };

      if (isEditing) {
        const {
          error: updateError,
        } = await supabase
          .from("clients")
          .update(payload)
          .eq("id", client.id)
          .eq("user_id", userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("clients")
          .insert({
            ...payload,
            user_id: userId,
          });

        if (insertError) {
          throw insertError;
        }
      }

      await onSaved();
    } catch (saveError) {
      console.error(
        "Client save error:",
        saveError
      );

      setError(
        saveError?.message ||
          "We couldn't save this client."
      );
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-200/[0.08] bg-[#080C09] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-emerald-200/[0.06] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
              {isEditing
                ? "EDIT CLIENT"
                : "NEW CLIENT"}
            </p>

            <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              {isEditing
                ? "Update client"
                : "Add a client"}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200/[0.06] text-[#69746D] transition hover:text-[#F5F7F5] disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Client name"
              required
              value={form.name}
              onChange={(value) =>
                handleChange(
                  "name",
                  value
                )
              }
              placeholder="Alex Johnson"
            />

            <FormField
              label="Company"
              value={form.company}
              onChange={(value) =>
                handleChange(
                  "company",
                  value
                )
              }
              placeholder="Acme Inc."
            />

            <FormField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) =>
                handleChange(
                  "email",
                  value
                )
              }
              placeholder="alex@company.com"
            />

            <FormField
              label="Phone"
              value={form.phone}
              onChange={(value) =>
                handleChange(
                  "phone",
                  value
                )
              }
              placeholder="+1 555 000 0000"
            />
          </div>

          <div className="mt-5">
            <FormField
              label="Address"
              value={form.address}
              onChange={(value) =>
                handleChange(
                  "address",
                  value
                )
              }
              placeholder="123 Main Street, New York"
            />
          </div>

          <div className="mt-5">
            <label className="block">
              <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#536058]">
                Notes
              </span>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  handleChange(
                    "notes",
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Optional notes about this client..."
                className="w-full resize-none rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] px-3 py-3 text-xs leading-5 text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
              />
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-300/[0.08] bg-red-300/[0.03] px-3 py-3 text-xs leading-5 text-red-200/80">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={13}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <span>
                  {isEditing
                    ? "Save changes"
                    : "Add client"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   SHARED UI
========================================================= */

function MetricCard({
  label,
  value,
  change,
}) {
  return (
    <div className="rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#536058]">
        {label}
      </p>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-[-0.04em]">
          {value}
        </p>

        <span className="rounded-full bg-emerald-300/[0.06] px-2 py-1 text-[9px] text-emerald-300/70">
          {change}
        </span>
      </div>
    </div>
  );
}

function RevenueCard({
  chart,
  currency,
}) {
  const maxValue = Math.max(
    ...chart.map(
      (item) => item.value
    ),
    1
  );

  return (
    <div className="rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#F5F7F5]">
            Revenue
          </p>

          <p className="mt-1 text-[10px] text-[#536058]">
            Paid invoices · Last 30 days
          </p>
        </div>

        <ArrowUpRight
          size={16}
          className="text-emerald-300/60"
        />
      </div>

      {chart.every(
        (item) => item.value === 0
      ) ? (
        <div className="flex h-48 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-[#69746D]">
              No revenue activity yet
            </p>

            <p className="mt-1 text-xs text-[#536058]">
              Paid invoices will appear on this chart.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex h-48 items-end gap-2">
          {chart.map(
            (item, index) => {
              const height =
                item.value > 0
                  ? Math.max(
                      (item.value /
                        maxValue) *
                        100,
                      6
                    )
                  : 2;

              return (
                <div
                  key={`${item.date}-${index}`}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-emerald-300/[0.13] transition group-hover:bg-emerald-300/[0.22]"
                    style={{
                      height: `${height}%`,
                    }}
                    title={`${formatMoney(
                      item.value,
                      currency
                    )} · ${item.label}`}
                  />
                </div>
              );
            }
          )}
        </div>
      )}

      <div className="mt-3 flex justify-between text-[8px] uppercase tracking-[0.12em] text-[#536058]">
        <span>
          {chart[0]?.label}
        </span>

        <span>
          {
            chart[
              Math.floor(
                chart.length / 2
              )
            ]?.label
          }
        </span>

        <span>
          {
            chart[
              chart.length - 1
            ]?.label
          }
        </span>
      </div>
    </div>
  );
}

function CollectionHealth({
  rate,
}) {
  const normalizedRate = Math.min(
    Math.max(Number(rate) || 0, 0),
    100
  );

  const circumference =
    2 * Math.PI * 52;

  const dashOffset =
    circumference -
    (normalizedRate / 100) *
      circumference;

  return (
    <div className="rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5 sm:p-6">
      <p className="text-xs font-medium">
        Collection health
      </p>

      <div className="mt-8 flex justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="absolute inset-0 h-full w-full -rotate-90"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(110,231,183,0.08)"
              strokeWidth="10"
            />

            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(110,231,183,0.5)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={
                circumference
              }
              strokeDashoffset={
                dashOffset
              }
            />
          </svg>

          <div className="text-center">
            <div className="text-3xl font-semibold">
              {Math.round(
                normalizedRate
              )}
              %
            </div>

            <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#536058]">
              {getCollectionLabel(
                normalizedRate
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentInvoices({
  invoices,
  currency,
}) {
  const recentInvoices =
    invoices.slice(0, 6);

  return (
    <div className="mt-4 rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium">
            Recent invoices
          </p>

          <p className="mt-1 text-[10px] text-[#536058]">
            Your latest invoice activity.
          </p>
        </div>
      </div>

      {recentInvoices.length ===
      0 ? (
        <div className="mt-5 border-t border-emerald-200/[0.05] pt-5">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/[0.06] bg-emerald-300/[0.025]">
              <FileText
                size={16}
                className="text-[#536058]"
              />
            </div>

            <p className="mt-4 text-sm text-[#69746D]">
              No invoices yet
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-[#536058]">
              Create your first invoice and your activity will start appearing here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto border-t border-emerald-200/[0.05] pt-3">
          <div className="min-w-[620px]">
            <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.8fr] gap-4 px-3 py-2 text-[8px] uppercase tracking-[0.14em] text-[#536058]">
              <span>Invoice</span>
              <span>Client</span>
              <span>Status</span>
              <span className="text-right">
                Amount
              </span>
            </div>

            <div className="space-y-1">
              {recentInvoices.map(
                (invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    currency={currency}
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceRow({
  invoice,
  currency,
}) {
  const clientName =
    invoice.clients?.company ||
    invoice.clients?.name ||
    invoice.clients?.email ||
    "No client";

  return (
    <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.8fr] items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-white/[0.02]">
      <div>
        <p className="text-xs font-medium text-[#F5F7F5]">
          #{invoice.invoice_number}
        </p>

        <p className="mt-1 text-[9px] text-[#536058]">
          {formatDate(
            invoice.issue_date
          )}
        </p>
      </div>

      <p className="truncate text-xs text-[#69746D]">
        {clientName}
      </p>

      <StatusBadge
        status={getInvoiceStatus(
          invoice
        )}
      />

      <p className="text-right text-xs font-medium">
        {formatMoney(
          getInvoiceAmount(invoice),
          currency
        )}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const normalizedStatus =
    String(status || "draft")
      .trim()
      .toLowerCase();

  const styles = {
    draft:
      "bg-white/[0.04] text-[#8A948D]",
    sent:
      "bg-blue-300/[0.06] text-blue-200/70",
    paid:
      "bg-emerald-300/[0.06] text-emerald-300/80",
    overdue:
      "bg-orange-300/[0.06] text-orange-200/80",
    cancelled:
      "bg-red-300/[0.06] text-red-200/70",
  };

  return (
    <span
      className={`w-fit rounded-full px-2 py-1 text-[8px] uppercase tracking-[0.08em] ${
        styles[normalizedStatus] ||
        styles.draft
      }`}
    >
      {normalizedStatus || "draft"}
    </span>
  );
}

function DashboardLoading() {
  return (
    <div className="relative">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="h-3 w-28 animate-pulse rounded bg-white/[0.04]" />

          <div className="mt-3 h-9 w-72 max-w-full animate-pulse rounded bg-white/[0.04]" />

          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/[0.03]" />
        </div>

        <div className="h-11 w-36 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-emerald-200/[0.05] bg-[#090D0A]"
            />
          )
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="h-80 animate-pulse rounded-2xl border border-emerald-200/[0.05] bg-[#090D0A]" />

        <div className="h-80 animate-pulse rounded-2xl border border-emerald-200/[0.05] bg-[#090D0A]" />
      </div>

      <div className="mt-4 h-72 animate-pulse rounded-2xl border border-emerald-200/[0.05] bg-[#090D0A]" />
    </div>
  );
}

function InvoicesLoading() {
  return (
    <div className="relative">
      <div className="h-3 w-36 animate-pulse rounded bg-white/[0.04]" />

      <div className="mt-3 h-9 w-64 animate-pulse rounded bg-white/[0.04]" />

      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/[0.03]" />

      <div className="mt-8 h-10 w-full animate-pulse rounded-xl bg-white/[0.025]" />

      <div className="mt-4 rounded-2xl border border-emerald-200/[0.05] bg-[#090D0A] p-6">
        <div className="h-10 w-full animate-pulse rounded-xl bg-white/[0.025]" />

        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-white/[0.02]"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentsLoading() {
  return (
    <div className="relative">
      <div className="h-3 w-36 animate-pulse rounded bg-white/[0.04]" />

      <div className="mt-3 h-9 w-64 animate-pulse rounded bg-white/[0.04]" />

      <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-white/[0.03]" />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-emerald-200/[0.05] bg-[#090D0A]"
            />
          )
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200/[0.05] bg-[#090D0A] p-6">
        <div className="h-10 w-full animate-pulse rounded-xl bg-white/[0.025]" />

        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-white/[0.02]"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function ClientsLoading() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-white/[0.025]"
          />
        )
      )}
    </div>
  );
}

function SettingsSection({
  user,
  profile,
  currency,
  onSaved,
}) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    business_name: profile?.business_name || "",
    currency: currency || "USD",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      full_name: profile?.full_name || "",
      business_name: profile?.business_name || "",
      currency: currency || "USD",
    });
  }, [
    profile?.full_name,
    profile?.business_name,
    currency,
  ]);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setError("Your account is not available. Please sign in again.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const payload = {
        id: user.id,
        email: user.email || null,
        full_name: form.full_name.trim() || null,
        business_name: form.business_name.trim() || null,
        currency: form.currency,
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(payload, {
          onConflict: "id",
        });

      if (updateError) {
        throw updateError;
      }

      setSaved(true);

      if (onSaved) {
        await onSaved();
      }
    } catch (saveError) {
      console.error("Settings save error:", saveError);

      setError(
        saveError?.message ||
          "We couldn't save your settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative max-w-4xl">
      <div>
        <p className="text-[9px] uppercase tracking-[0.18em] text-emerald-300/60">
          ACCOUNT SETTINGS
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
          Settings.
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#69746D]">
          Manage your profile, business information, and invoice preferences.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <section className="rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/[0.06] text-emerald-300/70">
              <Users size={16} />
            </div>

            <div>
              <h3 className="text-sm font-medium">
                Profile
              </h3>
              <p className="mt-1 text-[10px] leading-5 text-[#536058]">
                Your personal information used across the workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <SettingsField
              label="Full name"
              value={form.full_name}
              onChange={(value) =>
                handleChange("full_name", value)
              }
              placeholder="Your name"
            />

            <SettingsField
              label="Email"
              value={user?.email || ""}
              disabled
              placeholder="your@email.com"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/[0.06] text-emerald-300/70">
              <Building2 size={16} />
            </div>

            <div>
              <h3 className="text-sm font-medium">
                Business
              </h3>
              <p className="mt-1 text-[10px] leading-5 text-[#536058]">
                Set the business name that identifies your workspace.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <SettingsField
              label="Business name"
              value={form.business_name}
              onChange={(value) =>
                handleChange("business_name", value)
              }
              placeholder="Your business name"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-200/[0.07] bg-[#090D0A] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/[0.06] text-emerald-300/70">
              <CircleDollarSign size={16} />
            </div>

            <div>
              <h3 className="text-sm font-medium">
                Invoice preferences
              </h3>
              <p className="mt-1 text-[10px] leading-5 text-[#536058]">
                Choose the default currency used when creating invoices.
              </p>
            </div>
          </div>

          <div className="mt-6 max-w-sm">
            <label className="block">
              <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#536058]">
                Default currency
              </span>

              <select
                value={form.currency}
                onChange={(event) =>
                  handleChange(
                    "currency",
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-emerald-200/[0.07] bg-[#0B100C] px-3 text-xs text-[#F5F7F5] outline-none focus:border-emerald-300/20"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
                <option value="SGD">SGD — Singapore Dollar</option>
              </select>
            </label>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-300/[0.08] bg-red-300/[0.03] px-4 py-3 text-xs leading-5 text-red-200/80">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-xl border border-emerald-300/[0.10] bg-emerald-300/[0.04] px-4 py-3 text-xs leading-5 text-emerald-200/80">
            Settings saved successfully.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3 text-xs font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw
                  size={13}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-[#536058]">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] px-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

function PlaceholderSection({
  title,
}) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/[0.07] bg-emerald-300/[0.03]">
          <Zap
            size={18}
            className="text-emerald-300/70"
          />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#69746D]">
          This workspace module is coming next as we build the InvoiceAI platform.
        </p>
      </div>
    </div>
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
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-emerald-200/[0.07] bg-white/[0.02] px-3 text-xs text-[#F5F7F5] outline-none placeholder:text-[#536058] focus:border-emerald-300/20"
      />
    </label>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function buildRevenueChart(invoices) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const days = Array.from(
    { length: 12 },
    (_, index) => {
      const date = new Date(today);

      date.setDate(
        today.getDate() -
          (11 - index) * 2
      );

      return {
        date: toDateKey(date),
        label:
          date.toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          ),
        value: 0,
      };
    }
  );

  const paidInvoices = invoices.filter(
    (invoice) =>
      getInvoiceStatus(invoice) ===
      "paid"
  );

  paidInvoices.forEach(
    (invoice) => {
      if (!invoice.issue_date) {
        return;
      }

      const invoiceDate = new Date(
        `${invoice.issue_date}T00:00:00`
      );

      if (
        Number.isNaN(
          invoiceDate.getTime()
        )
      ) {
        return;
      }

      const difference = Math.floor(
        (today.getTime() -
          invoiceDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (
        difference < 0 ||
        difference > 29
      ) {
        return;
      }

      const bucket = Math.min(
        Math.floor(
          (29 - difference) / 2
        ),
        11
      );

      if (days[bucket]) {
        days[bucket].value +=
          getInvoiceAmount(invoice);
      }
    }
  );

  return days;
}

function formatMoney(
  value,
  currency
) {
  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency:
          currency || "USD",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value || 0)
    );
  } catch {
    return `$${Math.round(
      Number(value || 0)
    ).toLocaleString()}`;
  }
}

function formatDate(dateString) {
  if (!dateString) {
    return "No date";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatShortDate(
  dateString
) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(
    dateString
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function toDateKey(date) {
  return date
    .toISOString()
    .slice(0, 10);
}

function getInitials(name) {
  if (!name) return "?";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function getCollectionLabel(rate) {
  if (rate >= 90) return "Excellent";

  if (rate >= 75) return "Healthy";

  if (rate >= 50) return "Watch";

  return "Needs attention";
}

function capitalize(value) {
  if (!value) return "";

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
