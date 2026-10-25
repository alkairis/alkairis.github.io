import type { CSSProperties } from "react";

/** Stagger step for a `data-reveal` element (see `.js-reveal` in index.css). */
export const delay = (step: number): CSSProperties => ({ "--d": step }) as CSSProperties;

/** Sets the `--tone` channel triple a component's accent colour reads from. */
export const tone = (accent: string): CSSProperties => ({ "--tone": `var(--${accent})` }) as CSSProperties;

/** Deterministic pseudo-random in [-1, 1] — the same layout on every visit. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** Scattered start position for a chip that assembles on scroll. */
export const scatter = (i: number): CSSProperties =>
  ({
    "--sx": `${(rand(i + 1) * 46).toFixed(1)}vw`,
    "--sy": `${(rand(i + 101) * 26 + 18).toFixed(1)}vh`,
    "--sr": `${(rand(i + 211) * 40).toFixed(0)}deg`,
  }) as CSSProperties;
