import { useEffect, useRef } from "react";
import { startSplashCursor } from "./splashCursor";
import type { SplashCursorOptions } from "./splashCursor";

/**
 * Fluid "splash cursor" trail.
 *
 * This component is only the React boundary: the simulation itself is ~1000
 * lines of vendored WebGL that lives in splashCursor.js and is started and torn
 * down through a single typed call. Splitting it that way keeps the app's typed
 * surface complete without annotating third-party shader code that has no
 * consumer-facing types to get wrong.
 *
 * Defaults are the tuned values this site ships with.
 */
export type CustomCursorProps = Partial<SplashCursorOptions>;

const DEFAULTS: SplashCursorOptions = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1440,
  CAPTURE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 2.5,
  VELOCITY_DISSIPATION: 4.5,
  PRESSURE: 0.2,
  PRESSURE_ITERATIONS: 20,
  CURL: 22,
  SPLAT_RADIUS: 0.2,
  SPLAT_FORCE: 5000,
  SHADING: true,
  COLOR_UPDATE_SPEED: 20,
  BACK_COLOR: { r: 0.5, g: 0, b: 0 },
  TRANSPARENT: true,
  RAINBOW_MODE: true,
  COLOR: "#ff0000",
};

const CustomCursor = (props: CustomCursorProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The options object is rebuilt every render, so it is deliberately not a
  // dependency — the simulation is started once and torn down on unmount, as
  // it was before. Re-running it on every render would rebuild the entire
  // WebGL pipeline.
  const optionsRef = useRef<SplashCursorOptions>({ ...DEFAULTS, ...props });
  optionsRef.current = { ...DEFAULTS, ...props };

  useEffect(() => {
    // Respect users who prefer reduced motion — skip the animated fluid entirely.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // A fluid *cursor* has no cursor to follow on a touch device: the full-screen
    // WebGL simulation would run (and drain battery) for an effect built around
    // pointer movement nobody is making. Small viewports are skipped for the
    // same reason the hero field is, and by the same test.
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
    const small = window.innerWidth < 768;
    if (reduced || coarsePointer || small) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    return startSplashCursor(canvas, optionsRef.current);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    >
      <canvas
        ref={canvasRef}
        id="fluid"
        style={{ width: "100vw", height: "100vh", display: "block" }}
      />
    </div>
  );
};

export default CustomCursor;
