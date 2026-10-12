import type { LevelConfig, Vehicle } from "./types";
import type { Solution } from "./engine";
export function computeHint(
  config: LevelConfig,
  vehicles: Vehicle[],
): Promise<Solution> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./solver.worker.ts", import.meta.url), {
      type: "module",
    });
    const cleanup = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve({ status: "limit", moves: [], visited: 0 });
    }, 6000);
    worker.onmessage = (e) => {
      cleanup();
      resolve(e.data);
    };
    worker.onerror = () => {
      cleanup();
      reject(new Error("solver_unavailable"));
    };
    worker.postMessage({ config, vehicles });
  });
}
