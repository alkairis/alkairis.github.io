import { useEffect } from "react";

/**
 * Body-scroll lock, reference counted.
 *
 * Two separate bugs live here, both pre-existing:
 *
 * 1. It never actually locked. All three call sites set
 *    `document.body.style.overflow = "hidden"`, which only reaches the viewport
 *    when <html>'s own overflow is `visible`. index.css sets `overflow-x: hidden`
 *    on `html, body`, so <html> is the element that scrolls and body's overflow
 *    stayed a purely local property. The page scrolled behind every open modal.
 *    The lock is applied to documentElement instead.
 *
 * 2. Three components owned the flag independently — the mobile nav drawer, the
 *    morphing modals and the first-visit preloader. Each cleared it outright on
 *    close, so whichever unmounted last won: closing a modal opened from behind
 *    the drawer released a lock the drawer still needed. Counting the holders
 *    means overflow is only restored when the last one lets go.
 *
 * Removing the scrollbar reflows the page, so its width is compensated with
 * padding — without it, enabling a lock that previously did nothing would show
 * up as a horizontal jump every time a modal opens.
 */
let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";

const acquire = (): void => {
  if (lockCount === 0) {
    const root = document.documentElement;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    previousOverflow = root.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;

    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${current + scrollbarWidth}px`;
    }
  }
  lockCount += 1;
};

const release = (): void => {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.documentElement.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
    previousOverflow = "";
    previousPaddingRight = "";
  }
};

/** Locks page scroll while `locked` is true, releasing on unmount. */
export const useScrollLock = (locked: boolean): void => {
  useEffect(() => {
    if (!locked) return;
    acquire();
    return release;
  }, [locked]);
};
