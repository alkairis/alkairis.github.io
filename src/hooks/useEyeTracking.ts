import { useEffect } from "react";
import type { RefObject } from "react";

type Options = {
  /** How far (in the SVG's viewBox units) the eyes may travel from centre. */
  reach?: number;
  /** Degrees the body may lean toward the target; 0 disables the lean. */
  tilt?: number;
  /** Vertical anchor of the eyes inside the element, 0 = top, 1 = bottom. */
  eyeLine?: number;
};

const IDLE_MS = 2600;
const WANDER_MS = 1700;

/**
 * Makes a ghost look at things. Writes --ex / --ey (eye offset) and --tilt
 * (body lean) on the element, so the SVG follows without React re-rendering.
 *
 * - Mouse and pen: follows the pointer.
 * - Touch (no cursor): follows the finger while it's on the screen, glances
 *   up or down with the scroll direction.
 * - Idle for a moment: wanders, looking around on its own.
 *
 * Reduced-motion users get a still ghost looking straight ahead.
 */
export const useEyeTracking = (ref: RefObject<HTMLElement | null>, options: Options = {}) => {
  const { reach = 6.5, tilt = 9, eyeLine = 0.42 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;
    let lastInput = 0;
    let lastScrollY = window.scrollY;

    const set = (ex: number, ey: number, lean: number, near: boolean) => {
      el.style.setProperty("--ex", ex.toFixed(2));
      el.style.setProperty("--ey", ey.toFixed(2));
      el.style.setProperty("--tilt", `${lean.toFixed(2)}deg`);
      el.classList.toggle("is-near", near);
    };

    // Look at a point on screen.
    const lookAt = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * eyeLine;
      const dx = tx - cx;
      const dy = ty - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const r = Math.min(dist / 70, 1) * reach;
      set((dx / dist) * r, (dy / dist) * r, Math.max(-1, Math.min(1, dx / 500)) * tilt, dist < 150);
    };

    const target = (x: number, y: number) => {
      tx = x;
      ty = y;
      lastInput = performance.now();
      el.classList.remove("is-wandering");
      if (!frame) frame = requestAnimationFrame(lookAt);
    };

    const onPointer = (e: PointerEvent) => target(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) target(t.clientX, t.clientY);
    };

    // On a phone the most common "input" is scrolling: glance that way.
    const onScroll = () => {
      const y = window.scrollY;
      const dir = Math.sign(y - lastScrollY);
      lastScrollY = y;
      if (!dir) return;
      lastInput = performance.now();
      el.classList.remove("is-wandering");
      set(0, dir * reach * 0.85, 0, false);
    };

    // Nothing happening: look around on its own.
    const wander = window.setInterval(() => {
      if (performance.now() - lastInput < IDLE_MS || document.hidden) return;
      el.classList.add("is-wandering");
      const angle = Math.random() * Math.PI * 2;
      const r = reach * (0.45 + Math.random() * 0.55);
      set(Math.cos(angle) * r, Math.sin(angle) * r * 0.8, Math.cos(angle) * tilt * 0.4, false);
    }, WANDER_MS);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearInterval(wander);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, reach, tilt, eyeLine]);
};
