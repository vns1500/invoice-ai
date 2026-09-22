import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Bot,
} from "lucide-react";

const invoiceSteps = [1, 25, 50, 100, 150, 250];

const plans = [
  {
    id: "starter",
    name: "STARTER",
    range: "1–25 invoices",
    price: "$0",
    description:
      "Everything you need to get your first payment flow moving.",
    features: [
      "Unlimited clients",
      "Professional invoices",
      "Payment tracking",
      "Basic reminders",
    ],
  },
  {
    id: "growth",
    name: "GROWTH",
    range: "26–150 invoices",
    price: "$19",
    description:
      "Automation for businesses that are moving faster.",
    features: [
      "Everything in Starter",
      "Smart payment reminders",
      "Cash-flow insights",
      "Payment predictions",
    ],
  },
  {
    id: "scale",
    name: "SCALE",
    range: "151+ invoices",
    price: "$49",
    description:
      "The complete intelligence layer for growing operations.",
    features: [
      "Everything in Growth",
      "Advanced AI insights",
      "Priority automation",
      "Advanced analytics",
    ],
  },
];

function getPlan(invoiceCount) {
  if (invoiceCount <= 25) {
    return plans[0];
  }

  if (invoiceCount <= 150) {
    return plans[1];
  }

  return plans[2];
}

function getStepIndex(invoiceCount) {
  let closestIndex = 0;
  let smallestDifference = Infinity;

  invoiceSteps.forEach((value, index) => {
    const difference = Math.abs(invoiceCount - value);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  });

  return closestIndex;
}

const ease = [0.22, 1, 0.36, 1];

