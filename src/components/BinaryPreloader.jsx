import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import "./binaryPreloader.css";

const STORAGE_KEY = "alkairis-binary-seen";

const MIN_DURATION = 3000; // ms the board runs before it may exit

const STAIR_COUNT = 6;
const STAIR_STAGGER_MS = 120;
const STAIR_TRANSITION_MS = 1100;
const EXIT_DURATION = (STAIR_COUNT - 1) * STAIR_STAGGER_MS + STAIR_TRANSITION_MS;

// Pachinko board (light theme)
const PIN_COLOR = "#0ea5e9";
const DIGIT_COLOR = "#0f172a";
const SVG_NS = "http://www.w3.org/2000/svg";
// Uniform small pins; sine only warps spacing, not radius.
const WAVE = { ampSpacing: 0.35, wavelength: 7, ySkew: 0.86, rowAmp: -0.35, pinRadius: 5 };
const SPAWN_INTERVAL = 25; // ms between drops
const MAX_DROPS = 500;

const { Engine, Bodies, Body, Composite } = Matter;

const BinaryPreloader = ({ isLoading = false }) => {
  const svgRef = useRef(null);
  const skipRef = useRef(false);
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* sessionStorage unavailable (privacy mode) — treat as not seen */
    }
    return !reduced && !seen;
  });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }

    document.body.style.overflow = "hidden";

    const svg = svgRef.current;
    const dim = { x: window.innerWidth, y: window.innerHeight };
    svg.setAttribute("viewBox", `0 0 ${dim.x} ${dim.y}`);

    const fontSize = dim.x < 700 ? 34 : dim.x > 1000 ? 70 : 50;
    const m = {
      margin: 1.4 * fontSize,
      sx: 2.2 * fontSize,
      sy: 1.7 * fontSize,
      top: 2.5 * fontSize,
    };

    const engine = Engine.create({ gravity: { y: 16 }, constraintIterations: 8 });

    // ── Board: sinegrid pins (uniform small) + side walls ──────────────────
    const pinG = document.createElementNS(SVG_NS, "g");
    const k = (2 * Math.PI) / (WAVE.wavelength * fontSize);
    let py = m.top, row = 0;
    while (py < dim.y) {
      const offset = row % 2 ? m.sx / 2 : 0;
      let px = m.margin + offset;
      while (px <= dim.x - m.margin) {
        const s = Math.sin(k * (px + WAVE.ySkew * py));
        Composite.add(engine.world, Bodies.circle(px, py, WAVE.pinRadius, { isStatic: true, restitution: 0.6, label: "pin" }));
        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("cx", px);
        c.setAttribute("cy", py);
        c.setAttribute("r", WAVE.pinRadius);
        c.setAttribute("fill", PIN_COLOR);
        pinG.appendChild(c);
        px += m.sx * (1 + WAVE.ampSpacing * s);
      }
      py += m.sy * (1 + WAVE.rowAmp * Math.sin(k * WAVE.ySkew * py));
      row++;
    }
    svg.appendChild(pinG);
    Composite.add(engine.world, [
      Bodies.rectangle(-50, dim.y / 2, 100, dim.y * 3, { isStatic: true }),
      Bodies.rectangle(dim.x + 50, dim.y / 2, 100, dim.y * 3, { isStatic: true }),
    ]);

    // ── Drops: "0" = ring, "1" = bar. Spawn spread across width + a tall band above ──
    const drops = [];
    const spawnDrop = () => {
      const isZero = Math.random() < 0.5;
      const spawnX = m.margin + Math.random() * (dim.x - 2 * m.margin);
      const spawnY = -fontSize - Math.random() * fontSize * 8; // tall band so they enter staggered, not one row
      let body, el;
      if (isZero) {
        const r = fontSize * 0.3;
        body = Bodies.circle(spawnX, spawnY, r, { restitution: 0.45, friction: 0.3, frictionAir: 0.0012 });
        el = document.createElementNS(SVG_NS, "circle");
        el.setAttribute("r", r);
        el.setAttribute("fill", "none");
        el.setAttribute("stroke", DIGIT_COLOR);
        el.setAttribute("stroke-width", Math.max(3, fontSize * 0.16));
      } else {
        const w = fontSize * 0.2, h = fontSize * 0.66;
        body = Bodies.rectangle(spawnX, spawnY, w, h, { restitution: 0.45, friction: 0.3, frictionAir: 0.0012 });
        el = document.createElementNS(SVG_NS, "rect");
        el.setAttribute("x", -w / 2);
        el.setAttribute("y", -h / 2);
        el.setAttribute("width", w);
        el.setAttribute("height", h);
        el.setAttribute("rx", w * 0.35);
        el.setAttribute("fill", DIGIT_COLOR);
      }
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.5, y: 1 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
      Composite.add(engine.world, body);
      svg.appendChild(el);
      drops.push({ body, el });
      while (drops.length > MAX_DROPS) {
        const old = drops.shift();
        Composite.remove(engine.world, old.body);
        old.el.remove();
      }
    };
    for (let i = 0; i < 80; i++) spawnDrop(); // initial burst
    const spawnTimer = window.setInterval(spawnDrop, SPAWN_INTERVAL);

    // ── Loop: physics + render + finish gating ─────────────────────────────
    let rafId, start = null, finished = false;
    const cullY = dim.y + 3 * fontSize;

    const finish = () => {
      if (finished) return;
      finished = true;
      setExiting(true);
      window.setTimeout(() => setVisible(false), EXIT_DURATION);
    };

    const tick = (ts) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      Engine.update(engine, 1000 / 60);

      for (let i = drops.length - 1; i >= 0; i--) {
        const { body, el } = drops[i];
        const { x, y } = body.position;
        if (y > cullY) {
          Composite.remove(engine.world, body);
          el.remove();
          drops.splice(i, 1);
          continue;
        }
        const deg = (body.angle * 180) / Math.PI;
        el.setAttribute("transform", `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${deg.toFixed(2)})`);
      }

      const canFinish = elapsed >= MIN_DURATION && !isLoadingRef.current;
      if (!skipRef.current && !canFinish) rafId = requestAnimationFrame(tick);
      else finish();
    };
    rafId = requestAnimationFrame(tick);

    const onKeyDown = (e) => {
      if (e.key === "Escape") skipRef.current = true;
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(spawnTimer);
      window.removeEventListener("keydown", onKeyDown);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      pinG.remove();
      drops.forEach((d) => d.el.remove());
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      document.documentElement.classList.remove("binary-pending");
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`binary-overlay ${exiting ? "binary-exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Site loading"
      onClick={() => {
        skipRef.current = true;
      }}
    >
      <div className="binary-stairs" aria-hidden="true">
        {Array.from({ length: STAIR_COUNT }, (_, i) => (
          <div
            key={i}
            className="binary-stair"
            style={{ transitionDelay: `${i * STAIR_STAGGER_MS}ms` }}
          />
        ))}
      </div>
      <div className="binary-scene">
        <svg ref={svgRef} className="binary-canvas" aria-hidden="true" />
      </div>
    </div>
  );
};

export default BinaryPreloader;
