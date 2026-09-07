// Module augmentation for typewriter-effect.
//
// `pauseFor` is a real, documented runtime option — dist/core.js reads
// `options.pauseFor` in the autoStart loop and defaults it to 1500ms — but the
// package's shipped Options interface omits it. Declaring it here keeps the
// hero's 2000ms pause instead of dropping the option to satisfy the checker,
// which would have silently reverted it to the 1500ms default.
//
// Remove this file if the upstream types are ever corrected.
import 'typewriter-effect';

declare module 'typewriter-effect' {
  interface Options {
    /** Milliseconds to pause after a string finishes typing, before deleting. */
    pauseFor?: number;
  }
}
