import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Receipt,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await updatePassword(
      password
    );

    if (updateError) {
      setError(
        updateError.message ||
          "Unable to update your password. Please request a new reset link."
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050706] px-5">
        <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/[0.035] blur-[140px]" />

        <div className="relative w-full max-w-md rounded-[1.75rem] border border-emerald-200/[0.08] bg-[#090D0A] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04]">
            <CheckCircle2
              size={24}
              className="text-emerald-300"
            />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#F5F7F5]">
            Password updated
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#69746D]">
            Your InvoiceAI password has been changed successfully.
          </p>

          <button
            onClick={() => navigate("/app", { replace: true })}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3.5 text-sm font-semibold text-[#050706] transition hover:bg-[#BBF7D0]"
          >
            Continue to InvoiceAI
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050706] px-5">
      <div className="pointer-events-none absolute left-1/2 top-[-240px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/[0.035] blur-[140px]" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mx-auto mb-8 flex w-fit items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#69746D]"
        >
          <Receipt size={14} className="text-emerald-300" />
          INVOICEAI
        </Link>

        <div className="rounded-[1.75rem] border border-emerald-200/[0.08] bg-[#090D0A] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-9">
          <p className="text-[10px] font-medium tracking-[0.22em] text-emerald-300/60">
            NEW PASSWORD
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#F5F7F5]">
            Choose a new password.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#69746D]">
            Set a new password for your InvoiceAI account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <PasswordField
              label="New password"
              value={password}
              show={showPassword}
              onToggle={() =>
                setShowPassword((value) => !value)
              }
              onChange={setPassword}
            />

            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              show={showPassword}
              onToggle={() =>
                setShowPassword((value) => !value)
              }
              onChange={setConfirmPassword}
            />

            {error && (
              <div className="rounded-xl border border-red-300/10 bg-red-300/[0.035] px-4 py-3 text-xs leading-5 text-red-200/70">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3.5 text-sm font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Updating
                </>
              ) : (
                <>
                  Update password
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={label}
        className="mb-2 block text-xs font-medium text-[#8A948D]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={label}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
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