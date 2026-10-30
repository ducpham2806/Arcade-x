import type { Options } from 'canvas-confetti';

/**
 * Fire-and-forget confetti that loads canvas-confetti on first use, keeping it out of the
 * launcher's first-load bundle. Same call signature as the library's default export.
 */
export default function confetti(options?: Options): void {
  void import('canvas-confetti').then(({ default: fire }) => fire(options)).catch(() => {});
}
