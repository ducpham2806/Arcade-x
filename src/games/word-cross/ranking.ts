import { supabase } from "../../services/supabaseClient";
import type { Puzzle, Run } from "./types";
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
export async function startRanked(
  level: number,
  owner: string,
  daily = false,
): Promise<{ id: string; puzzle: Puzzle; daily: string | null }> {
  return call("word_cross_start", {
    p_level: level,
    p_expected_owner: owner,
    p_daily: daily,
  });
}
export async function submitRanked(run: Run, owner: string) {
  return call("word_cross_submit", {
    p_run_id: run.ticket,
    p_attempts: run.attempts,
    p_elapsed_ms: Math.floor(run.elapsedMs),
    p_hints: run.hints,
    p_expected_owner: owner,
  });
}
export type RankEntry = {
  display_name: string;
  score: number;
  stars: number;
  elapsed_ms: number;
  levels?: number;
};
export async function readRankings(
  kind: "campaign" | "level" | "daily",
  level: number,
  assisted: boolean,
): Promise<RankEntry[]> {
  const rows = await call("word_cross_ranking", {
    p_kind: kind,
    p_level: level,
    p_assisted: assisted,
  });
  if (!Array.isArray(rows)) throw new Error("unavailable");
  return rows;
}

