import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const benefits = [
  "Create and manage invoices",
  "Track payments in one place",
  "See your cash flow clearly",
];

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error: authError } = await signIn(
      form.email.trim(),
      form.password
    );

    if (authError) {
      setError(
        authError.message ||
          "Unable to sign in. Please check your credentials."
      );
      setLoading(false);
      return;
    }

    const destination = location.state?.from || "/app";
    navigate(destination, { replace: true });
  };

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Keep your money moving."
      description="Sign in to your InvoiceAI workspace and continue managing your invoices, payments, and cash flow."
      benefits={benefits}
    >
      <div className="mb-8">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200/[0.08] bg-emerald-300/[0.04]">
          <Receipt size={18} className="text-emerald-300" />
        </div>

        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#F5F7F5]">
          Sign in
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#69746D]">
          Access your InvoiceAI workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          label="Email"
          type="email"
          value={form.email}
          placeholder="you@example.com"
          autoComplete="email"
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              email: value,
            }))
          }
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-medium text-[#8A948D]"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs text-emerald-300/70 transition hover:text-emerald-300"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-emerald-200/[0.08] bg-white/[0.025] px-4 py-3.5 pr-11 text-sm text-[#F5F7F5] outline-none transition placeholder:text-[#536058] focus:border-emerald-300/30 focus:bg-emerald-300/[0.025]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#536058] transition hover:text-[#8A948D]"
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3.5 text-sm font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Signing in
            </>
          ) : (
            <>
              Sign in
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-xs text-[#536058]">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-emerald-300/80 transition hover:text-emerald-300"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({
  eyebrow,
  title,
  description,
  benefits,
  children,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050706]">
      <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/[0.035] blur-[140px]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.025]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(134,239,172,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[1fr_460px] lg:px-8">
        <div className="hidden lg:block">
          <Link
            to="/"
            className="mb-16 inline-flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#69746D] transition hover:text-[#F5F7F5]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200/[0.08] bg-emerald-300/[0.04]">
              <Receipt size={13} className="text-emerald-300" />
            </span>
            INVOICEAI
          </Link>

          <div className="max-w-xl">
            <p className="text-[10px] font-medium tracking-[0.22em] text-emerald-300/60">
              {eyebrow}
            </p>

            <h2 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#F5F7F5] xl:text-6xl">
              {title}
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#69746D]">
              {description}
            </p>

            <div className="mt-10 space-y-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-[#8A948D]"
                >
                  <CheckCircle2
                    size={15}
                    className="text-emerald-300/70"
                  />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-[#536058]">
            <ShieldCheck size={12} />
            Secure authentication powered by Supabase
          </div>
        </div>

        <div className="w-full">
          <div className="mb-8 lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#69746D]"
            >
              <Receipt size={14} className="text-emerald-300" />
              INVOICEAI
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-emerald-200/[0.08] bg-[#090D0A] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-[9px] uppercase tracking-[0.14em] text-[#536058]">
            InvoiceAI / application access
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  placeholder,
  autoComplete,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={label.toLowerCase()}
        className="mb-2 block text-xs font-medium text-[#8A948D]"
      >
        {label}
      </label>

      <input
        id={label.toLowerCase()}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-emerald-200/[0.08] bg-white/[0.025] px-4 py-3.5 text-sm text-[#F5F7F5] outline-none transition placeholder:text-[#536058] focus:border-emerald-300/30 focus:bg-emerald-300/[0.025]"
      />
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="rounded-xl border border-red-300/10 bg-red-300/[0.035] px-4 py-3 text-xs leading-5 text-red-200/70">
      {message}
    </div>
  );
}