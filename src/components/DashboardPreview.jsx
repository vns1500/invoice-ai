import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  TrendingUp,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const ranges = {
  "7D": {
    revenue: "$18,420",
    change: "+12.8%",
    outstanding: "$6,840",
    paid: "$11,580",
    chart: [32, 42, 38, 55, 48, 67, 61, 78, 72, 88, 84, 96],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  "30D": {
    revenue: "$64,280",
    change: "+18.4%",
    outstanding: "$12,840",
    paid: "$51,440",
    chart: [28, 35, 31, 48, 44, 58, 52, 67, 63, 76, 71, 92],
    labels: ["W1", "W2", "W3", "W4"],
  },
  "90D": {
    revenue: "$184,920",
    change: "+24.7%",
    outstanding: "$21,480",
    paid: "$163,440",
    chart: [22, 31, 28, 42, 38, 51, 48, 64, 59, 78, 73, 96],
    labels: ["Jan", "Feb", "Mar"],
  },
};

const invoices = [
  {
    id: "INV-2048",
    client: "Acme Studio",
    amount: "$2,840",
    status: "Paid",
    date: "Today",
  },
  {
    id: "INV-2047",
    client: "Northstar Labs",
    amount: "$4,200",
    status: "Pending",
    date: "Yesterday",
  },
  {
    id: "INV-2046",
    client: "Vertex Design",
    amount: "$1,680",
    status: "Paid",
    date: "Sep 18",
  },
  {
    id: "INV-2045",
    client: "Orbit Systems",
    amount: "$3,420",
    status: "Overdue",
    date: "Sep 16",
  },
];

const sectionEase = [0.22, 1, 0.36, 1];

function Metric({ label, value, change, positive = true }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] uppercase tracking-[0.15em] text-[#536058]">
        {label}
      </div>

      <div className="mt-2 flex items-end gap-2">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: sectionEase }}
          className="text-xl font-semibold tracking-[-0.04em] text-[#F5F7F5] sm:text-2xl"
        >
          {value}
        </motion.span>

        {change && (
          <span
            className={`mb-0.5 flex items-center gap-0.5 text-[9px] ${
              positive ? "text-[#4ADE80]" : "text-rose-400"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={10} />
            ) : (
              <ArrowDownRight size={10} />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function RevenueChart({ data, active }) {
  const points = data.chart;
  const max = Math.max(...points);
  const min = Math.min(...points);

  const width = 700;
  const height = 210;
  const padding = 15;

  const coordinates = points.map((value, index) => {
    const x =
      padding +
      (index / (points.length - 1)) *
        (width - padding * 2);

    const normalized =
      (value - min) /
      Math.max(1, max - min);

    const y =
      height -
      padding -
      normalized *
        (height - padding * 2);

    return { x, y };
  });

  const linePath = coordinates
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  const areaPath =
    `${linePath} L ${width - padding} ${height} L ${padding} ${height} Z`;

  return (
    <div className="relative h-[250px] w-full">
      <div className="absolute inset-x-0 top-5 bottom-8 flex flex-col justify-between">
        {[1, 2, 3, 4].map((line) => (
          <motion.div
            key={line}
            initial={{ scaleX: 0 }}
            animate={active ? { scaleX: 1 } : { scaleX: 0.96 }}
            transition={{
              delay: 0.3 + line * 0.05,
              duration: 0.7,
              ease: sectionEase,
            }}
            className="h-px w-full origin-left bg-emerald-100/[0.035]"
          />
        ))}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-5 h-[190px] w-full overflow-visible"
      >
        <defs>
          <linearGradient
            id="revenueArea"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#22C55E"
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              stopColor="#22C55E"
              stopOpacity="0"
            />
          </linearGradient>

          <linearGradient
            id="revenueLine"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor="#22C55E"
            />
            <stop
              offset="100%"
              stopColor="#86EFAC"
            />
          </linearGradient>
        </defs>

        <motion.path
          d={areaPath}
          fill="url(#revenueArea)"
          initial={{
            opacity: 0,
            pathLength: 0,
          }}
          animate={
            active
              ? {
                  opacity: 1,
                  pathLength: 1,
                }
              : {
                  opacity: 0.7,
                  pathLength: 1,
                }
          }
          transition={{
            opacity: {
              duration: 0.8,
              delay: 0.25,
            },
            pathLength: {
              duration: 1.15,
              ease: "easeInOut",
            },
          }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#revenueLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0.95 }}
          transition={{
            duration: 1.35,
            ease: "easeInOut",
            delay: 0.15,
          }}
        />

        {coordinates.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#090D0A"
            stroke={
              index === coordinates.length - 1
                ? "#BBF7D0"
                : "#4ADE80"
            }
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={
              active
                ? {
                    scale: 1,
                    opacity: 1,
                  }
                : {
                    scale: 0.85,
                    opacity: 0.7,
                  }
            }
            transition={{
              delay: 0.75 + index * 0.045,
              duration: 0.25,
              ease: sectionEase,
            }}
          />
        ))}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
        {data.labels.map((label) => (
          <span
            key={label}
            className="text-[8px] text-[#536058]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function InvoiceRow({ invoice, active, onClick, index, activeSection }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{
        opacity: 0,
        x: 24,
      }}
      animate={
        activeSection
          ? {
              opacity: 1,
              x: 0,
            }
          : {
              opacity: 0.75,
              x: 8,
            }
      }
      transition={{
        delay: 0.75 + index * 0.08,
        duration: 0.6,
        ease: sectionEase,
      }}
      className={`group flex w-full items-center gap-3 border-b border-emerald-100/[0.045] px-4 py-3 text-left transition ${
        active
          ? "bg-emerald-100/[0.045]"
          : "hover:bg-emerald-100/[0.025]"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          invoice.status === "Paid"
            ? "bg-emerald-400/10"
            : invoice.status === "Overdue"
            ? "bg-rose-400/10"
            : "bg-emerald-300/10"
        }`}
      >
        {invoice.status === "Paid" ? (
          <Check
            size={13}
            className="text-[#4ADE80]"
          />
        ) : invoice.status === "Overdue" ? (
          <AlertCircle
            size={13}
            className="text-rose-400"
          />
        ) : (
          <Clock3
            size={13}
            className="text-[#86EFAC]"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[10px] font-medium text-[#D7DED9]">
          {invoice.client}
        </div>

        <div className="mt-0.5 text-[8px] text-[#536058]">
          {invoice.id} · {invoice.date}
        </div>
      </div>

      <div className="text-right">
        <div className="text-[10px] font-medium text-[#D7DED9]">
          {invoice.amount}
        </div>

        <div
          className={`mt-0.5 text-[8px] ${
            invoice.status === "Paid"
              ? "text-[#4ADE80]"
              : invoice.status === "Overdue"
              ? "text-rose-400"
              : "text-[#86EFAC]"
          }`}
        >
          {invoice.status}
        </div>
      </div>

      <ChevronRight
        size={13}
        className={`transition ${
          active
            ? "text-[#AEB8B1]"
            : "text-[#536058] group-hover:text-[#8A948D]"
        }`}
      />
    </motion.button>
  );
}

function ActivityPanel({ invoice, activeSection }) {
  if (!invoice) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={invoice.id}
        initial={{
          opacity: 0,
          x: 14,
        }}
        animate={{
          opacity: activeSection ? 1 : 0.65,
          x: 0,
        }}
        exit={{
          opacity: 0,
          x: -14,
        }}
        transition={{
          duration: 0.45,
          ease: sectionEase,
        }}
        className="border-t border-emerald-100/[0.06] px-4 py-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[8px] uppercase tracking-[0.15em] text-[#536058]">
              SELECTED INVOICE
            </div>

            <div className="mt-1 text-xs text-[#D7DED9]">
              {invoice.id}
            </div>
          </div>

          <MoreHorizontal
            size={15}
            className="text-[#536058]"
          />
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
            </div>

            <div>
              <div className="text-[9px] text-[#8A948D]">
                Invoice created
              </div>

              <div className="text-[7px] text-[#536058]">
                09:41 AM
              </div>
            </div>
          </div>

          <div className="ml-3 h-4 w-px bg-emerald-100/[0.06]" />

          <div className="flex items-center gap-3">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#86EFAC]" />
            </div>

            <div>
              <div className="text-[9px] text-[#8A948D]">
                Client activity detected
              </div>

              <div className="text-[7px] text-[#536058]">
                11:18 AM
              </div>
            </div>
          </div>

          <div className="ml-3 h-4 w-px bg-emerald-100/[0.06]" />

          <div className="flex items-center gap-3">
            <div
              className={`relative flex h-6 w-6 items-center justify-center rounded-full ${
                invoice.status === "Paid"
                  ? "bg-emerald-400/10"
                  : "bg-white/[0.04]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  invoice.status === "Paid"
                    ? "bg-[#BBF7D0]"
                    : "bg-slate-600"
                }`}
              />
            </div>

            <div>
              <div className="text-[9px] text-[#8A948D]">
                {invoice.status === "Paid"
                  ? "Payment received"
                  : "Awaiting payment"}
              </div>

              <div className="text-[7px] text-[#536058]">
                {invoice.status === "Paid"
                  ? "02:36 PM"
                  : "Monitoring"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DashboardPreview() {
  const [range, setRange] = useState("30D");
  const [selectedInvoice, setSelectedInvoice] =
    useState(invoices[0]);
  const [hasEntered, setHasEntered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const data = ranges[range];

  const handleEnter = () => {
    setHasEntered(true);
    setIsInView(true);
  };

  const handleLeave = () => {
    if (hasEntered) {
      setIsInView(false);
    }
  };

  const sectionState = !hasEntered
    ? "pre"
    : isInView
    ? "visible"
    : "exit";

  const sectionVariants = {
    pre: {
      opacity: 0.82,
      y: 70,
      scale: 0.975,
      filter: "blur(8px)",
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: sectionEase,
      },
    },

    exit: {
      opacity: 0.76,
      y: -55,
      scale: 0.985,
      filter: "blur(5px)",
      transition: {
        duration: 0.7,
        ease: sectionEase,
      },
    },
  };

  const headingVariants = {
    pre: {
      opacity: 0.75,
      y: 38,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: sectionEase,
        delay: 0.05,
      },
    },

    exit: {
      opacity: 0.55,
      y: -24,
      transition: {
        duration: 0.5,
        ease: sectionEase,
      },
    },
  };

  const dashboardVariants = {
    pre: {
      opacity: 0.75,
      y: 75,
      scale: 0.96,
      rotateX: 4,
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 1.05,
        delay: 0.18,
        ease: sectionEase,
      },
    },

    exit: {
      opacity: 0.55,
      y: -45,
      scale: 0.975,
      rotateX: -2,
      transition: {
        duration: 0.65,
        ease: sectionEase,
      },
    },
  };

  return (
    <section
      className="relative overflow-hidden bg-[#050706] py-32"
      onMouseEnter={handleEnter}
    >
      {/* Ambient depth */}
      <motion.div
        animate={
          isInView
            ? {
                opacity: 1,
                scale: 1,
              }
            : {
                opacity: 0.55,
                scale: 0.85,
              }
        }
        transition={{
          duration: 1.4,
          ease: sectionEase,
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/[0.035] blur-[160px]"
      />

      <div
        className="relative mx-auto max-w-7xl px-5 lg:px-8"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* Section animation observer */}
        <motion.div
          variants={sectionVariants}
          initial="pre"
          animate={sectionState}
          onViewportEnter={handleEnter}
          onViewportLeave={handleLeave}
          viewport={{
            amount: 0.18,
          }}
          className="relative"
        >
          {/* Heading */}
          <motion.div
            variants={headingVariants}
            animate={sectionState}
            className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <motion.div
                initial={{
                  opacity: 0,
                  x: -18,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        x: 0,
                      }
                    : {
                        opacity: hasEntered ? 0.55 : 0.65,
                        x: hasEntered ? -10 : -18,
                      }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.08,
                  ease: sectionEase,
                }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/[0.08] bg-emerald-100/[0.025] px-3 py-1.5"
              >
                <TrendingUp
                  size={12}
                  className="text-[#86EFAC]"
                />

                <span className="text-[10px] font-medium tracking-[0.18em] text-[#8A948D]">
                  COMMAND CENTER
                </span>
              </motion.div>

              <h2 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#F5F7F5] sm:text-6xl">
                Your business,
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
                    duration: 0.8,
                    delay: 0.2,
                    ease: sectionEase,
                  }}
                  className="inline-block text-[#536058]"
                >
                  {" "}
                  at a glance.
                </motion.span>
              </h2>

              <motion.p
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
                        opacity: hasEntered ? 0.45 : 0.65,
                        y: hasEntered ? -10 : 18,
                      }
                }
                transition={{
                  duration: 0.7,
                  delay: 0.28,
                  ease: sectionEase,
                }}
                className="mt-6 max-w-xl text-base leading-7 text-[#8A948D] sm:text-lg"
              >
                Every invoice, payment and signal comes together
                in one living workspace.
              </motion.p>
            </div>

            {/* Range selector */}
            <motion.div
              initial={{
                opacity: 0,
                x: 28,
                scale: 0.94,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      x: 0,
                      scale: 1,
                    }
                  : {
                      opacity: hasEntered ? 0.55 : 0.7,
                      x: hasEntered ? 15 : 28,
                      scale: 0.97,
                    }
              }
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: sectionEase,
              }}
              className="flex w-fit items-center rounded-xl border border-emerald-100/[0.08] bg-emerald-100/[0.025] p-1"
            >
              {Object.keys(ranges).map((item) => (
                <button
                  key={item}
                  onClick={() => setRange(item)}
                  className={`relative rounded-lg px-3 py-2 text-[10px] font-medium transition ${
                    range === item
                      ? "text-[#F5F7F5]"
                      : "text-[#536058] hover:text-[#AEB8B1]"
                  }`}
                >
                  {range === item && (
                    <motion.div
                      layoutId="range-pill"
                      className="absolute inset-0 rounded-lg bg-emerald-100/[0.08]"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}

                  <span className="relative z-10">
                    {item}
                  </span>
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard */}
          <motion.div
            variants={dashboardVariants}
            animate={sectionState}
            style={{
              transformPerspective: 1400,
            }}
            className="relative mt-16 overflow-hidden rounded-[28px] border border-emerald-100/[0.08] bg-[#090D0A] shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
          >
            {/* Animated top edge */}
            <motion.div
              initial={{
                scaleX: 0,
              }}
              animate={
                isInView
                  ? {
                      scaleX: 1,
                    }
                  : {
                      scaleX: 0.4,
                    }
              }
              transition={{
                duration: 1.15,
                delay: 0.25,
                ease: sectionEase,
              }}
              className="absolute left-0 right-0 top-0 z-20 h-px origin-left bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent"
            />

            {/* Browser-like top bar */}
            <motion.div
              initial={{
                opacity: 0,
                y: -12,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: 0.6,
                      y: -8,
                    }
              }
              transition={{
                duration: 0.55,
                delay: 0.35,
                ease: sectionEase,
              }}
              className="flex h-12 items-center justify-between border-b border-emerald-100/[0.06] px-5"
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/10" />
                <span className="h-2 w-2 rounded-full bg-white/10" />
                <span className="h-2 w-2 rounded-full bg-white/10" />
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 text-[8px] tracking-[0.15em] text-[#536058]">
                APP.INVOICEAI
              </div>

              <div className="flex items-center gap-2">
                <motion.span
                  animate={
                    isInView
                      ? {
                          opacity: [0.45, 1, 0.45],
                          scale: [0.9, 1.15, 0.9],
                        }
                      : {
                          opacity: 0.35,
                          scale: 0.9,
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat: isInView ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                />

                <span className="text-[8px] text-[#536058]">
                  LIVE
                </span>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr_330px]">
              {/* Main workspace */}
              <div className="min-w-0 p-5 sm:p-7 lg:p-8">
                {/* Dashboard header */}
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
                          opacity: 0.55,
                          y: 10,
                        }
                  }
                  transition={{
                    duration: 0.65,
                    delay: 0.42,
                    ease: sectionEase,
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.15em] text-[#536058]">
                      Overview
                    </div>

                    <div className="mt-1 text-lg font-medium tracking-[-0.02em] text-[#F5F7F5]">
                      Good morning, Alex
                    </div>
                  </div>

                  <div className="hidden items-center gap-2 rounded-lg border border-emerald-100/[0.06] px-3 py-2 sm:flex">
                    <motion.span
                      animate={
                        isInView
                          ? {
                              scale: [1, 1.25, 1],
                            }
                          : {
                              scale: 1,
                            }
                      }
                      transition={{
                        duration: 2,
                        repeat: isInView ? Infinity : 0,
                      }}
                      className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]"
                    />

                    <span className="text-[8px] text-[#8A948D]">
                      All systems active
                    </span>
                  </div>
                </motion.div>

                {/* Metrics */}
                <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    {
                      label: "Revenue",
                      value: data.revenue,
                      change: data.change,
                    },
                    {
                      label: "Outstanding",
                      value: data.outstanding,
                    },
                    {
                      label: "Collected",
                      value: data.paid,
                      change: "+9.2%",
                    },
                    {
                      label: "Payment rate",
                      value: "92.4%",
                      change: "+4.1%",
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{
                        opacity: 0,
                        y: 30,
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
                              opacity: 0.55,
                              y: 12,
                              scale: 0.98,
                            }
                      }
                      transition={{
                        delay: 0.5 + index * 0.08,
                        duration: 0.65,
                        ease: sectionEase,
                      }}
                      className="rounded-xl border border-emerald-100/[0.06] bg-emerald-100/[0.02] p-4"
                    >
                      <Metric {...metric} />
                    </motion.div>
                  ))}
                </div>

                {/* Chart */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 34,
                    scale: 0.975,
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
                          y: 15,
                          scale: 0.985,
                        }
                  }
                  transition={{
                    delay: 0.7,
                    duration: 0.8,
                    ease: sectionEase,
                  }}
                  className="mt-3 rounded-xl border border-emerald-100/[0.06] bg-emerald-100/[0.02] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.15em] text-[#536058]">
                        Cash collected
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-[#D7DED9]">
                          Revenue movement
                        </span>

                        <span className="flex items-center gap-1 text-[8px] text-[#4ADE80]">
                          <ArrowUpRight size={9} />
                          {data.change}
                        </span>
                      </div>
                    </div>

                    <motion.div
                      animate={
                        isInView
                          ? {
                              rotate: [0, 8, -5, 0],
                              scale: [1, 1.12, 1],
                            }
                          : {
                              rotate: 0,
                              scale: 1,
                            }
                      }
                      transition={{
                        duration: 2.4,
                        repeat: isInView ? Infinity : 0,
                        repeatDelay: 2,
                      }}
                    >
                      <Sparkles
                        size={14}
                        className="text-[#86EFAC]"
                      />
                    </motion.div>
                  </div>

                  <RevenueChart
                    data={data}
                    active={isInView}
                  />
                </motion.div>

                {/* Bottom row */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {/* AI insight */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -28,
                      y: 25,
                    }}
                    animate={
                      isInView
                        ? {
                            opacity: 1,
                            x: 0,
                            y: 0,
                          }
                        : {
                            opacity: 0.55,
                            x: -12,
                            y: 10,
                          }
                    }
                    transition={{
                      delay: 0.88,
                      duration: 0.7,
                      ease: sectionEase,
                    }}
                    className="relative overflow-hidden rounded-xl border border-emerald-400/10 bg-emerald-400/[0.035] p-5"
                  >
                    <motion.div
                      animate={
                        isInView
                          ? {
                              x: [0, 18, 0],
                              y: [0, -12, 0],
                            }
                          : {
                              x: 0,
                              y: 0,
                            }
                      }
                      transition={{
                        duration: 5,
                        repeat: isInView ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                      className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl"
                    />

                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={13}
                          className="text-[#86EFAC]"
                        />

                        <span className="text-[8px] font-medium tracking-[0.15em] text-[#86EFAC]">
                          AI INSIGHT
                        </span>
                      </div>

                      <p className="mt-4 max-w-sm text-xs leading-6 text-[#8A948D]">
                        Your payment velocity is trending upward.
                        Two outstanding invoices are likely to
                        clear this week.
                      </p>

                      <button className="mt-4 flex items-center gap-1 text-[9px] text-[#536058] transition hover:text-[#F5F7F5]">
                        View insight
                        <ArrowUpRight size={10} />
                      </button>
                    </div>
                  </motion.div>

                  {/* Collection health */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 28,
                      y: 25,
                    }}
                    animate={
                      isInView
                        ? {
                            opacity: 1,
                            x: 0,
                            y: 0,
                          }
                        : {
                            opacity: 0.55,
                            x: 12,
                            y: 10,
                          }
                    }
                    transition={{
                      delay: 0.96,
                      duration: 0.7,
                      ease: sectionEase,
                    }}
                    className="rounded-xl border border-emerald-100/[0.06] bg-emerald-100/[0.02] p-5"
                  >
                    <div className="text-[8px] uppercase tracking-[0.15em] text-[#536058]">
                      Collection health
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-2xl font-semibold tracking-[-0.04em] text-[#F5F7F5]">
                        86
                      </span>

                      <span className="text-[9px] text-[#4ADE80]">
                        Healthy
                      </span>
                    </div>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-emerald-100/[0.05]">
                      <motion.div
                        initial={{
                          width: "0%",
                        }}
                        animate={{
                          width: isInView ? "86%" : "20%",
                        }}
                        transition={{
                          duration: 1.2,
                          delay: 1.05,
                          ease: sectionEase,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#86EFAC]"
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-[7px] text-[#536058]">
                      <span>Needs attention</span>
                      <span>Excellent</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Invoice activity sidebar */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: 45,
                }}
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        x: 0,
                      }
                    : {
                        opacity: 0.55,
                        x: 20,
                      }
                }
                transition={{
                  delay: 0.48,
                  duration: 0.8,
                  ease: sectionEase,
                }}
                className="border-t border-emerald-100/[0.06] lg:border-l lg:border-t-0"
              >
                <div className="flex items-center justify-between border-b border-emerald-100/[0.06] px-4 py-4">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.15em] text-[#536058]">
                      Recent invoices
                    </div>

                    <div className="mt-1 text-xs text-[#D7DED9]">
                      Payment activity
                    </div>
                  </div>

                  <motion.span
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: isInView ? 1 : 0.8,
                    }}
                    transition={{
                      delay: 0.9,
                      duration: 0.45,
                      ease: sectionEase,
                    }}
                    className="rounded-full bg-emerald-400/10 px-2 py-1 text-[7px] text-[#4ADE80]"
                  >
                    {invoices.length} active
                  </motion.span>
                </div>

                <div>
                  {invoices.map((invoice, index) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      active={
                        selectedInvoice.id === invoice.id
                      }
                      index={index}
                      activeSection={isInView}
                      onClick={() =>
                        setSelectedInvoice(invoice)
                      }
                    />
                  ))}
                </div>

                <ActivityPanel
                  invoice={selectedInvoice}
                  activeSection={isInView}
                />

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
                          opacity: 0.55,
                          y: 8,
                        }
                  }
                  transition={{
                    delay: 1.05,
                    duration: 0.55,
                    ease: sectionEase,
                  }}
                  className="px-4 py-4"
                >
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-100/[0.07] bg-emerald-100/[0.02] py-2.5 text-[9px] text-[#8A948D] transition hover:bg-emerald-100/[0.05] hover:text-[#F5F7F5]">
                    View all invoices
                    <ChevronRight size={11} />
                  </button>
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom ambient line */}
            <motion.div
              initial={{
                scaleX: 0,
              }}
              animate={
                isInView
                  ? {
                      scaleX: 1,
                    }
                  : {
                      scaleX: 0.35,
                    }
              }
              transition={{
                duration: 1.1,
                delay: 1,
                ease: sectionEase,
              }}
              className="h-px origin-center bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
            />
          </motion.div>

          {/* Caption */}
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
                    opacity: 0.45,
                    y: -10,
                  }
            }
            transition={{
              delay: 1.1,
              duration: 0.6,
              ease: sectionEase,
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-xs leading-5 text-[#536058]">
              A single workspace for the money moving through
              your business.
            </p>

            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] text-[#536058]">
              <motion.span
                animate={
                  isInView
                    ? {
                        scale: [1, 1.4, 1],
                        opacity: [0.55, 1, 0.55],
                      }
                    : {
                        scale: 1,
                        opacity: 0.5,
                      }
                }
                transition={{
                  duration: 2,
                  repeat: isInView ? Infinity : 0,
                }}
                className="h-1.5 w-1.5 rounded-full bg-[#86EFAC]"
              />
              Everything connected
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}