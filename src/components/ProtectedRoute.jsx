import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050706]">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          <span className="text-xs uppercase tracking-[0.18em] text-[#536058]">
            Loading InvoiceAI
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}