import { decodeReplay, replaySimulation, resultFor, MAX_FRAMES } from "../../../src/games/cosmic-defense/engine.ts";
import type { RunConfig } from "../../../src/games/cosmic-defense/types.ts";

// Only the authenticated database ticket supplies configuration and rule version.
export function verifyReplay(run: {
  pack_version: number; config: RunConfig; started_at: string;
}, replay: unknown, frames: unknown, now = Date.now()) {
  const started = Date.parse(run.started_at);
  if (![2, 3].includes(run.pack_version) || run.config?.version !== run.pack_version)
    throw new Error("Ticket version mismatch");
  if (!Number.isFinite(started) || started > now || now - started > 86400000)
    throw new Error("Ticket expired");
  if (typeof frames !== "number" || !Number.isInteger(frames) || frames < 1 || frames > MAX_FRAMES ||
      frames > (now - started) / 1000 * 60 + 120)
    throw new Error("Invalid replay time");
  if (typeof replay !== "string" || replay.length > 100000)
    throw new Error("Invalid replay size");
  const sim = replaySimulation(run.config, decodeReplay(replay), frames);
  if (sim.frame !== frames || !["won", "lost"].includes(sim.status))
    throw new Error("Incomplete replay");
  return { sim, result: resultFor(sim) };
}
