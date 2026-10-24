import { useEffect, useRef, useState } from "react";
import { useAssistantStore } from "../stores/useAssistantStore";
import { useEyeTracking } from "../hooks/useEyeTracking";
import { GHOST_BODY } from "./GhostMark";

const HINT_KEY = "alkairis-ghost-hint";

/**
 * The floating assistant in the bottom corner. It bobs in place, leans toward
 * the pointer and follows it with its eyes; clicking it (or ⌘K / Ctrl+K)
 * opens the AI menu. Tracking writes CSS variables (see useEyeTracking), so
 * it never re-renders React.
 */
const Ghost = () => {
  const open = useAssistantStore((s) => s.open);
  const toggleMenu = useAssistantStore((s) => s.toggleMenu);
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const [hint, setHint] = useState(false);

  // Eyes + lean follow the pointer (or finger, or scroll; wander when idle).
  useEyeTracking(rootRef);

  // Introduce itself once per session, a few seconds after the page settles.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(HINT_KEY) === "1";
    } catch {
      /* storage blocked — show the hint, it's harmless */
    }
    if (seen) return;
    const show = setTimeout(() => setHint(true), 3500);
    const hide = setTimeout(() => {
      setHint(false);
      try {
        sessionStorage.setItem(HINT_KEY, "1");
      } catch {
        /* not persisted */
      }
    }, 9000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    if (open) setHint(false);
  }, [open]);

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <div className={`ghost-dock${open ? " is-open" : ""}${hint ? " show-hint" : ""}`}>
      <div className="ghost-hint" role="status">
        <strong>Ask me about Deepak</strong>
        <span className="mono">
          <kbd>{isMac ? "⌘" : "Ctrl"}</kbd>
          <kbd>K</kbd>
        </span>
      </div>

      <button
        ref={rootRef}
        type="button"
        className="ghost"
        onClick={toggleMenu}
        aria-label={open ? "Close the AI menu" : "Open the AI menu: ask about Deepak's work"}
        aria-expanded={open}
        aria-controls="ai-menu"
        aria-haspopup="dialog"
      >
        <span className="ghost-sparkles" aria-hidden="true">
          <i className="sp sp-plus sp-1" />
          <i className="sp sp-x sp-2" />
          <i className="sp sp-o sp-3" />
          <i className="sp sp-plus sp-4" />
          <i className="sp sp-x sp-5" />
          <i className="sp sp-o sp-6" />
        </span>

        <span className="ghost-float" aria-hidden="true">
          <svg className="ghost-svg" viewBox="0 0 64 72" focusable="false">
            <path d={GHOST_BODY} className="ghost-body" />
            <g className="ghost-eyes">
              <ellipse cx="24" cy="33" rx="3.4" ry="4.2" />
              <ellipse cx="40" cy="33" rx="3.4" ry="4.2" />
            </g>
            <ellipse className="ghost-mouth" cx="32" cy="43" rx="2.6" ry="2.2" />
          </svg>
        </span>

        <span className="ghost-shadow" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Ghost;