function FlowVisualization({
  invoiceCount,
  plan,
  active,
}) {
  const stepIndex = getStepIndex(invoiceCount);
  const percentage =
    (stepIndex / (invoiceSteps.length - 1)) * 100;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -70,
        y: 35,
        scale: 0.94,
      }}
      animate={
        active
          ? {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            }
          : {
              opacity: 0.55,
              x: -25,
              y: -15,
              scale: 0.975,
            }
      }
      transition={{
        duration: 0.9,
        delay: 0.38,
        ease,
      }}
      className="relative h-[300px] overflow-hidden rounded-3xl border border-emerald-300/[0.09] bg-[#090D0A]"
    >
      {/* Grid */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 1.08,
        }}
        animate={{
          opacity: active ? 0.025 : 0.015,
          scale: active ? 1 : 1.04,
        }}
        transition={{
          duration: 1.2,
          delay: 0.5,
          ease,
        }}
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(134,239,172,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(134,239,172,.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow */}
      <motion.div
        animate={{
          scale: active
            ? 0.85 + percentage / 130
            : 0.8,
          opacity: active
            ? 0.055 + percentage / 550
            : 0.025,
        }}
        transition={{
          duration: 0.9,
          ease: "easeOut",
        }}
        className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 blur-[90px]"
      />

      {/* Secondary pulse */}
      <motion.div
        animate={
          active
            ? {
                scale: [0.8, 1.25, 0.8],
                opacity: [0, 0.12, 0],
              }
            : {
                scale: 0.8,
                opacity: 0,
              }
        }
        transition={{
          duration: 3.2,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/20"
      />

      {/* Base line */}
      <div className="absolute left-10 right-10 top-1/2 h-px bg-emerald-100/[0.07]" />

      {/* Active line */}
      <motion.div
        initial={{
          width: "0%",
        }}
        animate={{
          width: active ? `${percentage}%` : "4%",
        }}
        transition={{
          duration: 1,
          delay: 0.65,
          ease,
        }}
        className="absolute left-10 top-1/2 h-px bg-gradient-to-r from-emerald-400 via-green-300 to-lime-300"
      />

      {/* Moving particles */}
      {[0, 1, 2, 3].map((item) => (
        <motion.div
          key={item}
          animate={
            active
              ? {
                  x: ["0%", "100%"],
                  opacity: [0, 1, 0],
                }
              : {
                  x: "0%",
                  opacity: 0,
                }
          }
          transition={{
            duration: 2.2 + item * 0.5,
            delay: 1.1 + item * 0.6,
            repeat: active ? Infinity : 0,
            ease: "linear",
          }}
          className="absolute left-10 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-200 shadow-[0_0_12px_rgba(134,239,172,0.9)]"
        />
      ))}

      {/* Starting node */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          opacity: active ? 1 : 0.5,
          scale: active ? 1 : 0.8,
        }}
        transition={{
          duration: 0.5,
          delay: 0.7,
          ease,
        }}
        className="absolute left-7 top-1/2 -translate-y-1/2"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
          <motion.div
            animate={
              active
                ? {
                    scale: [1, 1.4, 1],
                  }
                : {
                    scale: 1,
                  }
            }
            transition={{
              duration: 2,
              repeat: active ? Infinity : 0,
            }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-300"
          />
        </div>
      </motion.div>

      {/* End node */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
        }}
        animate={{
          opacity: active ? 1 : 0.6,
          scale: active ? 1 : 0.85,
        }}
        transition={{
          duration: 0.6,
          delay: 0.95,
          ease,
        }}
        className="absolute right-7 top-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={
            active
              ? {
                  scale: [1, 1.12, 1],
                }
              : {
                  scale: 1,
                }
          }
          transition={{
            duration: 2,
            repeat: active ? Infinity : 0,
          }}
          className={`flex h-10 w-10 items-center justify-center rounded-full border ${
            plan.id === "starter"
              ? "border-emerald-400/30 bg-emerald-400/10"
              : plan.id === "growth"
              ? "border-green-400/30 bg-green-400/10"
              : "border-lime-300/30 bg-lime-300/10"
          }`}
        >
          <Zap
            size={15}
            className={
              plan.id === "scale"
                ? "text-lime-200"
                : plan.id === "growth"
                ? "text-green-300"
                : "text-emerald-300"
            }
          />
        </motion.div>
      </motion.div>

      {/* Labels */}
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: active ? 1 : 0.5,
          y: active ? 0 : -5,
        }}
        transition={{
          duration: 0.55,
          delay: 0.65,
          ease,
        }}
        className="absolute left-6 right-6 top-5 flex items-center justify-between"
      >
        <span className="text-[8px] uppercase tracking-[0.18em] text-[#536058]">
          PAYMENT CAPACITY
        </span>

        <AnimatePresence mode="wait">
          <motion.span
            key={plan.id}
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
              filter: "blur(4px)",
            }}
            transition={{
              duration: 0.3,
            }}
            className="text-[8px] uppercase tracking-[0.18em] text-[#8A948D]"
          >
            {plan.name}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Main number */}
      <div className="absolute left-1/2 top-[36%] -translate-x-1/2 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={invoiceCount}
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.9,
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -14,
              scale: 1.05,
              filter: "blur(5px)",
            }}
            transition={{
              duration: 0.42,
              ease,
            }}
            className="text-5xl font-semibold tracking-[-0.06em] text-[#F5F7F5]"
          >
            {invoiceCount}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: active ? 1 : 0.4,
          }}
          transition={{
            delay: 0.85,
            duration: 0.5,
          }}
          className="mt-1 text-[8px] uppercase tracking-[0.18em] text-[#536058]"
        >
          invoices / month
        </motion.div>
      </div>

      {/* Bottom labels */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: active ? 1 : 0.45,
          y: active ? 0 : 5,
        }}
        transition={{
          duration: 0.55,
          delay: 0.9,
          ease,
        }}
        className="absolute bottom-5 left-6 right-6 flex items-center justify-between"
      >
        <span className="text-[8px] text-[#536058]">
          Manual
        </span>

        <span className="text-[8px] text-[#536058]">
          Automated
        </span>
      </motion.div>
    </motion.div>
  );
}

function FeatureLine({ children, index, active }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 15,
      }}
      animate={
        active
          ? {
              opacity: 1,
              x: 0,
            }
          : {
              opacity: 0.5,
              x: 5,
            }
      }
      transition={{
        duration: 0.5,
        delay: 0.55 + index * 0.07,
        ease,
      }}
      className="flex items-center gap-2"
    >
      <motion.div
        initial={{
          scale: 0,
          rotate: -45,
        }}
        animate={
          active
            ? {
                scale: 1,
                rotate: 0,
              }
            : {
                scale: 0.8,
                rotate: -15,
              }
        }
        transition={{
          duration: 0.4,
          delay: 0.62 + index * 0.07,
          ease,
        }}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/10"
      >
        <Check
          size={9}
          className="text-emerald-400"
        />
      </motion.div>

      <span className="text-xs text-[#8A948D]">
        {children}
      </span>
    </motion.div>
  );
}

