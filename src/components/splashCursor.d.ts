// Typed boundary for the vendored fluid simulation in splashCursor.js.
//
// The implementation stays untyped JavaScript on purpose (see the note at the
// top of that file); this declaration is what makes it safe to call from the
// typed React wrapper.

/** Tuning parameters for the fluid simulation. */
export type SplashCursorOptions = {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  CAPTURE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLOR_UPDATE_SPEED: number;
  BACK_COLOR: { r: number; g: number; b: number };
  TRANSPARENT: boolean;
  RAINBOW_MODE: boolean;
  COLOR: string;
};

/**
 * Starts the simulation on `canvas`.
 * Returns a teardown that cancels the animation loop and removes its listeners.
 */
export function startSplashCursor(
  canvas: HTMLCanvasElement,
  options: SplashCursorOptions
): () => void;
