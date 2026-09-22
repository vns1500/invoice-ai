import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshTransmissionMaterial,
  RoundedBox,
  Sparkles,
  Line,
} from "@react-three/drei";
import {
  Suspense,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  ArrowRight,
  MousePointer2,
  Activity,
} from "lucide-react";

/* -------------------------------------------------------
   Animation presets
------------------------------------------------------- */

const ease = [0.16, 1, 0.3, 1];

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 70,
    scale: 0.985,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.1,
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

const copyVariants = {
  hidden: {
    opacity: 0,
    x: -55,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.95,
      ease,
    },
  },

  exit: {
    opacity: 0,
    x: -45,
    transition: {
      duration: 0.65,
      ease,
    },
  },
};

/* -------------------------------------------------------
   Animated Flow Pulse
------------------------------------------------------- */

function FlowPulse({ status }) {
  const ref = useRef();
  const progress = useRef(0);

  useFrame((state) => {
    if (!ref.current) return;

    const t = state.clock.getElapsedTime();

    progress.current =
      (progress.current + 0.004) % 1;

    const p = progress.current;

    const x = THREE.MathUtils.lerp(
      -2.7,
      2.7,
      p
    );

    const y =
      0.2 +
      Math.sin(p * Math.PI * 4) * 0.08;

    ref.current.position.set(
      x,
      y,
      0.3
    );

    const pulse =
      1 +
      Math.sin(t * 8) * 0.12;

    ref.current.scale.setScalar(pulse);
  });

  const color =
    status === "PAID"
      ? "#4ade80"
      : status === "SENT"
      ? "#86efac"
      : "#22c55e";

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry
          args={[0.055, 16, 16]}
        />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.95}
        />
      </mesh>

      <pointLight
        color={color}
        intensity={1.2}
        distance={1}
      />
    </group>
  );
}

/* -------------------------------------------------------
   Floating Invoice
------------------------------------------------------- */

function InvoiceCard({
  status,
  setStatus,
}) {
  const group = useRef();

  useFrame((state) => {
    const t =
      state.clock.getElapsedTime();

    if (!group.current) return;

    const pointerX =
      state.pointer.x;

    const pointerY =
      state.pointer.y;

    group.current.rotation.x =
      THREE.MathUtils.lerp(
        group.current.rotation.x,
        -0.08 +
          pointerY * 0.2 +
          Math.sin(t * 0.45) * 0.015,
        0.045
      );

    group.current.rotation.y =
      THREE.MathUtils.lerp(
        group.current.rotation.y,
        pointerX * 0.32 +
          Math.sin(t * 0.35) * 0.02,
        0.045
      );

    group.current.rotation.z =
      THREE.MathUtils.lerp(
        group.current.rotation.z,
        Math.sin(t * 0.55) * 0.012,
        0.05
      );

    group.current.position.y =
      Math.sin(t * 1.15) * 0.08;

    group.current.position.x =
      THREE.MathUtils.lerp(
        group.current.position.x,
        pointerX * 0.12,
        0.03
      );
  });

  const statusColor =
    status === "PAID"
      ? "#4ade80"
      : status === "SENT"
      ? "#86efac"
      : "#22c55e";

  const handleStatusChange = () => {
    setStatus(
      status === "DRAFT"
        ? "SENT"
        : status === "SENT"
        ? "PAID"
        : "DRAFT"
    );
  };

  return (
    <group
      ref={group}
      position={[0, 0.2, 0]}
    >
      {/* Invoice body */}

      <RoundedBox
        args={[3.8, 2.7, 0.18]}
        radius={0.18}
        smoothness={5}
      >
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.18}
          chromaticAberration={0.04}
          anisotropy={0.15}
          distortion={0.08}
          distortionScale={0.2}
          temporalDistortion={0.05}
          transmission={0.95}
          roughness={0.18}
          color="#101510"
        />
      </RoundedBox>

      {/* Logo */}

      <mesh
        position={[
          -1.35,
          0.85,
          0.15,
        ]}
      >
        <boxGeometry
          args={[0.42, 0.42, 0.05]}
        />

        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Header */}

      <mesh
        position={[
          -0.45,
          0.92,
          0.15,
        ]}
      >
        <boxGeometry
          args={[1.25, 0.1, 0.04]}
        />

        <meshStandardMaterial
          color="#e7eee9"
        />
      </mesh>

      {/* Subheader */}

      <mesh
        position={[
          -0.45,
          0.67,
          0.15,
        ]}
      >
        <boxGeometry
          args={[0.8, 0.06, 0.04]}
        />

        <meshStandardMaterial
          color="#718078"
        />
      </mesh>

      {/* Invoice rows */}

      {[-0.05, -0.35, -0.65].map(
        (y, i) => (
          <group key={i}>
            <mesh
              position={[
                -0.85,
                y,
                0.15,
              ]}
            >
              <boxGeometry
                args={[
                  1.4,
                  0.055,
                  0.04,
                ]}
              />

              <meshStandardMaterial
                color="#526057"
              />
            </mesh>

            <mesh
              position={[
                0.8,
                y,
                0.15,
              ]}
            >
              <boxGeometry
                args={[
                  0.55,
                  0.055,
                  0.04,
                ]}
              />

              <meshStandardMaterial
                color="#9aa69e"
              />
            </mesh>
          </group>
        )
      )}

      {/* Total */}

      <mesh
        position={[
          0.45,
          -0.95,
          0.15,
        ]}
      >
        <boxGeometry
          args={[
            1.05,
            0.13,
            0.04,
          ]}
        />

        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Interactive node */}

      <mesh
        position={[
          1.45,
          0.9,
          0.15,
        ]}
        onClick={handleStatusChange}
      >
        <sphereGeometry
          args={[
            0.12,
            24,
            24,
          ]}
        />

        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Status bar */}

      <mesh
        position={[
          1.1,
          0.55,
          0.22,
        ]}
      >
        <boxGeometry
          args={[
            0.7,
            0.22,
            0.03,
          ]}
        />

        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------
   Payment Orb
