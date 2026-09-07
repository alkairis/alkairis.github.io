// Shared UI-only types.
//
// Domain types (Project, Certificate, Experience, …) live in src/api/api.ts
// alongside the endpoints that produce them. This file is for types that
// describe how the interface behaves rather than what the backend returns —
// the vocabulary the components share with each other.

// ─── Buttons ────────────────────────────────────────────────────────────────

/** Visual weight of a button, mapped to the `.btn-*` classes in index.css. */
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'icon';

// ─── Morphing modals ────────────────────────────────────────────────────────

/**
 * How a modal enters and leaves.
 *  - scale-morph: grows out of the card that was clicked (needs an originRect)
 *  - scale:       scales up from centre
 *  - fade:        opacity only
 */
export type ModalAnimationVariant = 'scale-morph' | 'scale' | 'fade';

/** Named animation durations; resolved to milliseconds in useMorphModal. */
export type ModalSpeed = 'slow' | 'normal' | 'fast';

/**
 * The subset of a project that ProjectModal actually renders.
 *
 * Both the Projects showcase (which passes a real `Project` straight through)
 * and the Achievements section (which maps a `Recognition` onto this shape to
 * reuse the same modal) satisfy it. Declaring it explicitly is what stops the
 * two callers from drifting apart.
 */
export type ModalProject = {
  id: string;
  name: string;
  description: string;
  // Explicit `| undefined` rather than a bare `?`: callers build these objects
  // with expressions like `card.link || undefined`, and under
  // exactOptionalPropertyTypes an optional property may be absent but may not
  // be present-and-undefined unless it says so.
  image_url?: string | undefined;
  technologies?: string[] | undefined;
  github_url?: string | undefined;
  demo_url?: string | undefined;
};
