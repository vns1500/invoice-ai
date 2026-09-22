import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Check,
  Clock3,
  ShieldCheck,
  Zap,
} from "lucide-react";

const questions = [
  {
    id: "setup",
    question: "How quickly can I get started?",
    answer:
      "You can create your workspace, connect your clients, and send your first invoice in minutes. The setup is designed to stay out of your way.",
    category: "GETTING STARTED",
    time: "< 5 MIN",
  },
  {
    id: "ai",
    question: "What does the AI actually do?",
    answer:
      "InvoiceAI watches your payment flow for patterns. It can surface overdue invoices, identify unusual payment behavior, and suggest when a reminder may be useful.",
    category: "INTELLIGENCE",
    time: "REAL-TIME",
  },
  {
    id: "payments",
    question: "Can my clients pay directly?",
    answer:
      "Yes. In a real deployment, InvoiceAI can connect invoices to your supported payment provider so clients can move from invoice to payment without unnecessary steps.",
    category: "PAYMENTS",
    time: "CONNECTED",
  },
  {
    id: "reminders",
    question: "Will it send payment reminders automatically?",
    answer:
      "You can configure reminder rules based on invoice status and timing. The goal is to keep follow-ups consistent without making every reminder a manual task.",
    category: "AUTOMATION",
    time: "AUTOMATED",
  },
  {
    id: "security",
    question: "How is my financial data handled?",
    answer:
      "A production version would use encrypted connections, controlled access, secure authentication, and appropriate data-retention policies. This portfolio demo does not process real financial data.",
    category: "SECURITY",
    time: "PROTECTED",
  },
  {
    id: "cancel",
    question: "Can I change or cancel my plan?",
    answer:
      "Yes. Plans are designed to scale with your invoice volume, so you can move between them as your business changes without rebuilding your workflow.",
    category: "BILLING",
    time: "FLEXIBLE",
  },
];