------------------------------------------------------- */

function PaymentOrb({ status }) {
  const orb = useRef();

  const target = useRef(
    new THREE.Vector3(
      -2.7,
      0.2,
      0.5
    )
  );

  useFrame((state) => {
    const t =
      state.clock.getElapsedTime();

    if (!orb.current) return;

    if (status === "DRAFT") {
      target.current.set(
        -2.7,
        0.2 +
          Math.sin(t * 2) * 0.2,
        0.5
      );
    }

    if (status === "SENT") {
      target.current.set(
        Math.sin(t * 0.8) * 1.5,
        0.2 +
          Math.sin(t * 2) * 0.22,
        0.5
      );
    }

    if (status === "PAID") {
      target.current.set(
        2.7,
        0.2 +
          Math.sin(t * 2) * 0.18,
        0.5
      );
    }

    orb.current.position.lerp(
      target.current,
      0.045
    );

    orb.current.rotation.y +=
      0.025;

    orb.current.rotation.x +=
      0.01;
  });

  const color =
    status === "PAID"
      ? "#4ade80"
      : "#86efac";

  return (
    <group
      ref={orb}
      position={[
        -2.7,
        0.2,
        0.5,
      ]}
    >
      <mesh>
        <sphereGeometry
          args={[
            0.25,
            32,
            32,
          ]}
        />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
        />
      </mesh>

      <mesh scale={1.8}>
        <sphereGeometry
          args={[
            0.25,
            20,
            20,
          ]}
        />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
        />
      </mesh>

      <pointLight
        color={color}
        intensity={2}
        distance={3}
      />
    </group>
  );
}

/* -------------------------------------------------------
   Client Nodes
------------------------------------------------------- */

function ClientNode({
  position,
  color,
  phase = 0,
}) {
  const ref = useRef();

  useFrame((state) => {
    const t =
      state.clock.getElapsedTime();

    if (!ref.current) return;

    ref.current.position.y =
      position[1] +
      Math.sin(
        t * 1.1 + phase
      ) *
        0.16;

    ref.current.position.x =
      position[0] +
      Math.cos(
        t * 0.65 + phase
      ) *
        0.08;

    ref.current.rotation.y +=
      0.012;

    ref.current.rotation.x +=
      0.006;
  });

  return (
    <group
      ref={ref}
      position={position}
    >
      <mesh>
        <icosahedronGeometry
          args={[0.32, 1]}
        />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          wireframe
        />
      </mesh>

      <mesh scale={1.8}>
        <icosahedronGeometry
          args={[0.32, 1]}
        />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.035}
          wireframe
        />
      </mesh>

      <pointLight
        color={color}
        intensity={0.7}
        distance={2}
      />
    </group>
  );
}

