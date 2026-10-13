import { supabase } from "../../services/supabaseClient";
import type { Run } from "./types";
async function call(name: string, args: Record<string, unknown>) {
  if (!supabase || !navigator.onLine) throw new Error("offline");
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 6000);
  try {
    const { data, error } = await supabase
      .rpc(name, args)
      .abortSignal(controller.signal);
    if (error) throw error;
    return data;
  } finally {
    clearTimeout(timer);
  }
}
export async function startRanked(level: number, owner: string) {
  const id = await call("car_escape_start", {
    p_level: level,
    p_expected_owner: owner,
  });
  return typeof id === "string" ? id : null;
}
export async function submitRanked(run: Run, owner: string) {
  if (!run.ticket || run.legacy) throw new Error("unranked");
  return call("car_escape_submit", {
    p_run_id: run.ticket,
    p_moves: run.path,
    p_elapsed_ms: Math.floor(run.elapsedMs),
    p_hints: run.hints,
    p_expected_owner: owner,
  });
}
export type RankedEntry = {
  display_name: string;
  moves: number;
  elapsed_ms: number;
  stars: number;
  score: number;
};
export async function readRankings(
  level: number,
  assisted: boolean,
): Promise<RankedEntry[]> {
  const rows = await call("car_escape_ranking", {
    p_level: level,
    p_assisted: assisted,
  });
  if (!Array.isArray(rows)) throw new Error("unavailable");
  return rows;
}

