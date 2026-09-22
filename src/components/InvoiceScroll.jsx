import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function InvoiceScroll() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // =========================================================
    // SCENE
    // =========================================================

    const scene = new THREE.Scene();

    // =========================================================
    // CAMERA
    // =========================================================

    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);

    // =========================================================
    // RENDERER
    // =========================================================

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    mount.appendChild(renderer.domElement);

    // =========================================================
    // INVOICE DIMENSIONS
    // =========================================================

    const width = 6;
    const height = 8.5;

    // =========================================================
    // INVOICE CANVAS
    // =========================================================

    const canvas = document.createElement("canvas");

    canvas.width = 1200;
    canvas.height = 1700;

    const ctx = canvas.getContext("2d");

    // ---------------------------------------------------------
    // Paper
    // ---------------------------------------------------------

    ctx.fillStyle = "#f8f8f5";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // ---------------------------------------------------------
    // Header
    // ---------------------------------------------------------

    ctx.fillStyle = "#111111";
    ctx.font = "bold 82px Arial";

    ctx.fillText(
      "INVOICE",
      100,
      150
    );

    ctx.fillStyle = "#666666";
    ctx.font = "28px Arial";

    ctx.fillText(
      "INV-2048",
      100,
      210
    );

    ctx.fillText(
      "September 20, 2026",
      100,
      250
    );

    // ---------------------------------------------------------
    // Divider
    // ---------------------------------------------------------

    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(100, 310);
    ctx.lineTo(1100, 310);
    ctx.stroke();

    // ---------------------------------------------------------
    // Customer
    // ---------------------------------------------------------

    ctx.fillStyle = "#222222";
    ctx.font = "bold 26px Arial";

    ctx.fillText(
      "BILL TO",
      100,
      390
    );

    ctx.font = "30px Arial";

    ctx.fillText(
      "Acme Studio",
      100,
      440
    );

    ctx.fillStyle = "#666666";
    ctx.font = "26px Arial";

    ctx.fillText(
      "New York, NY",
      100,
      480
    );

    // ---------------------------------------------------------
    // Table
    // ---------------------------------------------------------

    ctx.fillStyle = "#222222";
    ctx.font = "bold 25px Arial";

    ctx.fillText(
      "DESCRIPTION",
      100,
      600
    );

    ctx.fillText(
      "QTY",
      780,
      600
    );

    ctx.fillText(
      "AMOUNT",
      930,
      600
    );

    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(100, 630);
    ctx.lineTo(1100, 630);
    ctx.stroke();

    ctx.fillStyle = "#333333";
    ctx.font = "28px Arial";

    ctx.fillText(
      "Website Design & Development",
      100,
      700
    );

    ctx.fillText(
      "1",
      790,
      700
    );

    ctx.fillText(
      "$12,400",
      930,
      700
    );

    ctx.fillStyle = "#666666";
    ctx.font = "24px Arial";

    ctx.fillText(
      "Responsive SaaS landing page",
      100,
      740
    );

    // ---------------------------------------------------------
    // Total
    // ---------------------------------------------------------

    ctx.strokeStyle = "#dddddd";

    ctx.beginPath();
    ctx.moveTo(700, 850);
    ctx.lineTo(1100, 850);
    ctx.stroke();

    ctx.fillStyle = "#222222";
    ctx.font = "bold 30px Arial";

    ctx.fillText(
      "TOTAL",
      700,
      920
    );

    ctx.font = "bold 52px Arial";

    ctx.fillText(
      "$12,400",
      850,
      920
    );

    // ---------------------------------------------------------
    // Payment Status
    // ---------------------------------------------------------

    ctx.fillStyle = "#e7f6ee";

    ctx.fillRect(
      100,
      1050,
      300,
      70
    );

    ctx.fillStyle = "#16794c";
    ctx.font = "bold 25px Arial";

    ctx.fillText(
      "PAYMENT PENDING",
      125,
      1095
    );

    // ---------------------------------------------------------
    // Footer
    // ---------------------------------------------------------

    ctx.fillStyle = "#888888";
    ctx.font = "22px Arial";

    ctx.fillText(
      "Thank you for your business.",
      100,
      1500
    );

    // =========================================================
    // TEXTURE
    // =========================================================

    const texture = new THREE.CanvasTexture(canvas);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    // =========================================================
    // SINGLE PHYSICAL INVOICE
    // =========================================================

    const geometry = new THREE.PlaneGeometry(
      width,
      height,
      2,
      40
    );

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const invoice = new THREE.Mesh(
      geometry,
      material
    );

    scene.add(invoice);

    // =========================================================
    // ORIGINAL VERTICES
    // =========================================================

    const position =
      geometry.attributes.position;

    const originalPositions =
      position.array.slice();

    // =========================================================
    // PHYSICAL CURL
    // =========================================================

    function applyCurl(roll) {
      for (
        let i = 0;
        i < position.count;
        i++
      ) {
        const originalX =
          originalPositions[i * 3];

        const originalY =
          originalPositions[i * 3 + 1];

        // Flat invoice
        if (roll < 0.001) {
          position.setXYZ(
            i,
            originalX,
            originalY,
            0
          );

          continue;
        }

        /*
         * 0 = top
         * 0.5 = middle
         * 1 = bottom
         */
        const t =
          (height / 2 - originalY) /
          height;

        /*
         * Higher roll = tighter curl.
         */
        const radius =
          height / roll;

        /*
         * Center the cylindrical arc.
         */
        const theta =
          roll * (t - 0.5);

        const y =
          -radius *
          Math.sin(theta);

        const z =
          radius *
          (Math.cos(theta) - 1);

        position.setXYZ(
          i,
          originalX,
          y,
          z
        );
      }

      position.needsUpdate = true;
    }

    // =========================================================
    // SECTION POSES
    // =========================================================
    //
    // These are composition-first poses.
    //
    // The invoice is intentionally pushed toward
    // negative space in most sections.
    // =========================================================

    const poses = [
      // -------------------------------------------------------
      // HERO
      // -------------------------------------------------------

      {
        id: "hero",

        x: 3.8,
        y: 0.7,
        z: -0.5,

        scale: 0.40,

        rx: -0.12,
        ry: -0.42,
        rz: 0.08,

        roll: 5.8,
      },

      // -------------------------------------------------------
      // FEATURES
      // -------------------------------------------------------

      {
        id: "features",

        x: 4.1,
        y: -0.2,
        z: -1.0,

        scale: 0.38,

        rx: 0.02,
        ry: -0.45,
        rz: 0.08,

        roll: 4.0,
      },

      // -------------------------------------------------------
      // HOW IT WORKS
      // -------------------------------------------------------

      {
        id: "how-it-works",

        x: -4.0,
        y: 0.3,
        z: -0.8,

        scale: 0.40,

        rx: -0.08,
        ry: 0.55,
        rz: -0.12,

        roll: 2.6,
      },

      // -------------------------------------------------------
      // DASHBOARD
      // -------------------------------------------------------
      //
      // Major reveal.
      //
      // Completely open.
      // -------------------------------------------------------

      {
        id: "dashboard",

        x: 0,
        y: 0,
        z: -1.2,

        scale: 0.72,

        rx: 0,
        ry: 0,
        rz: 0,

        roll: 0,
      },

      // -------------------------------------------------------
      // PRICING
      // -------------------------------------------------------

      {
        id: "pricing",

        x: -4.0,
        y: 0.6,
        z: -1.0,

        scale: 0.34,

        rx: 0.08,
        ry: 0.55,
        rz: -0.1,

        roll: 0,
      },

      // -------------------------------------------------------
      // FAQ
      // -------------------------------------------------------

      {
        id: "faq",

        x: 4.0,
        y: 0.4,
        z: -1.0,

        scale: 0.32,

        rx: -0.04,
        ry: -0.5,
        rz: 0.08,

        roll: 0,
      },

      // -------------------------------------------------------
      // CTA
      // -------------------------------------------------------

      {
        id: "cta",

        x: 3.8,
        y: -0.4,
        z: -0.8,

        scale: 0.42,

        rx: -0.06,
        ry: -0.55,
        rz: 0.1,

        roll: 0,
      },
    ];

    // =========================================================
    // SCROLL ANCHORS
    // =========================================================

    let anchors = [];

    function calculateAnchors() {
      anchors = poses.map((pose) => {
        const element =
          document.getElementById(
            pose.id
          );

        if (!element) {
          return 0;
        }

        const rect =
          element.getBoundingClientRect();

        return (
          window.scrollY +
          rect.top +
          rect.height / 2
        );
      });
    }

    calculateAnchors();

    // =========================================================
    // HELPERS
    // =========================================================

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function smoothstep(t) {
      return (
        t *
        t *
        (3 - 2 * t)
      );
    }

    // =========================================================
    // TARGET POSE
    // =========================================================

    const targetPose = {
      x: poses[0].x,
      y: poses[0].y,
      z: poses[0].z,

      scale: poses[0].scale,

      rx: poses[0].rx,
      ry: poses[0].ry,
      rz: poses[0].rz,

      roll: poses[0].roll,
    };

    // =========================================================
    // READ SCROLL POSITION
    // =========================================================

    function updateTargetFromScroll() {
      if (anchors.length < 2) {
        return;
      }

      /*
       * The center of the viewport determines
       * where we are within the page.
       */
      const scrollPoint =
        window.scrollY +
        window.innerHeight * 0.5;

      // -------------------------------------------------------
      // Before Hero
      // -------------------------------------------------------

      if (
        scrollPoint <= anchors[0]
      ) {
        Object.assign(
          targetPose,
          poses[0]
        );

        return;
      }

      // -------------------------------------------------------
      // After CTA
      // -------------------------------------------------------

      if (
        scrollPoint >=
        anchors[anchors.length - 1]
      ) {
        Object.assign(
          targetPose,
          poses[poses.length - 1]
        );

        return;
      }

      // -------------------------------------------------------
      // Find current transition
      // -------------------------------------------------------

      let index = 0;

      for (
        let i = 0;
        i < anchors.length - 1;
        i++
      ) {
        if (
          scrollPoint >= anchors[i] &&
          scrollPoint <= anchors[i + 1]
        ) {
          index = i;
          break;
        }
      }

      const start =
        anchors[index];

      const end =
        anchors[index + 1];

      const rawT =
        (scrollPoint - start) /
        Math.max(
          end - start,
          1
        );

      const t =
        smoothstep(
          THREE.MathUtils.clamp(
            rawT,
            0,
            1
          )
        );

      const current =
        poses[index];

      const next =
        poses[index + 1];

      // -------------------------------------------------------
      // Transform interpolation
      // -------------------------------------------------------

      targetPose.x =
        lerp(
          current.x,
          next.x,
          t
        );

      targetPose.y =
        lerp(
          current.y,
          next.y,
          t
        );

      targetPose.z =
        lerp(
          current.z,
          next.z,
          t
        );

      targetPose.scale =
        lerp(
          current.scale,
          next.scale,
          t
        );

      targetPose.rx =
        lerp(
          current.rx,
          next.rx,
          t
        );

      targetPose.ry =
        lerp(
          current.ry,
          next.ry,
          t
        );

      targetPose.rz =
        lerp(
          current.rz,
          next.rz,
          t
        );

      targetPose.roll =
        lerp(
          current.roll,
          next.roll,
          t
        );
    }

    // =========================================================
    // SMOOTH CURRENT POSE
    // =========================================================

    const currentPose = {
      ...targetPose,
    };

    function smoothCurrentPose() {
      const damping = 0.075;

      currentPose.x =
        lerp(
          currentPose.x,
          targetPose.x,
          damping
        );

      currentPose.y =
        lerp(
          currentPose.y,
          targetPose.y,
          damping
        );

      currentPose.z =
        lerp(
          currentPose.z,
          targetPose.z,
          damping
        );

      currentPose.scale =
        lerp(
          currentPose.scale,
          targetPose.scale,
          damping
        );

      currentPose.rx =
        lerp(
          currentPose.rx,
          targetPose.rx,
          damping
        );

      currentPose.ry =
        lerp(
          currentPose.ry,
          targetPose.ry,
          damping
        );

      currentPose.rz =
        lerp(
          currentPose.rz,
          targetPose.rz,
          damping
        );

      currentPose.roll =
        lerp(
          currentPose.roll,
          targetPose.roll,
          damping
        );
    }

    // =========================================================
    // APPLY POSE
    // =========================================================

    function applyCurrentPose() {
      invoice.position.set(
        currentPose.x,
        currentPose.y,
        currentPose.z
      );

      invoice.scale.setScalar(
        currentPose.scale
      );

      invoice.rotation.set(
        currentPose.rx,
        currentPose.ry,
        currentPose.rz
      );

      applyCurl(
        currentPose.roll
      );
    }

    // =========================================================
    // SCROLL LISTENER
    // =========================================================

    let scrollDirty = true;

    const handleScroll = () => {
      scrollDirty = true;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    // =========================================================
    // ANIMATION
    // =========================================================

    let animationFrame;

    function animate() {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      if (scrollDirty) {
        updateTargetFromScroll();
        scrollDirty = false;
      }

      smoothCurrentPose();
      applyCurrentPose();

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    // =========================================================
    // RESIZE
    // =========================================================

    const handleResize = () => {
      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );

      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          2
        )
      );

      calculateAnchors();

      scrollDirty = true;
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      geometry.dispose();
      material.dispose();
      texture.dispose();

      renderer.dispose();

      if (
        renderer.domElement.parentNode ===
        mount
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  // ===========================================================
  // 3D CANVAS LAYER
  // ===========================================================

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-10 pointer-events-none"
    />
  );
}