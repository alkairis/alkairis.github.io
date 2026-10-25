import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

const MIN_THUMB = 40; // px — matches the CSS min-height on the thumb

const thumbHeight = () => {
  const vh = window.innerHeight;
  return Math.max(MIN_THUMB, (vh / document.documentElement.scrollHeight) * vh);
};

/** Scroll so the thumb's top sits at `y` px from the top of the viewport. */
const scrollToThumb = (y: number) => {
  const vh = window.innerHeight;
  const travel = vh - thumbHeight();
  const max = document.documentElement.scrollHeight - vh;
  const p = travel > 0 ? Math.min(Math.max(y / travel, 0), 1) : 0;
  window.scrollTo({ top: p * max, behavior: "instant" });
};

/**
 * The page's scrollbar. The browser's own is hidden while this is active
 * (see .fx-on in scroll-fx.css), so it has to work like one: drag the thumb,
 * or press anywhere on the track to jump there. Position and size come from
 * useScrollFx (--p, --t); keyboard and wheel scrolling are untouched.
 */
const ScrollRail = () => {
  const dragOffset = useRef<number | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const thumb = e.currentTarget.querySelector("i");
    const rect = thumb?.getBoundingClientRect();
    const onThumb = rect && e.clientY >= rect.top && e.clientY <= rect.bottom;
    // On the thumb: keep the grab point. On the track: centre the thumb there.
    dragOffset.current = onThumb && rect ? e.clientY - rect.top : thumbHeight() / 2;
    scrollToThumb(e.clientY - dragOffset.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add("is-dragging");
    e.preventDefault();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragOffset.current === null) return;
    scrollToThumb(e.clientY - dragOffset.current);
  };

  const end = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragOffset.current = null;
    e.currentTarget.classList.remove("is-dragging");
  };

  return (
    <div
      className="scroll-rail"
      data-fx-rail
      aria-hidden="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <i />
    </div>
  );
};

export default ScrollRail;
