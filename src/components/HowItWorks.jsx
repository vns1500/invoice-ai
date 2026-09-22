import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  FileText,
  Send,
  Eye,
  BellRing,
  CircleCheck,
  ArrowDown,
  Clock3,
  Sparkles,
} from "lucide-react";

const journey = [
  {
    id: "created",
    number: "01",
    label: "CREATED",
    title: "Start with the work.",
    description:
      "Create a polished invoice from the work you've already done.",
    icon: FileText,
    status: "DRAFT",
    time: "09:41 AM",
    signal: "Invoice created",
    progress: 18,
  },
  {
    id: "sent",
    number: "02",
    label: "SENT",
    title: "Put it in motion.",
    description:
      "Send it to your client and let InvoiceAI keep the payment journey moving.",
    icon: Send,
    status: "SENT",
    time: "09:43 AM",
    signal: "Delivered successfully",
    progress: 38,
  },
  {
    id: "opened",
    number: "03",
    label: "OPENED",
    title: "Know when they see it.",
    description:
      "See when your client opens the invoice instead of wondering what happened.",
    icon: Eye,
    status: "VIEWED",
    time: "11:18 AM",
    signal: "Client viewed invoice",
    progress: 58,
  },
  {
    id: "reminder",
    number: "04",
    label: "REMINDER",
    title: "Let the system follow up.",
    description:
      "When an invoice needs attention, InvoiceAI keeps the conversation moving.",
    icon: BellRing,
    status: "FOLLOW-UP",
    time: "Tomorrow",
    signal: "Reminder scheduled",
    progress: 76,
  },
  {
    id: "paid",
    number: "05",
    label: "PAID",
    title: "Close the loop.",
    description:
      "The journey ends where your business needs it to: money received.",
    icon: CircleCheck,
    status: "PAID",
    time: "02:36 PM",
    signal: "Payment received",
    progress: 100,
  },
];

