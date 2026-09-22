import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export default function Hero() {
  return (
<section className="relative overflow-hidden pb-8 pt-32 lg:pb-12 lg:pt-40">
      {/* Background glow */}
      <div className="absolute left-1/2 top-20 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-5 text-center lg:px-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3.5 py-1.5 text-xs font-medium text-violet-300"
        >
          <Sparkles size={13} />
          AI-powered invoicing for modern businesses
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl"
        >
          Invoicing that works
          <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            as hard as you do.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg"
        >
          Create professional invoices, automate payment reminders, and
          understand your cash flow—all from one intelligent workspace.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <button className="group flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-white/[0.05] transition hover:bg-slate-200">
            Start for free

            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-0.5"
            />
          </button>

          <button className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]">
            <Play size={14} fill="currentColor" />
            See how it works
          </button>
        </motion.div>

        <p className="mt-4 text-xs text-slate-600">
          No credit card required · Free 14-day trial
        </p>
      </div>
    </section>
  );
}