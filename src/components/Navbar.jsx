import { Menu, X, ArrowUpRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5"
    >
      {/* Ambient glow behind navbar */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-[70%] -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Main glass shell */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/[0.10] bg-[#080D09]/[0.88] shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_40px_rgba(34,197,94,0.04)] backdrop-blur-2xl">
          
          {/* Top lighting edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />

          {/* Subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(134,239,172,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,.7) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative flex h-[66px] items-center justify-between px-4 sm:px-5 lg:px-6">

            {/* Logo */}
            <a href="#" className="group relative flex items-center gap-3">
              
              {/* Logo glow */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.12, 0.22, 0.12],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 h-10 w-10 rounded-xl bg-emerald-400 blur-xl"
              />

              {/* 3D logo container */}
              <div className="relative">
                <motion.div
                  whileHover={{
                    rotateY: 12,
                    rotateX: -8,
                    scale: 1.05,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_25px_rgba(34,197,94,0.18)]"
                  style={{ perspective: "600px" }}
                >
                  {/* Internal light */}
                  <div className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-white/20 blur-md" />

                  {/* Money-flow line */}
                  <motion.div
                    animate={{ x: [-14, 20] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute h-px w-8 bg-emerald-100/70 shadow-[0_0_8px_rgba(187,247,208,0.8)]"
                  />

                  <span className="relative text-sm font-black tracking-tight text-white">
                    I
                  </span>
                </motion.div>

                {/* Live signal */}
                <motion.span
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#080D09] bg-emerald-300 shadow-[0_0_8px_rgba(74,222,128,0.9)]"
                />
              </div>

              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-[17px] font-semibold tracking-tight text-[#F5F7F5]">
                    Invoice
                  </span>
                  <span className="text-[17px] font-semibold tracking-tight text-emerald-400">
                    AI
                  </span>
                </div>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <Activity size={8} className="text-emerald-400/70" />
                  <span className="text-[7px] uppercase tracking-[0.16em] text-[#536058]">
                    Financial system online
                  </span>
                </div>
              </div>
            </a>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-1 rounded-xl border border-white/[0.05] bg-white/[0.018] p-1 md:flex">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group relative rounded-lg px-4 py-2 text-[12px] font-medium text-[#8A948D] transition-all duration-300 hover:bg-emerald-400/[0.07] hover:text-[#F5F7F5]"
                >
                  {/* Hover glow */}
                  <span className="absolute inset-x-3 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 transition-all duration-300 group-hover:scale-x-100 group-hover:opacity-100" />

                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 md:flex">
              
              <button className="group rounded-lg px-3 py-2 text-[12px] font-medium text-[#8A948D] transition hover:text-[#F5F7F5]">
                Log in
              </button>

              <motion.button
                whileHover={{
                  y: -1,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-emerald-300/20 bg-gradient-to-b from-[#F5F7F5] to-[#DDE7DF] px-4 py-2.5 text-[12px] font-semibold text-[#071009] shadow-[0_8px_25px_rgba(34,197,94,0.10)]"
              >
                {/* Button shine */}
                <motion.span
                  animate={{ x: ["-120%", "160%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-y-0 w-8 rotate-12 bg-white/50 blur-md"
                />

                <span className="relative">Get started</span>

                <ArrowUpRight
                  size={13}
                  className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setOpen(!open)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/10 bg-emerald-400/[0.04] text-[#8A948D] transition hover:border-emerald-300/20 hover:bg-emerald-400/[0.08] hover:text-emerald-300 md:hidden"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X size={19} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu size={19} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile navigation */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden md:hidden"
              >
                <div className="border-t border-emerald-300/[0.08] px-4 pb-5 pt-4">
                  
                  <div className="space-y-1">
                    {links.map((link, index) => (
                      <motion.a
                        key={link.label}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                        }}
                        className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm text-[#8A948D] transition hover:bg-emerald-400/[0.05] hover:text-[#F5F7F5]"
                      >
                        <span>{link.label}</span>

                        <ArrowUpRight
                          size={14}
                          className="text-[#536058] transition group-hover:text-emerald-300"
                        />
                      </motion.a>
                    ))}
                  </div>

                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#F5F7F5] to-[#DDE7DF] px-4 py-3 text-sm font-semibold text-[#071009] shadow-[0_8px_25px_rgba(34,197,94,0.10)]"
                  >
                    Get started
                    <ArrowUpRight size={14} />
                  </motion.button>

                  {/* Mobile status */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <motion.span
                      animate={{
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                    />

                    <span className="text-[8px] uppercase tracking-[0.16em] text-[#536058]">
                      Financial system online
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}