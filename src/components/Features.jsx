import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  BellRing,
  BrainCircuit,
  CircleDollarSign,
  ArrowUpRight,
  Check,
  Sparkles,
  Activity,
} from "lucide-react";

const features = [
  {
    id: "reminders",
    label: "AUTOMATIC REMINDERS",
    title: "Invoices that follow up themselves.",
    description:
      "InvoiceAI watches your outstanding invoices and keeps the payment conversation moving.",
    icon: BellRing,
    amount: "3",
    amountLabel: "FOLLOW-UPS SENT",
    signal: "FOLLOW-UP ACTIVE",
  },
  {
    id: "prediction",
    label: "PAYMENT INTELLIGENCE",
    title: "Know what is likely to get paid.",
    description:
      "Turn invoice activity into a clearer picture of when your money is likely to arrive.",
    icon: BrainCircuit,
    amount: "94%",
    amountLabel: "PAYMENT SIGNAL",
    signal: "HIGH CONFIDENCE",
  },
  {
    id: "cashflow",
    label: "CASH-FLOW VISIBILITY",
    title: "See your money before it arrives.",
    description:
      "Understand outstanding revenue, incoming payments and the shape of your cash flow in one place.",
    icon: CircleDollarSign,
    amount: "$12.4K",
    amountLabel: "EXPECTED",
    signal: "INCOMING REVENUE",
  },
];

/* -------------------------------------------------------
   Animation
------------------------------------------------------- */

const ease = [0.16, 1, 0.3, 1];

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 75,
    scale: 0.985,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease,
    },
  },

  exit: {
    opacity: 0,
    y: -70,
    scale: 0.975,
    transition: {
      duration: 0.8,
      ease,
    },
  },
};

const headingContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.12,
    },
  },
};

const headingLine = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -28,
  },

  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      delay: 0.35 + index * 0.1,
      ease,
    },
  }),

  exit: (index) => ({
    opacity: 0,
    x: -25,
    transition: {
      duration: 0.55,
      delay: index * 0.04,
      ease,
    },
  }),
};

/* -------------------------------------------------------
   Floating Particle
------------------------------------------------------- */

function FloatingParticle({
  delay,
  duration,
  x,
  y,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: [0, 0.8, 0],
        x,
        y,
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-emerald-200 shadow-[0_0_12px_rgba(134,239,172,0.9)]"
    />
  );
}

/* -------------------------------------------------------
   Invoice Visual
------------------------------------------------------- */

