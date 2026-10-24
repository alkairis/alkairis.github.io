import { useEffect, useRef, useState } from "react";
import { profile } from "../content/profile";
import { useEyeTracking } from "../hooks/useEyeTracking";
import { useScrollLock } from "../hooks/useScrollLock";
import { GHOST_BODY } from "./GhostMark";
import "./preloader.css";

const SEEN_KEY = "alkairis-preloader-seen";
const CHUNKS = 24;
const MIN_MS = 1500; // long enough to read the name, short enough not to annoy
const MAX_MS = 3200; // never hold the page hostage to a slow font or API

/** First visit of the session, motion allowed. Mirrors the boot script in index.html. */
const shouldShow = (): boolean => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return true;
  }
};

type Phase = "loading" | "leaving" | "done";

/**
 * Opening screen, once per session: name, role, and the ghost inside a glowing
 * orb, over a row of 24 "chunks" that light up as the page gets ready — a
 * nod to retrieval. When fonts are in and a minimum beat has passed, the
 * whole screen collapses into the corner where the floating ghost lives.
 */
const Preloader = () => {
  const [phase, setPhase] = useState<Phase>(() => (shouldShow() ? "loading" : "done"));
  const [lit, setLit] = useState(0);
  const orbRef = useRef<HTMLDivElement | null>(null);

  useScrollLock(phase !== "done");
  useEyeTracking(orbRef, { reach: 6, tilt: 6, eyeLine: 0.48 });

  // Light the chunks over MIN_MS, then wait for fonts (capped) before leaving.
  useEffect(() => {
    if (phase !== "loading") return;
    const started = performance.now();
    let raf = 0;
    let ready = false;
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;

    const fonts = document.fonts?.ready ?? Promise.resolve();
    void fonts.then(() => {
      ready = true;
    });

    const tick = () => {
      const t = performance.now() - started;
      // Ease-out fill: quick at first, settling into the last few chunks.
      const progress = Math.min(t / MIN_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 2.2);
      setLit(Math.round(eased * CHUNKS));
      if ((progress >= 1 && ready) || t >= MAX_MS) {
        setLit(CHUNKS);
        leaveTimer = setTimeout(() => setPhase("leaving"), 260);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [phase]);

  // Exit animation runs in CSS; unmount once it's over.
  useEffect(() => {
    if (phase !== "leaving") return;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* not persisted — it will just play again next visit */
    }
    document.documentElement.classList.remove("preloading");
    const t = setTimeout(() => setPhase("done"), 900);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className={`pl${phase === "leaving" ? " is-leaving" : ""}`} role="status" aria-label="Loading the portfolio">
      <div className="pl-inner">
        <div ref={orbRef} className="pl-orb" aria-hidden="true">
          <span className="pl-ring" />
          <svg className="pl-ghost ghost-svg" viewBox="0 0 64 72" focusable="false">
            <path d={GHOST_BODY} className="ghost-body" />
            <g className="ghost-eyes">
              <ellipse cx="24" cy="33" rx="3.4" ry="4.2" />
              <ellipse cx="40" cy="33" rx="3.4" ry="4.2" />
            </g>
          </svg>
        </div>

        <p className="pl-name">
          {profile.name.split(" ").map((word, i) => (
            <span key={word} style={{ animationDelay: `${120 + i * 90}ms` }}>
              {word}
            </span>
          ))}
        </p>
        <p className="pl-role">
          {profile.role} · <span className="serif">Generative AI</span>
        </p>

        <div className="pl-meter" aria-hidden="true">
          {Array.from({ length: CHUNKS }, (_, i) => (
            <i key={i} className={i < lit ? "is-lit" : undefined} />
          ))}
        </div>
        <p className="pl-status mono" aria-hidden="true">
          retrieving context · {String(lit).padStart(2, "0")}/{CHUNKS} chunks
        </p>
      </div>
    </div>
  );
};

export default Preloader;
