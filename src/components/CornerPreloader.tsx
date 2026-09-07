import { useEffect, useRef, useState } from "react";
import { useScrollLock } from "../hooks/useScrollLock";
import "./cornerPreloader.css";

const STORAGE_KEY = "alkairis-preloader-seen";
const LOAD_TIME = 1500; // ms for the counter to fill to 100%

// Plus icon, inlined (no external CDN). Rotates 45deg -> "x" on finish.
const PlusIcon = () => (
  <svg className="pre-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

type CornerPreloaderProps = {
  /** True while app data is still in flight; holds the counter just shy of 100%. */
  isLoading?: boolean;
};

const CornerPreloader = ({ isLoading = false }: CornerPreloaderProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
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

  // Hold scroll through the shared lock for as long as the loader covers the page.
  useScrollLock(visible);

  useEffect(() => {
    if (!visible) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }

    const root = rootRef.current;
    if (!root) return;

    const q = (selector: string) => root.querySelector<HTMLElement>(selector);
    const count = q(".pre-count");
    const icon = q(".pre-icon");
    const fillLeft = q(".fill-left");
    const fillRight = q(".fill-right");
    const fillTop = q(".fill-top");
    const fillBottom = q(".fill-bottom");
    const masks = [".mask-tl", ".mask-tr", ".mask-bl", ".mask-br"].map(q);

    // Every one of these was dereferenced unguarded. They are all rendered by
    // this component so they are present in practice, but a single markup or
    // class rename would have thrown inside a requestAnimationFrame callback —
    // leaving the loader stuck on screen over a locked page, with the failure
    // buried in the console. Bail out cleanly instead.
    const [maskTl, maskTr, maskBl, maskBr] = masks;
    if (
      !count || !icon || !fillLeft || !fillRight || !fillTop || !fillBottom ||
      !maskTl || !maskTr || !maskBl || !maskBr
    ) {
      setVisible(false);
      return;
    }

    const start = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let rafId = 0;
    let finished = false;

    const openLoader = () => {
      for (const mask of [maskTl, maskTr, maskBl, maskBr]) {
        mask.style.transition = "transform 0.85s cubic-bezier(0.77, 0, 0.175, 1)";
      }
      maskTl.style.transform = "scaleY(0)";
      maskTr.style.transform = "scaleX(0)";
      maskBl.style.transform = "scaleX(0)";
      maskBr.style.transform = "scaleY(0)";
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

    const runLoader = (now: number) => {
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
    };
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
