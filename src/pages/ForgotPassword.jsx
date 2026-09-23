import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Receipt,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error: resetError } = await resetPassword(
      email.trim()
    );

    if (resetError) {
      setError(
        resetError.message ||
          "Unable to send the reset email. Please try again."
      );
      setLoading(false);
      return;
    }

    setSent(true);
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
            <Receipt size={14} className="text-emerald-300" />
            INVOICEAI
          </Link>

          <div className="rounded-[1.75rem] border border-emerald-200/[0.08] bg-[#090D0A] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-9">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04]">
                  <CheckCircle2
                    size={24}
                    className="text-emerald-300"
                  />
                </div>

                <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#F5F7F5]">
                  Check your inbox
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#69746D]">
                  If an InvoiceAI account exists for{" "}
                  <span className="text-[#8A948D]">
                    {email}
                  </span>
                  , we've sent a password reset link.
                </p>

                <Link
                  to="/login"
                  className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-emerald-300/80 transition hover:text-emerald-300"
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200/[0.08] bg-emerald-300/[0.04]">
                    <Mail
                      size={18}
                      className="text-emerald-300"
                    />
                  </div>

                  <p className="text-[10px] font-medium tracking-[0.22em] text-emerald-300/60">
                    ACCOUNT RECOVERY
                  </p>

                  <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#F5F7F5]">
                    Reset your password.
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-[#69746D]">
                    Enter your email and we'll send you a secure
                    password reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium text-[#8A948D]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-emerald-200/[0.08] bg-white/[0.025] px-4 py-3.5 text-sm text-[#F5F7F5] outline-none transition placeholder:text-[#536058] focus:border-emerald-300/30 focus:bg-emerald-300/[0.025]"
                  />

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-300/10 bg-red-300/[0.035] px-4 py-3 text-xs leading-5 text-red-200/70">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3.5 text-sm font-semibold text-[#050706] transition hover:bg-[#BBF7D0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Sending
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </form>

                <Link
                  to="/login"
                  className="mt-7 flex items-center justify-center gap-2 text-xs text-[#536058] transition hover:text-[#8A948D]"
                >
                  <ArrowLeft size={13} />
                  Back to sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}