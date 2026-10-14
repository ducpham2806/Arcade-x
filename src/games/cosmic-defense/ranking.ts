import { supabase } from "../../services/supabaseClient";
import { encodeReplay } from "./engine";
import type { CosmicSave, Mode, RunConfig } from "./types";
export async function startRanked(mode: Mode, level: number, owner: string) {
  if (!supabase || !navigator.onLine) throw new Error("offline");
  const { data, error } = await supabase
    .rpc("cosmic_start_v3", {
      p_mode: mode,
      p_level: level,
      p_expected_owner: owner,
    })
    .abortSignal(AbortSignal.timeout(6000));
  if (error) throw error;
  return data as { id: string; config: RunConfig };
}
export async function submitRanked(run: CosmicSave["pending"][number]) {
  if (!supabase || !navigator.onLine) throw new Error("offline");
  const { data, error } = await supabase.functions.invoke("cosmic-verify", {
    body: {
      ticket: run.ticket,
      expectedOwner: run.owner,
      replay: encodeReplay(run.replay),
      frames: run.frame,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (error || data?.error) throw error || new Error(data.error);
  return data;
}