function SignalDot({ active = false }) {
  return (
    <motion.span
      animate={
        active
          ? {
              opacity: [0.35, 1, 0.35],
              scale: [0.9, 1.15, 0.9],
            }
          : {
              opacity: 0.4,
              scale: 1,
            }
      }
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-emerald-300" : "bg-slate-700"
      }`}
    />
  );
}

function QuestionRow({
  item,
  index,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full border-b border-emerald-100/[0.06] py-6 text-left transition ${
        active
          ? "bg-emerald-400/[0.018]"
          : "hover:bg-emerald-400/[0.012]"
      }`}
    >
      <div className="flex items-start gap-4 px-1 sm:px-5">
        <div
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[9px] transition ${
            active
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-emerald-100/[0.06] bg-emerald-50/[0.02] text-slate-700 group-hover:text-slate-400"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span
              className={`text-sm font-medium transition sm:text-base ${
                active
                  ? "text-white"
                  : "text-slate-400 group-hover:text-white"
              }`}
            >
              {item.question}
            </span>

            <span className="flex shrink-0 items-center gap-2 text-[7px] uppercase tracking-[0.16em] text-slate-700">
              <SignalDot active={active} />
              {item.category}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {active && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="overflow-hidden"
              >
                <motion.p
                  initial={{
                    y: -6,
                  }}
                  animate={{
                    y: 0,
                  }}
                  exit={{
                    y: -6,
                  }}
                  className="mt-4 max-w-2xl text-sm leading-6 text-slate-500"
                >
                  {item.answer}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          animate={{
            rotate: active ? 45 : 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
            active
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-emerald-100/[0.07] text-slate-700 group-hover:text-slate-400"
          }`}
        >
          <ArrowRight size={10} />
        </motion.div>
      </div>
    </button>
  );
}

const headingVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -25,
    transition: {
      duration: 0.45,
      ease: "easeIn",
    },
  },
};

const terminalVariants = {
  hidden: {
    opacity: 0,
    x: -45,
    y: 30,
    scale: 0.975,
  },

  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      delay: 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    x: -30,
    y: -25,
    scale: 0.985,
    transition: {
      duration: 0.55,
      ease: "easeIn",
    },
  },
};

const visualizationVariants = {
  hidden: {
    opacity: 0,
    x: 45,
    y: 30,
    scale: 0.96,
  },

  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      delay: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    x: 30,
    y: -25,
    scale: 0.975,
    transition: {
      duration: 0.55,
      ease: "easeIn",
    },
  },
};

const footerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.4,
    },
  },
};

export default function FAQ() {
  const [activeId, setActiveId] = useState("ai");

  const activeQuestion =
    questions.find((item) => item.id === activeId) ||
    questions[1];

  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, {
    amount: 0.12,
    margin: "-5% 0px -5% 0px",
  });

  const animationState = isInView ? "visible" : "hidden";

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative overflow-hidden bg-[#050706] py-32"
    >
      {/* Background atmosphere */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.75,
        }}
        animate={{
          opacity: isInView ? 1 : 0.35,
          scale: isInView ? 1 : 0.82,
        }}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/[0.025] blur-[140px]"
      />

      {/* Ambient scan line */}
      <motion.div
        initial={{
          x: "-100%",
          opacity: 0,
        }}
        animate={
          isInView
            ? {
                x: "100%",
                opacity: [0, 0.35, 0],
              }
            : {
                x: "-100%",
                opacity: 0,
              }
        }
        transition={{
          duration: 2.2,
          delay: 0.35,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-0 top-[28%] h-px w-full bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          animate={animationState}
          className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"
        >
          <div>
            <motion.div
              variants={headingVariants}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/[0.08] bg-emerald-50/[0.025] px-3 py-1.5"
            >
              <Sparkles
                size={12}
                className="text-emerald-300"
              />

              <span className="text-[10px] font-medium tracking-[0.18em] text-slate-500">
                SYSTEM KNOWLEDGE
              </span>
            </motion.div>

            <motion.h2
              variants={headingVariants}
              className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#F5F7F5] sm:text-6xl"
            >
              Questions,
              <br />
              <span className="text-slate-600">
                answered in motion.
              </span>
            </motion.h2>
          </div>

          <motion.div
            variants={headingVariants}
            className="max-w-xl lg:ml-auto"
          >
            <p className="text-base leading-7 text-slate-500 sm:text-lg">
              No walls of documentation. Ask the system what
              you need to know and follow the signal.
            </p>
          </motion.div>
        </motion.div>

        {/* Main interface */}
        <div className="mt-16 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Question terminal */}
          <motion.div
            variants={terminalVariants}
            initial="hidden"
            animate={animationState}
            className="overflow-hidden rounded-3xl border border-emerald-100/[0.07] bg-emerald-50/[0.018]"
          >
            {/* Terminal header */}
            <div className="flex items-center justify-between border-b border-emerald-100/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                </div>

                <span className="ml-2 text-[8px] uppercase tracking-[0.18em] text-slate-700">
                  invoiceai / knowledge
                </span>
              </div>

              <div className="flex items-center gap-2">
                <SignalDot active />

                <span className="text-[8px] uppercase tracking-[0.15em] text-emerald-400/60">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Questions */}
            <div>
              {questions.map((item, index) => (
                <QuestionRow
                  key={item.id}
                  item={item}
                  index={index}
                  active={activeId === item.id}
                  onClick={() =>
                    setActiveId(
                      activeId === item.id ? null : item.id
                    )
                  }
                />
              ))}
            </div>
          </motion.div>

          {/* Answer visualization */}
          <motion.div
            variants={visualizationVariants}
            initial="hidden"
            animate={animationState}
            className="relative overflow-hidden rounded-3xl border border-emerald-100/[0.07] bg-[#090D0A]"
          >
            {/* Grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(134,239,172,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,.35) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
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
                delay: 0.5,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-emerald-300/[0.04] to-transparent"
            />

            {/* Glow */}
            <motion.div
              key={activeQuestion.id}
              initial={{
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                opacity: 0.08,
                scale: 1,
              }}
              transition={{
                duration: 0.7,
              }}
              className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-emerald-400 blur-[90px]"
            />

            <div className="relative flex h-full min-h-[560px] flex-col p-7 sm:p-9">
              {/* Top status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10">
                    <Sparkles
                      size={12}
                      className="text-emerald-300"
                    />
                  </div>

                  <span className="text-[8px] uppercase tracking-[0.18em] text-slate-600">
                    INVOICEAI RESPONSE
                  </span>
                </div>

                <span className="text-[8px] text-slate-700">
                  {activeQuestion.time}
                </span>
              </div>

              {/* Central signal */}
              <div className="relative flex flex-1 flex-col items-center justify-center text-center">
                {/* Orbital rings */}
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-48 w-48 rounded-full border border-emerald-400/[0.07]"
                />

                <motion.div
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute h-32 w-32 rounded-full border border-green-200/[0.07]"
                />

                {/* Core */}
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] shadow-[0_0_40px_rgba(34,197,94,0.08)]"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_15px_rgba(134,239,172,0.9)]" />
                </motion.div>

                {/* Answer */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeQuestion.id}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -12,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="relative mt-12 max-w-md"
                  >
                    <div className="text-[8px] uppercase tracking-[0.2em] text-emerald-400/60">
                      {activeQuestion.category}
                    </div>

                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#F5F7F5]">
                      {activeQuestion.question}
                    </h3>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      {activeQuestion.answer}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Processing line */}
              <div className="border-t border-emerald-100/[0.06] pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check
                      size={11}
                      className="text-emerald-400"
                    />

                    <span className="text-[8px] uppercase tracking-[0.15em] text-slate-600">
                      Answer verified
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 text-[8px] text-slate-700">
                    <Clock3 size={10} />
                    0.04s
                  </span>
                </div>

                {/* Signal bars */}
                <div className="mt-4 flex h-5 items-end gap-1">
                  {[
                    3, 7, 11, 6, 14, 9, 17, 8, 13, 5, 16, 10,
                    18, 7,
                  ].map((height, index) => (
                    <motion.div
                      key={index}
                      animate={{
                        height: [
                          `${height * 0.55}px`,
                          `${height}px`,
                          `${height * 0.65}px`,
                        ],
                      }}
                      transition={{
                        duration: 1.2,
                        delay: index * 0.04,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="w-1 rounded-full bg-emerald-400/20"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom trust strip */}
        <motion.div
          variants={footerVariants}
          initial="hidden"
          animate={animationState}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[8px] uppercase tracking-[0.16em] text-slate-700"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={11} />
            Secure by design
          </span>

          <span className="flex items-center gap-2">
            <Zap size={11} />
            Fast answers
          </span>

          <span className="flex items-center gap-2">
            <Check size={11} />
            Human-readable
          </span>
        </motion.div>

        {/* Portfolio/demo note */}
        <motion.div
          variants={footerVariants}
          initial="hidden"
          animate={animationState}
          className="mt-10 text-center"
        >
          <p className="text-[9px] leading-5 text-slate-800">
            InvoiceAI is a fictional SaaS concept created as a
            portfolio demonstration. No real financial data is
            processed.
          </p>
        </motion.div>
      </div>
    </section>
  );
}