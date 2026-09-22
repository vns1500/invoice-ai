import Navbar from "./components/Navbar";
import Hero3D from "./components/Hero3D";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import DashboardPreview from "./components/DashboardPreview";

function App() {
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

export default App;