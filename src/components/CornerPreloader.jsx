import { useEffect, useRef, useState } from "react";
import "./cornerPreloader.css";

const STORAGE_KEY = "alkairis-preloader-seen";
const LOAD_TIME = 1500; // ms for the counter to fill to 100%

// Plus icon, inlined (no external CDN). Rotates 45deg -> "x" on finish.
const PlusIcon = () => (
  <svg className="pre-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const CornerPreloader = ({ isLoading = false }) => {
  const rootRef = useRef(null);
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

  useEffect(() => {
    if (!visible) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }

    document.body.style.overflow = "hidden";

    const root = rootRef.current;
    const count = root.querySelector(".pre-count");
    const icon = root.querySelector(".pre-icon");
    const fillLeft = root.querySelector(".fill-left");
    const fillRight = root.querySelector(".fill-right");
    const fillTop = root.querySelector(".fill-top");
    const fillBottom = root.querySelector(".fill-bottom");
    const masks = [".mask-tl", ".mask-tr", ".mask-bl", ".mask-br"].map((s) => root.querySelector(s));

    const start = performance.now();
    const timers = [];
    let rafId, finished = false;

    const openLoader = () => {
      masks.forEach((mask) => (mask.style.transition = "transform 0.85s cubic-bezier(0.77, 0, 0.175, 1)"));
      masks[0].style.transform = "scaleY(0)"; // tl
      masks[1].style.transform = "scaleX(0)"; // tr
      masks[2].style.transform = "scaleX(0)"; // bl
      masks[3].style.transform = "scaleY(0)"; // br
      root.style.transition = "opacity 0.35s ease";
      timers.push(setTimeout(() => (root.style.opacity = "0"), 780));
      timers.push(setTimeout(() => setVisible(false), 1200));
    };

    const showIcon = () => {
      count.style.display = "none";
      icon.style.display = "block";
      icon.style.transition = "transform 0.6s ease";
      icon.style.transform = "rotate(45deg)";
    };

    const runLoader = (now) => {
      // Hold just shy of 100% while app data is still loading, then release.
      const t = (now - start) / LOAD_TIME;
      const progress = Math.min(isLoadingRef.current ? Math.min(t, 0.99) : t, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      count.textContent = Math.round(ease * 100) + "%";
      fillLeft.style.width = ease * 50 + "%";
      fillRight.style.width = ease * 50 + "%";
      fillTop.style.height = ease * 50 + "%";
      fillBottom.style.height = ease * 50 + "%";

      if (progress < 1) rafId = requestAnimationFrame(runLoader);
      else if (!finished) {
        finished = true;
        showIcon();
        timers.push(setTimeout(openLoader, 350));
      }
    };
    rafId = requestAnimationFrame(runLoader);

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={rootRef} id="preloader" className="preloader" role="status" aria-live="polite" aria-label="Site loading">
      <div className="pre-mask mask-tl" />
      <div className="pre-mask mask-tr" />
      <div className="pre-mask mask-bl" />
      <div className="pre-mask mask-br" />

      <div className="pre-lines" aria-hidden="true">
        <span className="line-v" />
        <span className="line-h" />
        <span className="fill-left" />
        <span className="fill-right" />
        <span className="fill-top" />
        <span className="fill-bottom" />
      </div>

      <div className="pre-box">
        <PlusIcon />
        <span className="pre-count">0%</span>
      </div>
    </div>
  );
};

export default CornerPreloader;