const sectionVariants = {
  initial: {
    opacity: 0,
    y: 70,
    scale: 0.985,
    filter: "blur(10px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -60,
    scale: 0.985,
    filter: "blur(8px)",
    transition: {
      duration: 0.65,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const headerVariants = {
  initial: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.05,
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

const journeyVariants = {
  initial: {
    opacity: 0,
    y: 45,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      delay: 0.15,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -35,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
};

const visualVariants = {
  initial: {
    opacity: 0,
    y: 55,
    scale: 0.97,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      delay: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -45,
    scale: 0.98,
    transition: {
      duration: 0.55,
      ease: "easeIn",
    },
  },
};

const closingVariants = {
  initial: {
    opacity: 0,
    y: 25,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
    },
  },
};

function FlowParticle({ index }) {
  return (
    <motion.div
      initial={{
        left: `${index * 8}%`,
        opacity: 0,
      }}
      animate={{
        left: ["0%", "100%"],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 3 + index * 0.4,
        delay: index * 0.7,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-200 shadow-[0_0_14px_rgba(134,239,172,0.9)]"
    />
  );
}

function PaymentOrb({ active }) {
  const stage = journey[active];

  return (
    <div className="relative flex h-[420px] items-center justify-center">
      {/* Large glow */}
      <motion.div
        animate={{
          scale: active === 4 ? 1.35 : 1,
          opacity: active === 4 ? 0.25 : 0.1,
        }}
        transition={{ duration: 0.8 }}
        className="absolute h-64 w-64 rounded-full bg-emerald-500 blur-[100px]"
      />

      {/* Outer orbital circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[340px] w-[340px] rounded-full border border-emerald-200/[0.07]"
      >
        <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(134,239,172,0.9)]" />
      </motion.div>

      {/* Inner orbit */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[250px] w-[250px] rounded-full border border-dashed border-emerald-200/[0.07]"
      >
        <div className="absolute bottom-3 right-5 h-1.5 w-1.5 rounded-full bg-emerald-200 shadow-[0_0_10px_rgba(134,239,172,0.8)]" />
      </motion.div>

      {/* Invoice object */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{
            opacity: 0,
            scale: 0.65,
            rotateY: -25,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateY: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.65,
            rotateY: 25,
            y: -20,
          }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 w-[270px] overflow-hidden rounded-2xl border border-emerald-100/[0.1] bg-[#090D0A]/95 shadow-[0_35px_100px_rgba(0,0,0,0.55)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-100/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10">
                <span className="text-[10px] font-bold text-emerald-300">
                  I
                </span>
              </div>

              <div>
                <div className="text-[9px] font-medium text-slate-300">
                  INVOICEAI
                </div>

                <div className="text-[7px] text-[#536058]">
                  INV-2048
                </div>
              </div>
            </div>

            <motion.div
              key={stage.status}
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="rounded-full bg-emerald-400/10 px-2 py-1 text-[7px] text-emerald-300"
            >
              {stage.status}
            </motion.div>
          </div>

          {/* Amount */}
          <div className="px-5 py-7">
            <div className="text-[8px] uppercase tracking-[0.18em] text-[#536058]">
              Amount
            </div>

            <div className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-[#F5F7F5]">
              $2,840
            </div>

            <div className="mt-2 text-[8px] text-[#536058]">
              Acme Studio · Product Design
            </div>
          </div>

          {/* Activity */}
          <div className="border-t border-emerald-100/[0.06] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/10">
                <stage.icon
                  size={14}
                  className="text-emerald-300"
                />
              </div>

              <div>
                <div className="text-[9px] text-slate-300">
                  {stage.signal}
                </div>

                <div className="mt-0.5 flex items-center gap-1 text-[7px] text-[#536058]">
                  <Clock3 size={8} />
                  {stage.time}
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="px-5 pb-5">
            <div className="h-1 overflow-hidden rounded-full bg-emerald-100/[0.05]">
              <motion.div
                animate={{
                  width: `${stage.progress}%`,
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function JourneyStep({
  item,
  index,
  active,
  onClick,
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className="group relative flex min-w-[145px] flex-1 flex-col items-center"
    >
      {/* Connector */}
      {index !== 0 && (
        <div className="absolute right-1/2 top-5 hidden h-px w-full bg-emerald-100/[0.06] md:block">
          <motion.div
            animate={{
              scaleX: active ? 1 : 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full origin-left bg-gradient-to-r from-emerald-400 to-emerald-200"
          />
        </div>
      )}

      {/* Number */}
      <motion.div
        animate={{
          scale: active ? 1.08 : 1,
          y: active ? -4 : 0,
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
          active
            ? "border-emerald-400/40 bg-emerald-400/10"
            : "border-emerald-100/[0.08] bg-[#090D0A]"
        }`}
      >
        <Icon
          size={15}
          className={
            active
              ? "text-emerald-300"
              : "text-[#536058] group-hover:text-[#8A948D]"
          }
        />
      </motion.div>

      <span
        className={`mt-3 text-[9px] font-medium tracking-[0.15em] ${
          active
            ? "text-[#F5F7F5]"
            : "text-[#536058] group-hover:text-[#8A948D]"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, {
    amount: 0.2,
    margin: "-8% 0px -8% 0px",
  });

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;

      const distance = Math.abs(
        rect.top +
          rect.height / 2 -
          viewportCenter
      );

      if (distance < 260) {
        const scrollProgress =
          (viewportCenter - rect.top) /
          rect.height;

        const nextStage = Math.min(
          journey.length - 1,
          Math.max(
            0,
            Math.floor(
              scrollProgress * journey.length
            )
          )
        );

        setActive(nextStage);
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const current = journey[active];

  const sectionPhase = !hasEntered
    ? "initial"
    : isInView
    ? "visible"
    : "exit";

  return (
    <motion.section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050706] py-32"
      onViewportEnter={() => setHasEntered(true)}
    >
      {/* Ambient background */}
      <motion.div
        animate={{
          opacity: isInView ? 1 : 0.35,
          scale: isInView ? 1 : 0.92,
        }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.025] blur-[160px]"
      />

      {/* Top signal */}
      <motion.div
        animate={{
          scaleX: isInView ? 1 : 0,
          opacity: isInView ? 1 : 0,
        }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[55%] -translate-x-1/2 origin-center bg-gradient-to-r from-transparent via-emerald-300/[0.12] to-transparent"
      />

      {/* Section content */}
      <motion.div
        variants={sectionVariants}
        initial="initial"
        animate={sectionPhase}
        className="relative mx-auto max-w-7xl px-5 lg:px-8"
      >
        {/* Header */}
        <motion.div
          variants={headerVariants}
          className="text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/[0.08] bg-emerald-100/[0.025] px-3 py-1.5">
            <Sparkles
              size={12}
              className="text-emerald-300"
            />

            <span className="text-[10px] font-medium tracking-[0.18em] text-[#8A948D]">
              THE PAYMENT JOURNEY
            </span>
          </div>

          <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#F5F7F5] sm:text-6xl">
            Watch an invoice
            <span className="text-[#536058]">
              {" "}
              move.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#8A948D] sm:text-lg">
            From the moment you create it to the moment
            the money lands, every step stays connected.
          </p>
        </motion.div>

        {/* Journey */}
        <motion.div
          variants={journeyVariants}
          className="mt-20"
        >
          {/* Desktop journey controls */}
          <div className="hidden items-start md:flex">
            {journey.map((item, index) => (
              <JourneyStep
                key={item.id}
                item={item}
                index={index}
                active={active === index}
                onClick={() => setActive(index)}
              />
            ))}
          </div>

          {/* Mobile journey */}
          <div className="flex gap-2 overflow-x-auto pb-3 md:hidden">
            {journey.map((item, index) => (
              <JourneyStep
                key={item.id}
                item={item}
                index={index}
                active={active === index}
                onClick={() => setActive(index)}
              />
            ))}
          </div>

          {/* Main visual */}
          <motion.div
            variants={visualVariants}
            className="relative mt-10 overflow-hidden rounded-[32px] border border-emerald-100/[0.07] bg-emerald-100/[0.018]"
          >
            {/* Grid */}
            <motion.div
              animate={{
                opacity: isInView ? 0.025 : 0,
              }}
              transition={{ duration: 0.7 }}
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(134,239,172,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,.5) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />

            {/* Flow line */}
            <div className="absolute left-[10%] right-[10%] top-1/2 hidden h-px bg-emerald-100/[0.04] md:block">
              <FlowParticle index={0} />
              <FlowParticle index={1} />
              <FlowParticle index={2} />
            </div>

            <div className="relative grid min-h-[500px] items-center lg:grid-cols-[0.75fr_1.25fr]">
              {/* Left information */}
              <div className="relative z-20 px-7 pb-0 pt-10 sm:px-12 lg:px-16">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 20,
                    }}
                    transition={{
                      duration: 0.35,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium tracking-[0.2em] text-[#536058]">
                        STEP {current.number}
                      </span>

                      <div className="h-px w-8 bg-emerald-100/[0.08]" />
                    </div>

                    <h3 className="mt-5 max-w-md text-3xl font-semibold tracking-[-0.035em] text-[#F5F7F5] sm:text-4xl">
                      {current.title}
                    </h3>

                    <p className="mt-4 max-w-md text-sm leading-7 text-[#8A948D] sm:text-base">
                      {current.description}
                    </p>

                    {/* Signal */}
                    <div className="mt-8 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                      </div>

                      <div>
                        <div className="text-[9px] uppercase tracking-[0.15em] text-[#536058]">
                          LIVE SIGNAL
                        </div>

                        <div className="mt-1 text-xs text-[#8A948D]">
                          {current.signal}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Center visual */}
              <PaymentOrb active={active} />
            </div>

            {/* Bottom bar */}
            <div className="relative flex flex-col gap-4 border-t border-emerald-100/[0.06] px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-12 lg:px-16">
              <div className="flex items-center gap-3">
                <ArrowDown
                  size={13}
                  className="text-[#536058]"
                />

                <span className="text-[9px] uppercase tracking-[0.18em] text-[#536058]">
                  Scroll to move through the journey
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-[#536058]">
                  {String(active + 1).padStart(2, "0")} / 05
                </span>

                <div className="h-px w-20 bg-emerald-100/[0.08]">
                  <motion.div
                    animate={{
                      width: `${current.progress}%`,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full bg-emerald-400"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Closing line */}
        <motion.div
          variants={closingVariants}
          className="mx-auto mt-20 max-w-2xl text-center"
        >
          <p className="text-sm leading-7 text-[#536058]">
            The goal isn't more invoices.
            <span className="text-[#8A948D]">
              {" "}
              It's fewer things for you to think about.
            </span>
          </p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}