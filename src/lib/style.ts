import type { CSSProperties } from "react";

/** Stagger step for a `data-reveal` element (see `.js-reveal` in index.css). */
export const delay = (step: number): CSSProperties => ({ "--d": step }) as CSSProperties;

/** Sets the `--tone` channel triple a component's accent colour reads from. */
export const tone = (accent: string): CSSProperties => ({ "--tone": `var(--${accent})` }) as CSSProperties;
