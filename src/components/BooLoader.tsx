import { useEffect, useState } from "react";
import { GHOST_BODY } from "./GhostMark";

const LINES = ["Summoning an answer", "Haunting his work history", "Asking the spirits (and the LLM)", "Almost there"];
const LINE_MS = 1900;

/**
 * The answer's preloader: the ghost puffs up, lunges with a "BOO!", and
 * settles, on a loop, while the status line drifts through a few phrases.
 */
const BooLoader = () => {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLine((i) => Math.min(i + 1, LINES.length - 1)), LINE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="boo" role="status" aria-label="The ghost is thinking">
      <div className="boo-stage" aria-hidden="true">
        <span className="boo-bubble">BOO!</span>
        <svg className="boo-ghost" viewBox="0 0 64 72" focusable="false">
          <path d={GHOST_BODY} className="ghost-body" />
          <g className="boo-eyes">
            <ellipse cx="24" cy="33" rx="3.4" ry="4.2" />
            <ellipse cx="40" cy="33" rx="3.4" ry="4.2" />
          </g>
          <ellipse className="boo-mouth" cx="32" cy="45.5" rx="4.4" ry="5.2" />
        </svg>
        <span className="boo-shadow" />
      </div>
      <p className="boo-text mono" aria-hidden="true">
        <span key={line} className="boo-line">
          {LINES[line]}
        </span>
        <span className="dots">
          <i />
          <i />
          <i />
        </span>
      </p>
    </div>
  );
};

export default BooLoader;
