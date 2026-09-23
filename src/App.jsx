import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero3D from "./components/Hero3D";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import DashboardPreview from "./components/DashboardPreview";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicInvoice from "./pages/PublicInvoice";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050507]">
      <Navbar />

      <main>
        <section id="hero" className="relative">
          <Hero3D />
        </section>

        <Features />

        <section id="how-it-works">
          <HowItWorks />
        </section>

        <section id="dashboard">
          <DashboardPreview />
        </section>

        <section id="pricing">
          <Pricing />
        </section>

        <section id="faq">
          <FAQ />
        </section>

        <section id="cta">
          <CTA />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />
<Route
  path="/invoice/:token"
  element={<PublicInvoice />}
/>
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;