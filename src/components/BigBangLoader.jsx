import { useEffect, useRef, useState } from "react";
import "./bigbang.css";

const MIN_DURATION = 2800;
const EXPLOSION_START = 380;
const SETTLE_START = 1700;
const STORAGE_KEY = "alkairis-bigbang-seen";

const STAIR_COUNT = 6;
const STAIR_STAGGER_MS = 120;
const STAIR_TRANSITION_MS = 1100;
const EXIT_DURATION = (STAIR_COUNT - 1) * STAIR_STAGGER_MS + STAIR_TRANSITION_MS;

const PARTICLE_COLORS = ["#ffffff", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#818cf8", "#6366f1"];

const BigBangLoader = ({ isLoading = false }) => {
  const canvasRef = useRef(null);
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

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particleCount = window.innerWidth < 640 ? 160 : 300;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      angle: Math.random() * Math.PI * 2,
      speed: Math.pow(Math.random(), 2.2) * 5.5 + 0.4,
      dist: 0,
      size: Math.random() * 1.7 + 0.6,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleRate: Math.random() * 0.003 + 0.0012,
      isBit: i % 7 === 0,
      bitChar: Math.random() < 0.5 ? "0" : "1",
      x: 0,
      y: 0,
      life: 0,
    }));

    let rafId;
    let start = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setExiting(true);
      window.setTimeout(() => setVisible(false), EXIT_DURATION);
    };

    const draw = (ts) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "rgba(3, 6, 16, 0.34)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed < EXPLOSION_START) {
        const t = elapsed / EXPLOSION_START;
        const r = 2 + t * 14;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4);
        glow.addColorStop(0, "rgba(255,255,255,0.95)");
        glow.addColorStop(0.3, "rgba(125,211,252,0.55)");
        glow.addColorStop(1, "rgba(99,102,241,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      } else {
        const sinceExplosion = elapsed - EXPLOSION_START;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        const ringRadius = sinceExplosion * 0.65;
        const ringAlpha = Math.max(0, 0.5 - sinceExplosion / 2600);
        if (ringAlpha > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(125,211,252,${ringAlpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        const maxDist = Math.max(w, h) * 0.62;
        const isSettling = elapsed > SETTLE_START;

        const active = [];
        for (const p of particles) {
          p.speed *= 0.988;
          p.dist += p.speed * 3.2;

          const x = cx + Math.cos(p.angle) * p.dist;
          const y = cy + Math.sin(p.angle) * p.dist * 0.86;
          const lifeFade = Math.max(0, 1 - p.dist / maxDist);
          if (lifeFade <= 0.02) continue;

          p.x = x;
          p.y = y;
          p.life = lifeFade;
          active.push(p);
        }

        if (isSettling) {
          const linkable = active.filter((p) => p.dist > 60);
          const linkDist = 70;
          const linkDistSq = linkDist * linkDist;
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = "rgba(125,211,252,0.5)";
          ctx.lineWidth = 0.6;
          for (let i = 0; i < linkable.length; i++) {
            const a = linkable[i];
            for (let j = i + 1; j < linkable.length; j++) {
              const b = linkable[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const dSq = dx * dx + dy * dy;
              if (dSq >= linkDistSq) continue;
              const alpha = (1 - dSq / linkDistSq) * Math.min(a.life, b.life) * 0.4;
              if (alpha <= 0.02) continue;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
          ctx.globalCompositeOperation = "lighter";
        }

        for (const p of active) {
          const twinkle = isSettling
            ? Math.sin(elapsed * p.twinkleRate + p.twinklePhase) * 0.3 + 0.7
            : 1;

          ctx.globalAlpha = p.life * twinkle;
          if (p.isBit) {
            ctx.font = `${Math.max(9, p.size * 6)}px "JetBrains Mono", monospace`;
            ctx.fillStyle = p.color;
            ctx.fillText(p.bitChar, p.x - 3, p.y + 3);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        const flashAlpha = Math.max(0, 1 - sinceExplosion / 260) * 0.8;
        if (flashAlpha > 0) {
          ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      const canFinish = elapsed >= MIN_DURATION && !isLoadingRef.current;

      if (!skipRef.current && !canFinish) {
        rafId = requestAnimationFrame(draw);
      } else {
        finish();
      }
    };

    rafId = requestAnimationFrame(draw);

    const onKeyDown = (e) => {
      if (e.key === "Escape") skipRef.current = true;
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      document.documentElement.classList.remove("bigbang-pending");
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`bigbang-overlay ${exiting ? "bigbang-exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Site loading"
      onClick={() => {
        skipRef.current = true;
      }}
    >
      <div className="bigbang-stairs" aria-hidden="true">
        {Array.from({ length: STAIR_COUNT }, (_, i) => (
          <div
            key={i}
            className="bigbang-stair"
            style={{ transitionDelay: `${i * STAIR_STAGGER_MS}ms` }}
          />
        ))}
      </div>
      <div className="bigbang-scene">
        <canvas ref={canvasRef} className="bigbang-canvas" aria-hidden="true" />
        <div className="bigbang-content">
          <span className="bigbang-logo font-brand">ALKAIRIS</span>
        </div>
      </div>
    </div>
  );
};

export default BigBangLoader;
