import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./customCursor.css";

const DOT_SIZE = 6;
const RING_EASE = 0.22;
const DOT_EASE = 0.45;

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    document.body.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    const ring = ringRef.current;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { x: mouse.x, y: mouse.y };
    const ringPos = { x: mouse.x, y: mouse.y };
    let ready = false;

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!ready) {
        ready = true;
        dotPos.x = mouse.x;
        dotPos.y = mouse.y;
        ringPos.x = mouse.x;
        ringPos.y = mouse.y;
        dot.classList.add("is-ready");
        ring.classList.add("is-ready");
      }
    };
    window.addEventListener("mousemove", onMove);

    let rafId;
    const tick = () => {
      dotPos.x += (mouse.x - dotPos.x) * DOT_EASE;
      dotPos.y += (mouse.y - dotPos.y) * DOT_EASE;
      dot.style.transform = `translate3d(${dotPos.x - DOT_SIZE / 2}px, ${dotPos.y - DOT_SIZE / 2}px, 0)`;

      ringPos.x += (mouse.x - ringPos.x) * RING_EASE;
      ringPos.y += (mouse.y - ringPos.y) * RING_EASE;
      ring.style.transform = `translate3d(${ringPos.x - ring.offsetWidth / 2}px, ${ringPos.y - ring.offsetHeight / 2}px, 0)`;

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  // Portal to <body> so the cursor isn't trapped inside the app-shell's
  // stacking context and stays on top of portaled overlays (e.g. the project
  // modal), not behind them.
  return createPortal(
    <>
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
    </>,
    document.body
  );
};

export default CustomCursor;
