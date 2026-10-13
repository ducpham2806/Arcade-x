import { supabase } from "../../services/supabaseClient";
import type { Rect, ShikakuPuzzle } from "./generator";
import { validShikakuPuzzle } from "./save";
export type DailyTicket = {
  id: string;
  owner: string;
  day: string;
  hints: number;
  puzzle: ShikakuPuzzle;
  finished: boolean;
};
export type RankEntry = {
  display_name: string;
  stars: number;
  elapsed_ms: number;
  hints: number;
};
async function rpc(name: string, args: Record<string, unknown>) {
  if (!supabase || !navigator.onLine) throw Error("offline");
  const abort = new AbortController(),
    timeout = setTimeout(() => abort.abort(), 6000);
  try {
    const { data, error } = await supabase
      .rpc(name, args)
      .abortSignal(abort.signal);
    if (error) throw error;
    return data;
  } finally {
    clearTimeout(timeout);
  }
}
async function owner() {
  if (!supabase || !navigator.onLine) throw Error("offline");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session || session.user.is_anonymous) throw Error("Sign in required");
  return session.user.id;
}
export async function startDaily(size: number): Promise<DailyTicket> {
  const id = await owner();
  const ticket = await rpc("shikaku_start", {
    p_size: size,
    p_expected_owner: id,
  });
  if (
    !ticket ||
    !validShikakuPuzzle(ticket.puzzle) ||
    typeof ticket.id !== "string"
  )
    throw Error("Invalid daily ticket");
  if ((await owner()) !== id) throw Error("Account changed");
  return { ...ticket, owner: id };
}
export async function markHint(
  ticket: string,
  expectedOwner: string,
  event: string,
): Promise<number> {
  if ((await owner()) !== expectedOwner) throw Error("Account changed");
  return rpc("shikaku_hint", {
    p_ticket: ticket,
    p_event: event,
    p_expected_owner: expectedOwner,
  });
}
export async function submitDaily(
  ticket: string,
  expectedOwner: string,
  rectangles: Rect[],
) {
  if ((await owner()) !== expectedOwner) throw Error("Account changed");
  return rpc("shikaku_submit", {
    p_ticket: ticket,
    p_rectangles: rectangles,
    p_expected_owner: expectedOwner,
  });
}
export async function readRankings(
  size: number,
  assisted: boolean,
  day: string,
): Promise<RankEntry[]> {
  const rows = await rpc("shikaku_ranking", {
    p_size: size,
    p_assisted: assisted,
    p_day: day,
  });
  if (!Array.isArray(rows)) throw Error("Unavailable ranking");
  return rows;
}

