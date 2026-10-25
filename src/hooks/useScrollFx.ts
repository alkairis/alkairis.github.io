import { useEffect } from "react";

/**
 * Scroll-linked ("scrubbed") motion: elements move with the scrollbar rather
 * than playing a one-shot animation, so scrolling back runs them in reverse.
 *
 * Markup opts in with data attributes; this hook only writes CSS variables
 * and the stylesheet decides what they mean.
 *
 *   data-fx[="0.45"]  Enter progress. --p goes 0 → 1 as the element's top
 *                     travels from the bottom of the viewport to `range` of
 *                     the way up; --e is the same, eased.
 *   data-fx-out       Exit progress. --x goes 0 → 1 as the element scrolls
 *                     off the top (used for the hero).
 *   data-hscroll      A pinned horizontal track (see .hs in site.css). On wide,
 *                     tall-enough screens the section is made as tall as its
 *                     overflow, its stage sticks, and vertical scroll slides
 *                     the track sideways; --p drives the progress bar.
 *   data-fx-rail      Page scroll progress as --p (the right-edge rail).
 *
 * All variables have final-state fallbacks in CSS, so without JS — or with
 * reduced motion, where this does nothing — everything simply sits in place.
 */

const HSCROLL_QUERY = "(min-width: 1024px) and (min-height: 640px)";
const DEFAULT_RANGE = 0.45;

const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const useScrollFx = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("fx-on");
    const wide = window.matchMedia(HSCROLL_QUERY);

    let enter: HTMLElement[] = [];
    let exit: HTMLElement[] = [];
    let tracks: HTMLElement[] = [];
    let rails: HTMLElement[] = [];
    let frame = 0;
    let lastVh = 0;

    const collect = () => {
      enter = Array.from(document.querySelectorAll<HTMLElement>("[data-fx]"));
      exit = Array.from(document.querySelectorAll<HTMLElement>("[data-fx-out]"));
      tracks = Array.from(document.querySelectorAll<HTMLElement>("[data-hscroll]"));
      rails = Array.from(document.querySelectorAll<HTMLElement>("[data-fx-rail]"));
      measure();
    };

    // Pinned tracks need their section as tall as the sideways distance.
    const measure = () => {
      const vh = window.innerHeight;
      lastVh = vh;
      for (const hs of tracks) {
        const track = hs.querySelector<HTMLElement>(".hs-track");
        if (!track) continue;
        if (wide.matches) {
          hs.classList.add("is-pinned");
          const distance = Math.max(track.scrollWidth - window.innerWidth, 0);
          hs.dataset.distance = String(distance);
          hs.style.height = `${distance + vh}px`;
        } else {
          hs.classList.remove("is-pinned");
          hs.style.removeProperty("height");
          track.style.removeProperty("transform");
          hs.style.removeProperty("--p");
        }
      }
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      if (vh !== lastVh) measure();

      for (const el of enter) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) continue;
        const range = Number(el.dataset.fx) || DEFAULT_RANGE;
        const p = clamp((vh - rect.top) / (vh * range));
        el.style.setProperty("--p", p.toFixed(3));
        el.style.setProperty("--e", easeOut(p).toFixed(3));
      }

      for (const el of exit) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", clamp(-rect.top / Math.max(rect.height, 1)).toFixed(3));
      }

      for (const hs of tracks) {
        if (!hs.classList.contains("is-pinned")) continue;
        const track = hs.querySelector<HTMLElement>(".hs-track");
        const distance = Number(hs.dataset.distance) || 0;
        const rect = hs.getBoundingClientRect();
        const p = distance ? clamp(-rect.top / distance) : 0;
        hs.style.setProperty("--p", p.toFixed(4));
        if (track) track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px, 0, 0)`;
      }

      if (rails.length) {
        const max = root.scrollHeight - vh;
        const p = max > 0 ? clamp(window.scrollY / max) : 0;
        for (const rail of rails) rail.style.setProperty("--p", p.toFixed(4));
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    // Sections render (and grow) as API data arrives; re-collect then.
    let mutateTimer: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => {
      clearTimeout(mutateTimer);
      mutateTimer = setTimeout(() => {
        collect();
        schedule();
      }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    collect();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    wide.addEventListener("change", onResize);
    // Images and fonts change track widths after first paint.
    window.addEventListener("load", onResize);

    return () => {
      mo.disconnect();
      clearTimeout(mutateTimer);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      wide.removeEventListener("change", onResize);
      window.removeEventListener("load", onResize);
      root.classList.remove("fx-on");
      for (const hs of tracks) {
        hs.classList.remove("is-pinned");
        hs.style.removeProperty("height");
      }
    };
  }, []);
};
