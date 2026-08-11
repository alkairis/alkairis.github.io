import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import "./noiseField.css";

/**
 * Flowing water field.
 *
 * A very dense grid of small instanced cylinders whose heights follow layered
 * travelling sine waves, so the crests flow like water in a blue → cyan palette.
 *
 * Performance: the static parts of every instance matrix (x/z position, x/z
 * scale) and the per-instance colour are written once. Each frame only the two
 * values that actually change — the y-scale (wave height) and y-offset — are
 * written straight into the instanceMatrix array, skipping Object3D/matrix
 * compose and per-frame colour updates. That keeps a high block count cheap.
 *
 * Inspired by shubniggurath's noise-displaced instanced field.
 */

const TARGET_EXTENT = 30; // constant world size of the field
const FLOOR_Y = -2.2;
const WAVE_AMP = 1.1;     // shallow waves (HEIGHT at minimum)
const BLOCK_FILL = 0.55;  // block width as a fraction of the cell

function Field({ cols, rows, spacing, pointer, rotation }) {
  const meshRef = useRef(null);
  const groupRef = useRef(null);
  const tRef = useRef(0);
  const spinRef = useRef(0);
  const count = cols * rows;

  const halfX = ((cols - 1) * spacing) / 2;
  const halfZ = ((rows - 1) * spacing) / 2;
  const blockW = spacing * BLOCK_FILL;

  // Precompute each instance's base x/z position once. A small deterministic
  // jitter breaks the perfect grid so the central column doesn't alias into a
  // bright vertical line (Moiré) — and it reads more like real water.
  const base = useMemo(() => {
    const bx = new Float32Array(count);
    const bz = new Float32Array(count);
    let seed = 99991;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const jitter = spacing * 0.42;
    // Bake a yaw so no grid row/column points straight at the camera.
    const rot = 0.4;
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    let i = 0;
    for (let gz = 0; gz < rows; gz++) {
      for (let gx = 0; gx < cols; gx++) {
        const px = gx * spacing - halfX;
        const pz = gz * spacing - halfZ;
        bx[i] = px * cr - pz * sr + (rnd() - 0.5) * jitter;
        bz[i] = px * sr + pz * cr + (rnd() - 0.5) * jitter;
        i++;
      }
    }
    return { bx, bz };
  }, [cols, rows, spacing, count, halfX, halfZ]);

  // Write the static matrix components + colours once.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const arr = mesh.instanceMatrix.array;
    const cLow = new THREE.Color("#3b82f6");
    const cHigh = new THREE.Color("#7dd3fc");
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const o = i * 16;
      for (let k = 0; k < 16; k++) arr[o + k] = 0;
      arr[o + 0] = blockW;        // scale x
      arr[o + 10] = blockW;       // scale z
      arr[o + 5] = 1;             // scale y (updated per frame)
      arr[o + 12] = base.bx[i];   // pos x
      arr[o + 14] = base.bz[i];   // pos z
      arr[o + 15] = 1;

      const zt = halfZ > 0 ? (base.bz[i] + halfZ) / (2 * halfZ) : 0.5;
      tmp.copy(cLow).lerp(cHigh, 0.3 + 0.45 * zt);
      mesh.setColorAt(i, tmp);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, base, blockW, halfZ]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = (tRef.current += delta);
    const arr = mesh.instanceMatrix.array;

    const mx = pointer.current.x * halfX * 1.1;
    const mz = pointer.current.y * halfZ * 1.1;

    for (let i = 0; i < count; i++) {
      const x = base.bx[i];
      const z = base.bz[i];

      // All wave vectors are oblique (mix x & z) with incommensurate
      // frequencies, so crest ridges interfere instead of forming straight
      // axis-aligned bright/see-through lines.
      let h =
        0.5 * Math.sin(x * 0.5 + z * 0.22 + t * 1.8) +
        0.32 * Math.sin(x * -0.26 + z * 0.48 - t * 1.4) +
        0.28 * Math.sin(x * 0.33 + z * -0.4 + t * 1.55);
      h = h * 0.42 + 0.5;

      const dx = x - mx;
      const dz = z - mz;
      const bump = Math.exp(-(dx * dx + dz * dz) / 10);

      const len = h * WAVE_AMP + bump * 0.9 - FLOOR_Y;
      const o = i * 16;
      arr[o + 5] = len;                 // scale y
      arr[o + 13] = FLOOR_Y + len / 2;  // pos y
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (groupRef.current) {
      const g = groupRef.current;
      // Continuous auto-spin on the Y axis, added on top of any drag rotation.
      spinRef.current += delta * 0.4;
      g.rotation.y = THREE.MathUtils.lerp(
        g.rotation.y,
        rotation.current.y + pointer.current.x * 0.04 + spinRef.current,
        0.08
      );
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, rotation.current.x, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]}>
      <instancedMesh
        key={count}
        ref={meshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
        <meshStandardMaterial roughness={0.88} metalness={0} />
      </instancedMesh>
    </group>
  );
}

export default function NoiseInstancedField({ className, quality = "high" }) {
  const wrapRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 });
  const [inView, setInView] = useState(true);
  const [dragging, setDragging] = useState(false);

  // Dense grid, but the cheap per-frame loop keeps it light.
  const cols = quality === "low" ? 72 : 116;
  const rows = cols;
  const spacing = TARGET_EXTENT / cols;

  // Track the cursor globally for the parallax swell.
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Pause rendering when scrolled out of view.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Drag-to-pan (orbit); the canvas below stays pointer-events:none so hero
  // buttons remain clickable.
  const onPointerDown = (e) => {
    rotation.current.dragging = true;
    rotation.current.lastX = e.clientX;
    rotation.current.lastY = e.clientY;
    setDragging(true);
  };
  const onPointerMove = (e) => {
    const r = rotation.current;
    if (!r.dragging) return;
    r.y += (e.clientX - r.lastX) * 0.005;
    r.x = Math.max(-0.25, Math.min(0.55, r.x + (e.clientY - r.lastY) * 0.004));
    r.lastX = e.clientX;
    r.lastY = e.clientY;
  };
  const endDrag = () => {
    rotation.current.dragging = false;
    setDragging(false);
  };

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "auto", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      aria-hidden="true"
    >
      <div className="nf-mask">
        <Canvas
          frameloop={inView ? "always" : "never"}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 3.2, 10], fov: 46 }}
          onCreated={({ camera }) => camera.lookAt(0, -0.4, -6)}
          style={{ pointerEvents: "none" }}
        >
          <fog attach="fog" args={["#eef4ff", 8, 26]} />
          <ambientLight intensity={0.72} />
          <directionalLight position={[-7, 8, 4]} intensity={1.1} />
          <pointLight position={[8, 3, -4]} intensity={0.5} color="#6366f1" />
          <Field
            cols={cols}
            rows={rows}
            spacing={spacing}
            pointer={pointer}
            rotation={rotation}
          />
        </Canvas>
      </div>
    </div>
  );
}
