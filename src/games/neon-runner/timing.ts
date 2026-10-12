/** Bound catch-up work and keep simulation at 60 steps/s regardless of display Hz. */
export function createFixedTicker() {
  let previous: number | null = null, remaining = 0;
  const step = 1000 / 60;
  return {
    advance(time: number, active = true) {
      const delta = previous === null ? 0 : Math.max(0, Math.min(time - previous, 100));
      previous = time;
      if (!active) { remaining = 0; return 0; }
      remaining += delta;
      const steps = Math.floor((remaining + 1e-7) / step);
      remaining = Math.max(0, remaining - steps * step);
      return steps;
    },
  };
}