/* -------------------------------------------------------
   Flow Lines
------------------------------------------------------- */

function FlowLines() {
  return (
    <>
      <Line
        points={[
          [-2.7, 0.2, 0],
          [-1.4, 0.2, 0],
          [0, 0.2, 0],
          [1.5, 0.2, 0],
          [2.7, 0.2, 0],
        ]}
        color="#22c55e"
        transparent
        opacity={0.32}
        lineWidth={1}
      />

      <Line
        points={[
          [-2.2, 1.4, -0.3],
          [-1.1, 0.8, -0.2],
          [0, 0.4, -0.1],
        ]}
        color="#86efac"
        transparent
        opacity={0.2}
        lineWidth={0.7}
      />

      <Line
        points={[
          [0.4, -0.7, -0.2],
          [1.4, -1.2, -0.1],
          [2.4, -0.8, -0.3],
        ]}
        color="#4ade80"
        transparent
        opacity={0.2}
        lineWidth={0.7}
      />
    </>
  );
}

/* -------------------------------------------------------
   Main 3D Scene
------------------------------------------------------- */

function Scene({
  status,
  setStatus,
}) {
  return (
    <>
      <ambientLight intensity={0.35} />

      <pointLight
        position={[0, 2, 4]}
        intensity={7}
        color="#22c55e"
      />

      <pointLight
        position={[-4, -2, 2]}
        intensity={4}
        color="#86efac"
      />

      <Sparkles
        count={100}
        scale={[9, 5, 5]}
        size={1.5}
        speed={0.3}
        opacity={0.45}
        color="#86efac"
      />

      <Float
        speed={1.3}
        rotationIntensity={0.12}
        floatIntensity={0.25}
      >
        <InvoiceCard
          status={status}
          setStatus={setStatus}
        />
      </Float>

      <PaymentOrb status={status} />

      <FlowPulse status={status} />

      <ClientNode
        position={[
          -2.8,
          1.6,
          -0.5,
        ]}
        color="#86efac"
        phase={0}
      />

      <ClientNode
        position={[
          2.8,
          1.5,
          -0.8,
        ]}
        color="#4ade80"
        phase={2}
      />

      <ClientNode
        position={[
          2.6,
          -1.5,
          -0.5,
        ]}
        color="#22c55e"
        phase={4}
      />

      <FlowLines />
    </>
  );
}

/* -------------------------------------------------------
   Animated Heading
------------------------------------------------------- */

