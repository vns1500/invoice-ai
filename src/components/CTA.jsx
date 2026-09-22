import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";

function FlowNode({ type, label, delay, active }) {
  return (
    <motion.div
      animate={{
        y: active ? [0, -7, 0] : [0, -4, 0],
        opacity: active ? 1 : 0.7,
      }}
      transition={{
        duration: active ? 1.8 : 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute"
    >
      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition ${
          active
            ? "border-emerald-400/30 bg-emerald-400/[0.08] shadow-[0_0_30px_rgba(34,197,94,0.12)]"
            : "border-emerald-200/[0.08] bg-white/[0.025]"
        }`}
      >
        {type === "invoice" && (
          <div className="h-4 w-3 rounded-[2px] border border-emerald-300/70">
            <div className="mx-auto mt-1 h-px w-1.5 bg-emerald-300/50" />
            <div className="mx-auto mt-1 h-px w-1.5 bg-emerald-300/30" />
          </div>
        )}

        {type === "client" && (
          <div className="relative h-4 w-4">
            <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-400" />
            <div className="absolute bottom-0 left-1/2 h-2.5 w-3 -translate-x-1/2 rounded-t-full border border-slate-400/60" />
          </div>
        )}

        {type === "payment" && (
          <Zap
            size={15}
            className={
              active ? "text-emerald-300" : "text-slate-500"
            }
          />
        )}

        {type === "complete" && (
          <Check size={15} className="text-emerald-300" />
        )}
      </div>

      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[7px] uppercase tracking-[0.16em] text-slate-700">
        {label}
      </div>
    </motion.div>
  );
}

function FlowParticle({ delay, duration }) {
  return (
    <motion.div
      animate={{
        left: ["0%", "100%"],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-200 shadow-[0_0_14px_rgba(134,239,172,0.9)]"
    />
  );
}

const copyVariants = {
  hidden: {
    opacity: 0,
    x: -45,
    y: 20,
  },

  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    x: -35,
    y: -25,
    transition: {
      duration: 0.55,
      ease: "easeIn",
    },
  },
};

const visualVariants = {
  hidden: {
    opacity: 0,
    x: 50,
    scale: 0.94,
  },

  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1,
      delay: 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    x: 40,
    scale: 0.96,
    transition: {
      duration: 0.6,
      ease: "easeIn",
    },
  },
};

const signalVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.45,
    },
  },
};

export default function CTA() {
  const [started, setStarted] = useState(false);

  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, {
    amount: 0.15,
    margin: "-5% 0px -5% 0px",
  });

  const animationState = isInView ? "visible" : "hidden";

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050706] py-32"
    >
      {/* Large ambient glow */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.72,
        }}
        animate={{
          opacity: isInView ? 1 : 0.3,
          scale: isInView ? 1 : 0.82,
        }}
        transition={{
          duration: 1.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/[0.035] blur-[160px]"
      />

      {/* Ambient horizontal sweep */}
      <motion.div
        initial={{
          x: "-100%",
          opacity: 0,
        }}
        animate={
          isInView
            ? {
                x: "100%",
                opacity: [0, 0.4, 0],
              }
            : {
                x: "-100%",
                opacity: 0,
              }
        }
        transition={{
          duration: 2.4,
          delay: 0.35,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Main visual */}
        <motion.div
          initial={{
            opacity: 0.65,
            y: 55,
            scale: 0.985,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }
              : {
                  opacity: 0.65,
                  y: -35,
                  scale: 0.985,
                }
          }
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative overflow-hidden rounded-[2rem] border border-emerald-200/[0.08] bg-[#090D0A]"
        >
          {/* Background grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(134,239,172,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Grid scan */}
          <motion.div
            initial={{
              y: "-100%",
              opacity: 0,
            }}
            animate={
              isInView
                ? {
                    y: "100%",
                    opacity: [0, 0.3, 0],
                  }
                : {
                    y: "-100%",
                    opacity: 0,
                  }
            }
            transition={{
              duration: 1.8,
              delay: 0.45,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-emerald-300/[0.04] to-transparent"
          />

          {/* Radial glow */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.65,
            }}
            animate={{
              opacity: isInView ? 1 : 0.35,
              scale: isInView ? 1 : 0.8,
            }}
            transition={{
              duration: 1.2,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.035] blur-[100px]"
          />

          <div className="relative grid min-h-[620px] lg:grid-cols-[0.85fr_1.15fr]">
            {/* Copy */}
            <motion.div
              variants={copyVariants}
              initial="hidden"
              animate={animationState}
              className="relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                  scale: 0.96,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }
                    : {
                        opacity: 0,
                        y: 15,
                        scale: 0.96,
                      }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/[0.08] bg-emerald-200/[0.025] px-3 py-1.5"
              >
                <Sparkles
                  size={12}
                  className="text-emerald-300"
                />

                <span className="text-[10px] font-medium tracking-[0.18em] text-slate-500">
                  START MOVING
                </span>
              </motion.div>

              <h2 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#F5F7F5] sm:text-6xl">
                Stop chasing
                <br />
                <motion.span
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={
                    isInView
                      ? {
                          opacity: 1,
                          y: 0,
                        }
                      : {
                          opacity: 0,
                          y: 18,
                        }
                  }
                  transition={{
                    duration: 0.65,
                    delay: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block text-[#536058]"
                >
                  your money.
                </motion.span>
              </h2>

              <p className="mt-7 max-w-md text-base leading-7 text-[#8A948D]">
                Build an invoice once. Let the system keep the
                payment moving.
              </p>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        y: 0,
                      }
                    : {
                        opacity: 0,
                        y: 18,
                      }
                }
                transition={{
                  duration: 0.65,
                  delay: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <button
                  onClick={() => setStarted(true)}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3.5 text-sm font-semibold text-[#050706] transition hover:bg-[#BBF7D0]"
                >
                  {started ? "Flow activated" : "Get started"}

                  <motion.span
                    animate={{
                      x: started ? 3 : 0,
                    }}
                  >
                    {started ? (
                      <Check size={15} />
                    ) : (
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </motion.span>
                </button>

                <a
                  href="#how-it-works"
                  className="flex items-center justify-center rounded-xl border border-emerald-200/[0.08] px-5 py-3.5 text-sm font-medium text-[#8A948D] transition hover:border-emerald-300/[0.18] hover:text-[#F5F7F5]"
                >
                  See how it works
                </a>
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        y: 0,
                      }
                    : {
                        opacity: 0,
                        y: 15,
                      }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[8px] uppercase tracking-[0.15em] text-[#536058]"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={10} />
                  No contracts
                </span>

                <span className="flex items-center gap-1.5">
                  <Zap size={10} />
                  Setup in minutes
                </span>

                <span className="flex items-center gap-1.5">
                  <Check size={10} />
                  Start free
                </span>
              </motion.div>
            </motion.div>

            {/* Visual system */}
            <motion.div
              variants={visualVariants}
              initial="hidden"
              animate={animationState}
              className="relative min-h-[360px] lg:min-h-full"
            >
              {/* Central orbit */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/[0.045]"
              >
                <div className="absolute -right-1 top-1/2 h-2 w-2 rounded-full bg-emerald-300/60 shadow-[0_0_15px_rgba(134,239,172,0.7)]" />
              </motion.div>

              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 22,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/[0.06]"
              >
                <div className="absolute -left-1 top-1/2 h-1.5 w-1.5 rounded-full bg-emerald-200/70 shadow-[0_0_12px_rgba(134,239,172,0.7)]" />
              </motion.div>

              {/* Flow line */}
              <motion.div
                initial={{
                  scaleX: 0,
                  opacity: 0,
                }}
                animate={
                  isInView
                    ? {
                        scaleX: 1,
                        opacity: 1,
                      }
                    : {
                        scaleX: 0,
                        opacity: 0,
                      }
                }
                transition={{
                  duration: 0.9,
                  delay: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute left-[14%] right-[14%] top-1/2 h-px origin-left bg-gradient-to-r from-transparent via-emerald-200/[0.08] to-transparent"
              />

              {/* Particles */}
              <div className="absolute left-[18%] right-[18%] top-1/2 h-px">
                <FlowParticle
                  delay={0}
                  duration={2.8}
                />

                <FlowParticle
                  delay={0.9}
                  duration={3.2}
                />

                <FlowParticle
                  delay={1.7}
                  duration={2.5}
                />
              </div>

              {/* Nodes */}
              <div className="absolute left-[10%] top-[43%]">
                <FlowNode
                  type="invoice"
                  label="Invoice"
                  delay={0}
                  active={started}
                />
              </div>

              <div className="absolute left-[31%] top-[28%]">
                <FlowNode
                  type="client"
                  label="Client"
                  delay={0.3}
                  active={started}
                />
              </div>

              <div className="absolute right-[30%] top-[57%]">
                <FlowNode
                  type="payment"
                  label="Payment"
                  delay={0.6}
                  active={started}
                />
              </div>

              <div className="absolute right-[9%] top-[39%]">
                <FlowNode
                  type="complete"
                  label="Complete"
                  delay={0.9}
                  active={started}
                />
              </div>

              {/* Central core */}
              <motion.div
                animate={
                  started
                    ? {
                        scale: [1, 1.15, 1],
                        boxShadow: [
                          "0 0 30px rgba(34,197,94,0.08)",
                          "0 0 70px rgba(34,197,94,0.2)",
                          "0 0 30px rgba(34,197,94,0.08)",
                        ],
                      }
                    : {
                        scale: [1, 1.05, 1],
                      }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.035]"
              >
                <div className="absolute h-16 w-16 rounded-full border border-emerald-200/10" />

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/[0.08] bg-[#0D1510]">
                  <Zap
                    size={18}
                    className={
                      started
                        ? "text-emerald-300"
                        : "text-emerald-400"
                    }
                  />
                </div>

                <div className="absolute top-full mt-5 whitespace-nowrap text-[7px] uppercase tracking-[0.2em] text-[#536058]">
                  {started
                    ? "FLOW ACTIVE"
                    : "MONEY IN MOTION"}
                </div>
              </motion.div>

              {/* Floating data labels */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.45, 0.8, 0.45],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-[12%] top-[19%] hidden rounded-lg border border-emerald-200/[0.06] bg-emerald-200/[0.025] px-3 py-2 sm:block"
              >
                <div className="text-[7px] uppercase tracking-[0.15em] text-[#536058]">
                  CASH FLOW
                </div>

                <div className="mt-1 text-xs font-medium text-emerald-300">
                  +18.4%
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 6, 0],
                  opacity: [0.4, 0.75, 0.4],
                }}
                transition={{
                  duration: 4,
                  delay: 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-[17%] left-[13%] hidden rounded-lg border border-emerald-200/[0.06] bg-emerald-200/[0.025] px-3 py-2 sm:block"
              >
                <div className="text-[7px] uppercase tracking-[0.15em] text-[#536058]">
                  INVOICE
                </div>

                <div className="mt-1 text-xs font-medium text-[#8A948D]">
                  #2048
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom signal */}
          <motion.div
            variants={signalVariants}
            initial="hidden"
            animate={animationState}
            className="border-t border-emerald-200/[0.06] px-6 py-5 sm:px-10"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <motion.div
                      key={item}
                      animate={{
                        height: [
                          "4px",
                          `${7 + (item % 3) * 3}px`,
                          "4px",
                        ],
                      }}
                      transition={{
                        duration: 1.3,
                        delay: item * 0.12,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-1 rounded-full bg-emerald-400/30"
                    />
                  ))}
                </div>

                <span className="text-[8px] uppercase tracking-[0.16em] text-[#536058]">
                  Your money, in motion.
                </span>
              </div>

              <span className="text-[8px] text-[#536058]">
                InvoiceAI / portfolio concept
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Final micro-copy */}
        <motion.div
          variants={signalVariants}
          initial="hidden"
          animate={animationState}
          className="mt-10 text-center"
        >
          <AnimatePresence mode="wait">
            {started ? (
              <motion.p
                key="active"
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                className="text-xs text-emerald-300/70"
              >
                The flow is ready. Now build the system behind it.
              </motion.p>
            ) : (
              <motion.p
                key="idle"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="text-xs text-[#536058]"
              >
                Built as a fictional SaaS concept to demonstrate
                interactive product design.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}