function InvoiceVisual({
  active,
  isInView,
}) {
  let invoiceStatus = "PAYMENT EXPECTED";
  let statusColor = "text-emerald-300";

  if (active === "reminders") {
    invoiceStatus = "FOLLOW-UP SCHEDULED";
    statusColor = "text-green-300";
  }

  if (active === "prediction") {
    invoiceStatus = "LIKELY TO PAY";
    statusColor = "text-emerald-200";
  }

  if (active === "cashflow") {
    invoiceStatus = "PAYMENT INCOMING";
    statusColor = "text-emerald-300";
  }

  const progress =
    active === "reminders"
      ? "68%"
      : active === "prediction"
      ? "82%"
      : "94%";

  return (
    <div className="relative flex h-[400px] items-center justify-center overflow-hidden">
      {/* -------------------------------------------------
          Signal atmosphere
      ------------------------------------------------- */}

      <motion.div
        animate={{
          scale: isInView
            ? active === "cashflow"
              ? 1.3
              : 1
            : 0.7,
          opacity: isInView
            ? active === "cashflow"
              ? 0.22
              : 0.11
            : 0,
        }}
        transition={{
          duration: 1,
          ease,
        }}
        className="absolute h-72 w-72 rounded-full bg-emerald-500 blur-[100px]"
      />

      <motion.div
        animate={{
          scale: isInView
            ? active === "prediction"
              ? 1.15
              : 0.9
            : 0.7,
          opacity: isInView
            ? active === "prediction"
              ? 0.1
              : 0.04
            : 0,
        }}
        transition={{
          duration: 0.9,
          ease,
        }}
        className="absolute h-48 w-48 rounded-full bg-green-300 blur-[80px]"
      />

      {/* -------------------------------------------------
          Orbital system
      ------------------------------------------------- */}

      <motion.div
        animate={{
          rotate: isInView ? 360 : 0,
          opacity: isInView ? 1 : 0,
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: isInView ? Infinity : 0,
            ease: "linear",
          },
          opacity: {
            duration: 0.8,
          },
        }}
        className="absolute h-[340px] w-[340px] rounded-full border border-emerald-300/[0.07]"
      />

      <motion.div
        animate={{
          rotate: isInView ? -360 : 0,
          opacity: isInView ? 1 : 0,
        }}
        transition={{
          rotate: {
            duration: 14,
            repeat: isInView ? Infinity : 0,
            ease: "linear",
          },
          opacity: {
            duration: 0.8,
            delay: 0.15,
          },
        }}
        className="absolute h-[250px] w-[250px] rounded-full border border-dashed border-emerald-200/[0.06]"
      />

      {/* -------------------------------------------------
          Signal particles
      ------------------------------------------------- */}

      <FloatingParticle
        delay={0}
        duration={3.5}
        x={120}
        y={-90}
      />

      <FloatingParticle
        delay={1.2}
        duration={4}
        x={-130}
        y={70}
      />

      <FloatingParticle
        delay={2}
        duration={3.2}
        x={80}
        y={130}
      />

      <FloatingParticle
        delay={0.7}
        duration={4.5}
        x={-90}
        y={-120}
      />

      {/* -------------------------------------------------
          Invoice
      ------------------------------------------------- */}

      <motion.div
        initial={{
          opacity: 0,
          y: 55,
          rotateX: 10,
          scale: 0.88,
        }}
        animate={{
          opacity: isInView ? 1 : 0,
          y: isInView ? [0, -7, 0] : 40,
          rotateX:
            active === "prediction"
              ? -3
              : 0,
          rotateY:
            active === "cashflow"
              ? 4
              : 0,
          scale: isInView ? 1 : 0.88,
        }}
        transition={{
          opacity: {
            duration: 0.8,
            delay: 0.3,
            ease,
          },
          y: {
            duration: 4,
            repeat: isInView ? Infinity : 0,
            ease: "easeInOut",
          },
          rotateX: {
            duration: 0.6,
          },
          rotateY: {
            duration: 0.6,
          },
          scale: {
            duration: 0.9,
            ease,
          },
        }}
        className="relative z-10 w-[290px] overflow-hidden rounded-2xl border border-emerald-200/[0.1] bg-[#090D0A]/95 shadow-[0_30px_100px_rgba(0,0,0,0.55),0_0_50px_rgba(34,197,94,0.05)] backdrop-blur-2xl"
      >
        {/* Invoice header */}

        <div className="flex items-center justify-between border-b border-emerald-200/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                boxShadow:
                  active === "prediction"
                    ? [
                        "0 0 0 rgba(34,197,94,0)",
                        "0 0 18px rgba(34,197,94,0.2)",
                        "0 0 0 rgba(34,197,94,0)",
                      ]
                    : "0 0 0 rgba(34,197,94,0)",
              }}
              transition={{
                duration: 2,
                repeat:
                  active === "prediction"
                    ? Infinity
                    : 0,
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <span className="text-xs font-bold text-emerald-300">
                I
              </span>
            </motion.div>

            <div>
              <div className="text-[10px] font-medium text-[#DDE5DF]">
                INVOICEAI
              </div>

              <div className="text-[8px] text-[#536058]">
                INV-2048
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.span
              key={invoiceStatus}
              initial={{
                opacity: 0,
                y: 5,
                filter: "blur(4px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
              transition={{
                duration: 0.3,
              }}
              className={
                "rounded-full border border-emerald-300/[0.1] bg-emerald-400/[0.04] px-2 py-1 text-[7px] " +
                statusColor
              }
            >
              {invoiceStatus}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Client */}

        <div className="px-5 pt-5">
          <div className="text-[8px] uppercase tracking-[0.18em] text-[#536058]">
            Billed to
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-[#DDE5DF]">
              Acme Studio
            </span>

            <span className="text-[9px] text-[#536058]">
              Due in 4 days
            </span>
          </div>
        </div>

        {/* Amount */}

        <div className="px-5 py-7">
          <div className="text-[8px] uppercase tracking-[0.18em] text-[#536058]">
            Amount due
          </div>

          <motion.div
            key={active}
            initial={{
              opacity: 0,
              y: 12,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.4,
              ease,
            }}
            className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-[#F5F7F5]"
          >
            $2,840
          </motion.div>
        </div>

        {/* AI activity */}

        <div className="border-t border-emerald-200/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
              <Check
                size={12}
                className="text-emerald-400"
              />

              <motion.div
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="absolute inset-0 rounded-full border border-emerald-400/30"
              />
            </div>

            <div>
              <div className="text-[9px] text-[#DDE5DF]">
                AI monitoring active
              </div>

              <div className="text-[8px] text-[#536058]">
                Last activity · 2 min ago
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}

        <div className="px-5 pb-5">
          <div className="mb-2 flex justify-between text-[8px] text-[#536058]">
            <span>
              Payment journey
            </span>

            <motion.span
              key={progress}
              initial={{
                opacity: 0,
                y: 3,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              {progress}
            </motion.span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-emerald-100/[0.06]">
            <motion.div
              initial={{
                width: "0%",
              }}
              animate={{
                width: progress,
              }}
              transition={{
                duration: 0.9,
                ease,
              }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-200"
            />
          </div>
        </div>
      </motion.div>

      {/* Signal node */}

      <motion.div
        animate={{
          opacity: isInView ? 1 : 0,
          scale: isInView
            ? [0.85, 1, 0.85]
            : 0.7,
        }}
        transition={{
          opacity: {
            duration: 0.6,
          },
          scale: {
            duration: 2.5,
            repeat: isInView ? Infinity : 0,
            ease: "easeInOut",
          },
        }}
        className="absolute bottom-[35px] right-[18%] h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]"
      />
    </div>
  );
}

/* -------------------------------------------------------
   Feature Selector
------------------------------------------------------- */

function FeatureSelector({
  feature,
  active,
  onClick,
  index,
  isInView,
}) {
  const Icon = feature.icon;

  return (
    <motion.button
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate={
        isInView
          ? "visible"
          : "exit"
      }
      onClick={onClick}
      whileHover={{
        x: 5,
      }}
      whileTap={{
        scale: 0.99,
      }}
      className={
        "group relative w-full border-b text-left transition-all duration-300 " +
        (active
          ? "border-emerald-300/[0.14]"
          : "border-emerald-200/[0.06]")
      }
    >
      <div className="flex items-start gap-4 py-5">
        {/* Icon */}

        <motion.div
          animate={{
            scale: active ? 1.05 : 1,
            borderColor: active
              ? "rgba(52,211,153,0.3)"
              : "rgba(167,243,208,0.07)",
          }}
          transition={{
            duration: 0.35,
          }}
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-emerald-100/[0.02]"
        >
          <Icon
            size={17}
            strokeWidth={1.5}
            className={
              active
                ? "text-emerald-300"
                : "text-[#536058] group-hover:text-[#8A948D]"
            }
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <span
              className={
                "text-[10px] font-medium tracking-[0.18em] transition-colors " +
                (active
                  ? "text-emerald-300"
                  : "text-[#536058]")
              }
            >
              {feature.label}
            </span>

            <motion.div
              animate={{
                x: active ? 0 : 4,
                opacity: active ? 1 : 0,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <ArrowUpRight
                size={15}
                className="text-emerald-200"
              />
            </motion.div>
          </div>

          <h3
            className={
              "mt-2 text-lg font-medium tracking-[-0.02em] transition-colors " +
              (active
                ? "text-[#F5F7F5]"
                : "text-[#8A948D] group-hover:text-[#DDE5DF]")
            }
          >
            {feature.title}
          </h3>

          <AnimatePresence initial={false}>
            {active && (
              <motion.p
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -5,
                }}
                transition={{
                  duration: 0.35,
                  ease,
                }}
                className="overflow-hidden"
              >
                <span className="mt-2 block max-w-md text-sm leading-6 text-[#536058]">
                  {feature.description}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active line */}

      <motion.div
        initial={false}
        animate={{
          scaleX: active ? 1 : 0,
          opacity: active ? 1 : 0,
        }}
        transition={{
          duration: 0.5,
          ease,
        }}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-emerald-400 via-green-300 to-transparent"
      />
    </motion.button>
  );
}

/* -------------------------------------------------------
   Features
------------------------------------------------------- */

export default function Features() {
  const [active, setActive] =
    useState("reminders");

  const containerRef =
    useRef(null);

  const mouseX =
    useMotionValue(0);

  const mouseY =
    useMotionValue(0);

  const springX = useSpring(
    mouseX,
    {
      stiffness: 80,
      damping: 20,
    }
  );

  const springY = useSpring(
    mouseY,
    {
      stiffness: 80,
      damping: 20,
    }
  );

  const isInView = useInView(
    containerRef,
    {
      amount: 0.2,
    }
  );

  useEffect(() => {
    const element =
      containerRef.current;

    if (!element) {
      return;
    }

    const handleMouseMove = (
      event
    ) => {
      const rect =
        element.getBoundingClientRect();

      const x =
        (event.clientX -
          rect.left) /
          rect.width -
        0.5;

      const y =
        (event.clientY -
          rect.top) /
          rect.height -
        0.5;

      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave =
      () => {
        mouseX.set(0);
        mouseY.set(0);
      };

    element.addEventListener(
      "mousemove",
      handleMouseMove
    );

    element.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    return () => {
      element.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      element.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, [mouseX, mouseY]);

  const currentFeature =
    features.find(
      (feature) =>
        feature.id === active
    ) || features[0];

  return (
    <section
      id="features"
      ref={containerRef}
      className="relative overflow-hidden bg-[#050706] py-28"
    >
      {/* -------------------------------------------------
          Intro / outro atmosphere
      ------------------------------------------------- */}

      <motion.div
        animate={{
          opacity: isInView ? 1 : 0,
          scale: isInView ? 1 : 0.75,
          x: springX,
          y: springY,
        }}
        transition={{
          opacity: {
            duration: 0.9,
          },
          scale: {
            duration: 1.2,
            ease,
          },
        }}
        className="pointer-events-none absolute left-1/2 top-[48%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/[0.035] blur-[150px]"
      />

      <motion.div
        initial={{
          scaleX: 0,
          opacity: 0,
        }}
        animate={{
          scaleX: isInView ? 1 : 0,
          opacity: isInView ? 1 : 0,
        }}
        transition={{
          duration: 1.1,
          ease,
        }}
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[55%] -translate-x-1/2 origin-center bg-gradient-to-r from-transparent via-emerald-300/[0.08] to-transparent"
      />

      {/* -------------------------------------------------
          Main section
      ------------------------------------------------- */}

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate={
          isInView
            ? "visible"
            : "exit"
        }
        className="relative mx-auto max-w-7xl px-5 lg:px-8"
      >
        {/* -------------------------------------------------
            Heading
        ------------------------------------------------- */}

        <div className="max-w-3xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: isInView ? 1 : 0,
              y: isInView ? 0 : -15,
            }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease,
            }}
            className="mb-5 flex items-center gap-3"
          >
            <div className="flex items-center gap-2 rounded-full border border-emerald-200/[0.08] bg-emerald-100/[0.025] px-3 py-1.5">
              <motion.div
                animate={{
                  rotate: isInView
                    ? [0, 20, -10, 0]
                    : 0,
                }}
                transition={{
                  duration: 1.2,
                  delay: 0.5,
                }}
              >
                <Sparkles
                  size={12}
                  className="text-emerald-300"
                />
              </motion.div>

              <span className="text-[10px] font-medium tracking-[0.18em] text-[#8A948D]">
                INTELLIGENCE LAYER
              </span>
            </div>
          </motion.div>

          <motion.h2
            variants={headingContainer}
            initial="hidden"
            animate={
              isInView
                ? "visible"
                : "hidden"
            }
            className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-[#F5F7F5] sm:text-6xl"
          >
            <motion.span
              variants={headingLine}
              className="block"
            >
              Your invoices are not
              <span className="text-[#536058]">
                {" "}
                paperwork.
              </span>
            </motion.span>

            <motion.span
              variants={headingLine}
              className="block"
            >
              They're{" "}
              <span className="relative text-emerald-300">
                signals.
                <motion.span
                  initial={{
                    scaleX: 0,
                  }}
                  animate={{
                    scaleX: isInView
                      ? 1
                      : 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.65,
                    ease,
                  }}
                  className="absolute -bottom-1 left-0 h-px w-full origin-left bg-gradient-to-r from-emerald-400/50 to-transparent"
                />
              </span>
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: isInView ? 1 : 0,
              y: isInView ? 0 : -15,
            }}
            transition={{
              duration: 0.7,
              delay: 0.55,
              ease,
            }}
            className="mt-5 max-w-xl text-base leading-7 text-[#8A948D] sm:text-lg"
          >
            InvoiceAI turns every invoice
            interaction into useful information
            about your money.
          </motion.p>
        </div>

        {/* -------------------------------------------------
            Interactive area
        ------------------------------------------------- */}

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          {/* Controls */}

          <div>
            <div className="border-t border-emerald-200/[0.06]">
              {features.map(
                (feature, index) => (
                  <FeatureSelector
                    key={feature.id}
                    feature={feature}
                    active={
                      active ===
                      feature.id
                    }
                    onClick={() =>
                      setActive(
                        feature.id
                      )
                    }
                    index={index}
                    isInView={
                      isInView
                    }
                  />
                )
              )}
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: isInView
                  ? 1
                  : 0,
                y: isInView
                  ? 0
                  : 15,
              }}
              transition={{
                duration: 0.7,
                delay: 0.75,
                ease,
              }}
              className="mt-7 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                <motion.div
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-7 w-7 rounded-full border border-[#050706] bg-emerald-400/20"
                />

                <motion.div
                  animate={{
                    y: [0, 2, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                  className="h-7 w-7 rounded-full border border-[#050706] bg-green-300/20"
                />

                <motion.div
                  animate={{
                    y: [0, -1, 0],
                  }}
                  transition={{
                    duration: 2.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                  className="h-7 w-7 rounded-full border border-[#050706] bg-emerald-200/20"
                />
              </div>

              <p className="text-xs leading-5 text-[#536058]">
                One flow.
                <br />
                Every payment signal connected.
              </p>
            </motion.div>
          </div>

          {/* -------------------------------------------------
              Visual
          ------------------------------------------------- */}

          <motion.div
            initial={{
              opacity: 0,
              x: 55,
              scale: 0.9,
              rotateY: 8,
            }}
            animate={{
              opacity: isInView ? 1 : 0,
              x: isInView ? 0 : -40,
              scale: isInView ? 1 : 0.9,
              rotateY: isInView ? 0 : -5,
            }}
            transition={{
              duration: 1.1,
              delay: 0.25,
              ease,
            }}
            style={{
              rotateX: springY,
              rotateY: springX,
            }}
            className="relative rounded-[32px] border border-emerald-200/[0.07] bg-[#090D0A]/60 shadow-[0_30px_100px_rgba(0,0,0,0.18)] [transform-style:preserve-3d]"
          >
            {/* Top labels */}

            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: isInView
                  ? 1
                  : 0,
                y: isInView ? 0 : -10,
              }}
              transition={{
                duration: 0.6,
                delay: 0.8,
                ease,
              }}
              className="absolute left-6 right-6 top-5 z-20 flex items-center justify-between"
            >
              <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#536058]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>

                LIVE PAYMENT SIGNAL
              </span>

              <AnimatePresence mode="wait">
                <motion.span
                  key={
                    currentFeature.amountLabel
                  }
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
                  transition={{
                    duration: 0.25,
                  }}
                  className="text-[9px] uppercase tracking-[0.15em] text-[#536058]"
                >
                  {
                    currentFeature.amountLabel
                  }
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <InvoiceVisual
              active={active}
              isInView={isInView}
            />

            {/* Bottom metric */}

            <div className="border-t border-emerald-200/[0.06] px-6 py-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#536058]">
                    Current signal
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={
                        currentFeature.amount
                      }
                      initial={{
                        opacity: 0,
                        y: 8,
                        filter: "blur(4px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        filter: "blur(4px)",
                      }}
                      transition={{
                        duration: 0.35,
                        ease,
                      }}
                      className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#F5F7F5]"
                    >
                      {
                        currentFeature.amount
                      }
                    </motion.div>
                  </AnimatePresence>
                </div>

                <motion.div
                  key={currentFeature.signal}
                  initial={{
                    opacity: 0,
                    x: 8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="flex items-center gap-1.5 text-xs text-emerald-400"
                >
                  <Activity size={13} />

                  {currentFeature.signal}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* -------------------------------------------------
            Bottom statement
        ------------------------------------------------- */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: isInView ? 1 : 0,
            y: isInView ? 0 : -20,
          }}
          transition={{
            duration: 0.75,
            delay: 0.95,
            ease,
          }}
          className="mt-16 border-t border-emerald-200/[0.06] pt-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm leading-6 text-[#536058]">
              Stop treating every invoice
              like an isolated document.
              See the system behind your money.
            </p>

            <motion.div
              animate={{
                opacity: isInView
                  ? [0.45, 0.8, 0.45]
                  : 0,
              }}
              transition={{
                duration: 3,
                repeat: isInView
                  ? Infinity
                  : 0,
                ease: "easeInOut",
              }}
              className="flex items-center gap-2 text-xs text-[#536058]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />

              Intelligence running continuously
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* -------------------------------------------------
          Outro edge
      ------------------------------------------------- */}

      <motion.div
        animate={{
          opacity: isInView ? 1 : 0.35,
        }}
        transition={{
          duration: 0.8,
        }}
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050706] to-transparent"
      />
    </section>
  );
}