function AnimatedLine({
  children,
  delay = 0,
  className = "",
}) {
  return (
    <span
      className={`block overflow-hidden ${className}`}
    >
      <motion.span
        initial={{
          y: "115%",
          opacity: 0,
        }}
        animate={{
          y: "0%",
          opacity: 1,
        }}
        exit={{
          y: "-110%",
          opacity: 0,
        }}
        transition={{
          duration: 0.9,
          delay,
          ease,
        }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

/* -------------------------------------------------------
   Magnetic CTA
------------------------------------------------------- */

function MagneticButton({
  children,
  onClick,
}) {
  const button = useRef();

  const handleMove = (event) => {
    const rect =
      button.current?.getBoundingClientRect();

    if (!rect) return;

    const x =
      event.clientX -
      (rect.left + rect.width / 2);

    const y =
      event.clientY -
      (rect.top + rect.height / 2);

    button.current.style.transform =
      `translate(${x * 0.07}px, ${y * 0.07}px)`;
  };

  const handleLeave = () => {
    if (!button.current) return;

    button.current.style.transform =
      "translate(0px, 0px)";
  };

  return (
    <motion.button
      ref={button}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{
        scale: 0.96,
      }}
      className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#f5f7f5] px-5 py-3.5 text-sm font-semibold text-black transition-colors duration-300 hover:bg-white"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <span className="relative">
        {children}
      </span>

      <ArrowRight
        size={16}
        className="relative transition-transform duration-300 group-hover:translate-x-1"
      />
    </motion.button>
  );
}

/* -------------------------------------------------------
   Hero Copy
------------------------------------------------------- */

function HeroCopy({
  status,
  nextStatus,
  handleFlow,
}) {
  return (
    <motion.div
      variants={copyVariants}
      className="relative z-20 pt-12 lg:pt-0"
    >
      {/* Status */}

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: -18,
          scale: 0.96,
        }}
        transition={{
          duration: 0.65,
          delay: 0.15,
          ease,
        }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/[0.12] bg-emerald-400/[0.04] px-3 py-1.5 text-xs text-slate-400 backdrop-blur-xl"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
        </span>

        Your cash flow is alive
      </motion.div>

      {/* Heading */}

      <h1 className="max-w-xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl lg:text-[76px]">
        <AnimatedLine delay={0.28}>
          Your money,
        </AnimatedLine>

        <AnimatedLine
          delay={0.42}
          className="bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent"
        >
          <span className="relative">
            in motion.

            <motion.span
              animate={{
                x: [
                  "-120%",
                  "120%",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute inset-y-0 w-16 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-md"
            />
          </span>
        </AnimatedLine>
      </h1>

      {/* Description */}

      <motion.p
        initial={{
          opacity: 0,
          y: 25,
          filter: "blur(5px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        exit={{
          opacity: 0,
          y: -20,
          filter: "blur(4px)",
        }}
        transition={{
          duration: 0.8,
          delay: 0.72,
          ease,
        }}
        className="mt-7 max-w-md text-base leading-7 text-slate-400 sm:text-lg"
      >
        InvoiceAI turns invoices into a living
        payment flow. Create, send, track and
        get paid without chasing every
        transaction yourself.
      </motion.p>

      {/* Buttons */}

      <motion.div
        initial={{
          opacity: 0,
          y: 24,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -24,
        }}
        transition={{
          duration: 0.75,
          delay: 0.9,
          ease,
        }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <MagneticButton
          onClick={handleFlow}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={nextStatus}
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              {nextStatus}
            </motion.span>
          </AnimatePresence>
        </MagneticButton>

        <motion.a
          href="#how-it-works"
          whileHover={{
            y: -2,
          }}
          whileTap={{
            scale: 0.98,
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300/[0.12] bg-emerald-400/[0.025] px-5 py-3.5 text-sm text-slate-300 backdrop-blur-xl transition hover:bg-emerald-400/[0.07] hover:text-white"
        >
          Explore the flow
        </motion.a>
      </motion.div>

      {/* Interaction hint */}

      <motion.div
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
          duration: 0.6,
          delay: 1.1,
          ease,
        }}
        className="mt-7 flex items-center gap-2 text-xs text-slate-600"
      >
        <motion.span
          animate={{
            x: [0, 4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <MousePointer2 size={13} />
        </motion.span>

        Move your cursor · Click the glowing node
      </motion.div>

      {/* Live indicator */}

      <motion.div
        initial={{
          opacity: 0,
          scaleX: 0,
          transformOrigin: "left",
        }}
        animate={{
          opacity: 1,
          scaleX: 1,
        }}
        exit={{
          opacity: 0,
          scaleX: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 1.25,
          ease,
        }}
        className="mt-8 flex items-center gap-3"
      >
        <div className="h-px w-8 bg-emerald-400/20" />

        <div className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.2em] text-emerald-400/45">
          <Activity size={11} />

          LIVE PAYMENT FLOW
        </div>
      </motion.div>

      {/* State */}

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{
            opacity: 0,
            y: 8,
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
          }}
          transition={{
            duration: 0.25,
          }}
          className="mt-3 text-[10px] font-medium tracking-[0.16em] text-white/20"
        >
          FLOW STATE ·{" "}
          <span className="text-emerald-400/60">
            {status}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* -------------------------------------------------------
   Hero
------------------------------------------------------- */

export default function Hero3D() {
  const [status, setStatus] =
    useState("DRAFT");

  const sectionRef = useRef(null);

  const isInView = useInView(
    sectionRef,
    {
      amount: 0.18,
    }
  );

  const nextStatus =
    status === "DRAFT"
      ? "SEND INVOICE"
      : status === "SENT"
      ? "MARK AS PAID"
      : "RESET FLOW";

  const handleFlow = () => {
    setStatus(
      status === "DRAFT"
        ? "SENT"
        : status === "SENT"
        ? "PAID"
        : "DRAFT"
    );
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[820px] overflow-hidden bg-[#050706] pt-16"
    >
      {/* -------------------------------------------------
          Intro / Outro atmosphere
      ------------------------------------------------- */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.65,
        }}
        animate={{
          opacity: isInView ? 1 : 0,
          scale: isInView ? 1 : 0.72,
        }}
        transition={{
          duration: 1.5,
          ease,
        }}
        className="pointer-events-none absolute left-1/2 top-20 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-600/[0.08] blur-[150px]"
      />

      <motion.div
        animate={{
          opacity: isInView
            ? [0.035, 0.065, 0.035]
            : 0,
          scale: isInView
            ? [1, 1.06, 1]
            : 0.8,
        }}
        transition={{
          duration: 8,
          repeat: isInView ? Infinity : 0,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-400/[0.05] blur-[130px]"
      />

      {/* -------------------------------------------------
          Main section choreography
      ------------------------------------------------- */}

      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate={
          isInView
            ? "visible"
            : "exit"
        }
        className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8"
      >
        <div className="grid min-h-[760px] items-center gap-10 lg:grid-cols-[0.9fr_1.5fr]">

          {/* -------------------------------------------------
              Copy
          ------------------------------------------------- */}

          <HeroCopy
            status={status}
            nextStatus={nextStatus}
            handleFlow={handleFlow}
          />

          {/* -------------------------------------------------
              3D Experience
          ------------------------------------------------- */}

          <motion.div
            initial={{
              opacity: 0,
              x: 90,
              scale: 0.72,
              rotateY: 12,
            }}
            animate={{
              opacity: isInView ? 1 : 0,
              x: isInView ? 0 : -70,
              scale: isInView ? 1 : 0.76,
              rotateY: isInView ? 0 : -8,
            }}
            transition={{
              duration: 1.35,
              delay: isInView ? 0.15 : 0,
              ease,
            }}
            className="relative h-[580px] lg:h-[720px]"
          >
            <Canvas
              camera={{
                position: [
                  0,
                  0,
                  8,
                ],
                fov: 42,
              }}
              dpr={[1, 1.5]}
              gl={{
                antialias: true,
                alpha: true,
              }}
            >
              <Suspense fallback={null}>
                <Scene
                  status={status}
                  setStatus={setStatus}
                />
              </Suspense>
            </Canvas>

            {/* Flow status */}

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.85,
              }}
              animate={{
                opacity: isInView ? 1 : 0,
                y: isInView ? 0 : -20,
                scale: isInView ? 1 : 0.9,
              }}
              transition={{
                duration: 0.7,
                delay: isInView ? 1.05 : 0,
                ease,
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 w-[210px] -translate-x-1/2 translate-y-[155px] text-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.08,
                    filter: "blur(5px)",
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  className="relative rounded-full border border-emerald-300/[0.12] bg-black/40 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-slate-400 backdrop-blur-xl"
                >
                  <span className="absolute inset-0 -z-10 rounded-full bg-emerald-400/[0.04] blur-md" />

                  FLOW STATUS

                  <span
                    className={`ml-2 ${
                      status === "PAID"
                        ? "text-emerald-300"
                        : status === "SENT"
                        ? "text-green-300"
                        : "text-emerald-400"
                    }`}
                  >
                    {status}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* -------------------------------------------------
          Bottom transition into next section
      ------------------------------------------------- */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: isInView ? 1 : 0,
        }}
        transition={{
          duration: 1,
        }}
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050706] via-[#050706]/70 to-transparent"
      />

      <motion.div
        animate={{
          opacity: isInView ? 0.5 : 0,
          scaleX: isInView ? 1 : 0,
        }}
        transition={{
          duration: 1.2,
          ease,
        }}
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[70%] -translate-x-1/2 origin-center bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
      />
    </section>
  );
}