export default function Pricing() {
  const [stepIndex, setStepIndex] = useState(2);
  const [hasEntered, setHasEntered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const invoiceCount = invoiceSteps[stepIndex];
  const plan = getPlan(invoiceCount);

  const planColor =
    plan.id === "starter"
      ? "text-emerald-300"
      : plan.id === "growth"
      ? "text-green-300"
      : "text-lime-200";

  const sliderPosition =
    (stepIndex / (invoiceSteps.length - 1)) * 100;

  const sectionState = !hasEntered
    ? "pre"
    : isInView
    ? "visible"
    : "exit";

  const sectionVariants = {
    pre: {
      opacity: 0.85,
      y: 70,
      scale: 0.975,
      filter: "blur(7px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease,
      },
    },

    exit: {
      opacity: 0.7,
      y: -55,
      scale: 0.985,
      filter: "blur(5px)",
      transition: {
        duration: 0.7,
        ease,
      },
    },
  };

  const handleEnter = () => {
    setHasEntered(true);
    setIsInView(true);
  };

  const handleLeave = () => {
    if (hasEntered) {
      setIsInView(false);
    }
  };

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#050706] py-32"
    >
      {/* Background glow */}
      <motion.div
        animate={
          isInView
            ? {
                opacity: 1,
                scale: 1,
              }
            : {
                opacity: 0.35,
                scale: 0.82,
              }
        }
        transition={{
          duration: 1.3,
          ease,
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/[0.035] blur-[150px]"
      />

      {/* Background signal lines */}
      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0,
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                scaleX: 1,
              }
            : {
                opacity: 0.3,
                scaleX: 0.4,
              }
        }
        transition={{
          duration: 1.4,
          delay: 0.15,
          ease,
        }}
        className="pointer-events-none absolute left-0 right-0 top-[48%] h-px origin-center bg-gradient-to-r from-transparent via-emerald-400/[0.08] to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          variants={sectionVariants}
          initial="pre"
          animate={sectionState}
          onViewportEnter={handleEnter}
          onViewportLeave={handleLeave}
          viewport={{
            amount: 0.16,
          }}
          className="relative"
        >
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.9,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
                  : {
                      opacity: hasEntered ? 0.55 : 0.7,
                      y: hasEntered ? -12 : 20,
                      scale: 0.97,
                    }
              }
              transition={{
                duration: 0.7,
                delay: 0.05,
                ease,
              }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/[0.10] bg-emerald-400/[0.025] px-3 py-1.5"
            >
              <motion.div
                animate={
                  isInView
                    ? {
                        rotate: [0, 12, -8, 0],
                        scale: [1, 1.15, 1],
                      }
                    : {
                        rotate: 0,
                        scale: 1,
                      }
                }
                transition={{
                  duration: 2.5,
                  repeat: isInView ? Infinity : 0,
                  repeatDelay: 2,
                }}
              >
                <Sparkles
                  size={12}
                  className="text-emerald-300"
                />
              </motion.div>

              <span className="text-[10px] font-medium tracking-[0.18em] text-[#8A948D]">
                SIMPLE PRICING
              </span>
            </motion.div>

            <motion.h2
              initial={{
                opacity: 0,
                y: 40,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: hasEntered ? 0.55 : 0.75,
                      y: hasEntered ? -20 : 30,
                    }
              }
              transition={{
                duration: 0.8,
                delay: 0.13,
                ease,
              }}
              className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#F5F7F5] sm:text-6xl"
            >
              Pay for the flow,
              <motion.span
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        x: 0,
                      }
                    : {
                        opacity: 0.35,
                        x: 8,
                      }
                }
                transition={{
                  duration: 0.7,
                  delay: 0.28,
                  ease,
                }}
                className="inline-block text-[#536058]"
              >
                {" "}
                not the paperwork.
              </motion.span>
            </motion.h2>

            <motion.p
              initial={{
                opacity: 0,
                y: 22,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: hasEntered ? 0.45 : 0.65,
                      y: hasEntered ? -12 : 15,
                    }
              }
              transition={{
                duration: 0.65,
                delay: 0.3,
                ease,
              }}
              className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#8A948D] sm:text-lg"
            >
              Tell us how much your business moves.
              We'll show you the setup that fits.
            </motion.p>
          </div>

          {/* Pricing system */}
          <div className="mx-auto mt-16 max-w-5xl">
            {/* Slider container */}
            <motion.div
              initial={{
                opacity: 0,
                y: 50,
                scale: 0.97,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
                  : {
                      opacity: 0.55,
                      y: hasEntered ? -18 : 30,
                      scale: 0.985,
                    }
              }
              transition={{
                duration: 0.8,
                delay: 0.35,
                ease,
              }}
              className="rounded-3xl border border-emerald-300/[0.09] bg-emerald-50/[0.018] p-6 sm:p-8"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                {/* Invoice count */}
                <div>
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: isInView ? 1 : 0.5,
                      x: isInView ? 0 : -8,
                    }}
                    transition={{
                      delay: 0.5,
                      duration: 0.5,
                      ease,
                    }}
                    className="text-[9px] uppercase tracking-[0.18em] text-[#536058]"
                  >
                    Monthly invoice volume
                  </motion.div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={invoiceCount}
                        initial={{
                          opacity: 0,
                          y: 12,
                          scale: 0.85,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -10,
                          scale: 1.08,
                        }}
                        transition={{
                          duration: 0.35,
                          ease,
                        }}
                        className="text-4xl font-semibold tracking-[-0.05em] text-[#F5F7F5]"
                      >
                        {invoiceCount}
                      </motion.span>
                    </AnimatePresence>

                    <span className="text-sm text-[#536058]">
                      invoices
                    </span>
                  </div>
                </div>

                {/* Current plan */}
                <div className="text-left sm:text-right">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-[#536058]">
                    Your plan
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={plan.id}
                      initial={{
                        opacity: 0,
                        y: 10,
                        filter: "blur(5px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        filter: "blur(5px)",
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className={`mt-2 text-sm font-medium ${planColor}`}
                    >
                      {plan.name}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Actual slider */}
              <div className="relative mt-10 px-1">
                <div className="relative h-1 rounded-full bg-emerald-100/[0.07]">
                  {/* Progress */}
                  <motion.div
                    animate={{
                      width: `${sliderPosition}%`,
                    }}
                    transition={{
                      duration: 0.45,
                      ease,
                    }}
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-300 to-lime-300"
                  />

                  {/* Moving glow on progress */}
                  <motion.div
                    animate={{
                      left: `${sliderPosition}%`,
                      opacity: isInView ? [0.3, 1, 0.3] : 0,
                    }}
                    transition={{
                      left: {
                        duration: 0.45,
                        ease,
                      },
                      opacity: {
                        duration: 1.8,
                        repeat: isInView ? Infinity : 0,
                      },
                    }}
                    className="absolute top-1/2 h-2 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300 blur-md"
                  />

                  {/* Knob */}
                  <motion.div
                    animate={{
                      left: `${sliderPosition}%`,
                      scale: isInView
                        ? [1, 1.12, 1]
                        : 0.95,
                    }}
                    transition={{
                      left: {
                        duration: 0.45,
                        ease,
                      },
                      scale: {
                        duration: 2,
                        repeat: isInView ? Infinity : 0,
                      },
                    }}
                    className="pointer-events-none absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#090D0A] bg-[#F5F7F5] shadow-[0_0_18px_rgba(134,239,172,0.3)]"
                  />

                  {/* Invisible native range */}
                  <input
                    type="range"
                    min="0"
                    max={invoiceSteps.length - 1}
                    step="1"
                    value={stepIndex}
                    onChange={(e) =>
                      setStepIndex(Number(e.target.value))
                    }
                    className="absolute -left-3 -top-3 z-20 h-7 w-[calc(100%+24px)] cursor-pointer opacity-0"
                    aria-label="Monthly invoice volume"
                  />
                </div>

                {/* Tick buttons */}
                <div className="relative mt-5 flex justify-between">
                  {invoiceSteps.map((value, index) => {
                    const isActive = index === stepIndex;

                    return (
                      <button
                        key={value}
                        onClick={() => setStepIndex(index)}
                        className="group relative flex flex-col items-center"
                        aria-label={`${value} invoices`}
                      >
                        <span
                          className={`text-[8px] transition ${
                            isActive
                              ? "text-[#F5F7F5]"
                              : "text-[#536058] group-hover:text-[#8A948D]"
                          }`}
                        >
                          {value === 250 ? "250+" : value}
                        </span>

                        <motion.span
                          animate={{
                            scale: isActive ? 1 : 0,
                            opacity: isActive ? 1 : 0,
                          }}
                          className="absolute -top-9 h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(134,239,172,0.8)]"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Main pricing content */}
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <FlowVisualization
                invoiceCount={invoiceCount}
                plan={plan}
                active={isInView}
              />

              {/* Plan details */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: 70,
                  y: 35,
                  scale: 0.94,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                      }
                    : {
                        opacity: 0.55,
                        x: hasEntered ? 25 : 45,
                        y: hasEntered ? -15 : 20,
                        scale: 0.975,
                      }
                }
                transition={{
                  duration: 0.9,
                  delay: 0.48,
                  ease,
                }}
                className="relative overflow-hidden rounded-3xl border border-emerald-300/[0.09] bg-emerald-50/[0.018] p-7 sm:p-9"
              >
                {/* Card scan */}
                <motion.div
                  animate={
                    isInView
                      ? {
                          y: ["-120%", "120%"],
                          opacity: [0, 0.35, 0],
                        }
                      : {
                          y: "-120%",
                          opacity: 0,
                        }
                  }
                  transition={{
                    duration: 2.8,
                    delay: 1,
                    repeat: isInView ? Infinity : 0,
                    repeatDelay: 4,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-emerald-300/[0.045] to-transparent"
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={plan.id}
                    initial={{
                      opacity: 0,
                      y: 18,
                      x: 12,
                      filter: "blur(7px)",
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      x: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      y: -18,
                      x: -8,
                      filter: "blur(7px)",
                    }}
                    transition={{
                      duration: 0.42,
                      ease,
                    }}
                  >
                    {/* Plan heading */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div
                          className={`text-[9px] font-medium tracking-[0.2em] ${planColor}`}
                        >
                          {plan.name}
                        </div>

                        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#F5F7F5]">
                          {plan.description}
                        </h3>
                      </div>

                      {plan.id === "growth" && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.7,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{
                            delay: 0.18,
                            duration: 0.35,
                            ease,
                          }}
                          className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[7px] text-emerald-300"
                        >
                          <Sparkles size={8} />
                          POPULAR
                        </motion.div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-8 flex items-end gap-2">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={plan.price}
                          initial={{
                            opacity: 0,
                            y: 15,
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            y: -12,
                            scale: 1.05,
                          }}
                          transition={{
                            duration: 0.35,
                            ease,
                          }}
                          className="text-5xl font-semibold tracking-[-0.06em] text-[#F5F7F5]"
                        >
                          {plan.price}
                        </motion.span>
                      </AnimatePresence>

                      <span className="mb-2 text-xs text-[#536058]">
                        / month
                      </span>
                    </div>

                    {/* Features */}
                    <div className="mt-8 space-y-3">
                      {plan.features.map((feature, index) => (
                        <FeatureLine
                          key={feature}
                          index={index}
                          active={isInView}
                        >
                          {feature}
                        </FeatureLine>
                      ))}
                    </div>

                    {/* CTA */}
                    <motion.button
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: isInView ? 1 : 0.55,
                        y: isInView ? 0 : 8,
                      }}
                      transition={{
                        delay: 0.8,
                        duration: 0.5,
                        ease,
                      }}
                      whileHover={{
                        scale: 1.015,
                      }}
                      whileTap={{
                        scale: 0.985,
                      }}
                      className="group mt-9 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5F7F5] px-5 py-3.5 text-sm font-semibold text-[#050706] transition hover:bg-emerald-50"
                    >
                      Start with {plan.name.toLowerCase()}

                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </motion.button>

                    {/* Trust indicators */}
                    <motion.div
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: isInView ? 1 : 0.45,
                      }}
                      transition={{
                        delay: 0.95,
                        duration: 0.5,
                      }}
                      className="mt-5 flex items-center justify-center gap-5 text-[8px] text-[#536058]"
                    >
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={10} />
                        No contracts
                      </span>

                      <span className="flex items-center gap-1">
                        <Bot size={10} />
                        AI included
                      </span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Footer note */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: 0.4,
                      y: hasEntered ? -12 : 12,
                    }
              }
              transition={{
                duration: 0.55,
                delay: 1,
                ease,
              }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-[#536058]">
                Start free. Upgrade when your money starts moving faster.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}