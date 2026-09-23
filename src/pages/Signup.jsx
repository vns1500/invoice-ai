import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Receipt,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await signUp(
      form.email.trim(),
      form.password
    );

    if (authError) {
      setError(
        authError.message ||
          "Unable to create your account. Please try again."
      );
      setLoading(false);
      return;
    }

    if (data?.session) {
      navigate("/app", { replace: true });
      return;
    }

    setSuccess(
      "Your account has been created. Check your email to confirm your address before signing in."
    );

    setLoading(false);
  };

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

      <div className="relative mx-auto flex min-h-screen max-w-xl items-center px-5 py-10">
        <div className="w-full">
          <Link
            to="/"
            className="mx-auto mb-8 flex w-fit items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#69746D] transition hover:text-[#F5F7F5]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200/[0.08] bg-emerald-300/[0.04]">
              <Receipt size={14} className="text-emerald-300" />
            </span>
            INVOICEAI
          </Link>

          <div className="rounded-[1.75rem] border border-emerald-200/[0.08] bg-[#090D0A] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-9">
            <div className="mb-8">
              <p className="text-[10px] font-medium tracking-[0.22em] text-emerald-300/60">
                GET STARTED
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#F5F7F5] sm:text-4xl">
                Build a better payment flow.
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#69746D]">
                Create your InvoiceAI workspace and start organizing your
                invoicing workflow.
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

              <PasswordField
                label="Password"
                value={form.password}
                show={showPassword}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                onToggle={() =>
                  setShowPassword((value) => !value)
                }
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    password: value,
                  }))
                }
              />

              <PasswordField
                label="Confirm password"
                value={form.confirmPassword}
                show={showPassword}
                placeholder="Repeat your password"
                autoComplete="new-password"
                onToggle={() =>
                  setShowPassword((value) => !value)
                }
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: value,
                  }))
                }
              />

              {error && (
                <div className="rounded-xl border border-red-300/10 bg-red-300/[0.035] px-4 py-3 text-xs leading-5 text-red-200/70">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.035] px-4 py-3 text-xs leading-5 text-emerald-200/70">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3.5 text-sm font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating account
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 flex items-start gap-3 rounded-xl border border-emerald-200/[0.06] bg-emerald-300/[0.02] p-4">
              <Check
                size={15}
                className="mt-0.5 shrink-0 text-emerald-300/70"
              />

              <p className="text-[11px] leading-5 text-[#69746D]">
                Your account will be secured through Supabase
                authentication. We never store your password directly.
              </p>
            </div>

            <p className="mt-7 text-center text-xs text-[#536058]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-emerald-300/80 transition hover:text-emerald-300"
              >
                Sign in
              </Link>
            </p>
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

function PasswordField({
  label,
  value,
  show,
  placeholder,
  autoComplete,
  onToggle,
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

      <div className="relative">
        <input
          id={label.toLowerCase()}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-xl border border-emerald-200/[0.08] bg-white/[0.025] px-4 py-3.5 pr-11 text-sm text-[#F5F7F5] outline-none transition placeholder:text-[#536058] focus:border-emerald-300/30 focus:bg-emerald-300/[0.025]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#536058] transition hover:text-[#8A948D]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}