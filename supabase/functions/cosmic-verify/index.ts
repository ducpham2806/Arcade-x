// Server bundle imports the SAME versioned engine/data as the browser. No score from the request is trusted.
// @ts-nocheck -- Deno runtime; checked by supabase functions serve/deploy, not the browser tsc.
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import {
  decodeReplay,
  replaySimulation,
  resultFor,
} from "../../../src/games/cosmic-defense/engine.ts";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};
Deno.serve(async (req) => {
  const response = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return response({ error: "Method not allowed" }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token) return response({ error: "Sign in required" }, 401);
    if (Number(req.headers.get("content-length") || 0) > 120000)
      return response({ error: "Request too large" }, 413);
    const text = await req.text();
    if (text.length > 120000)
      return response({ error: "Request too large" }, 413);
    const body = JSON.parse(text);
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { auth: { persistSession: false } },
    );
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser(token);
    if (
      authError ||
      !user ||
      user.is_anonymous ||
      user.id !== body.expectedOwner
    )
      return response({ error: "Account changed" }, 401);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const { data: run, error } = await admin
      .from("cosmic_runs")
      .select("*")
      .eq("id", body.ticket)
      .eq("owner_id", user.id)
      .single();
    if (error || !run) return response({ error: "Invalid ticket" }, 403);
    if (run.finished_at) return response({ verified: true, score: run.score });
    if (
      run.pack_version !== 2 ||
      Date.now() - Date.parse(run.started_at) > 86400000
    )
      return response({ error: "Ticket expired/version changed" }, 400);
    const entries = decodeReplay(body.replay),
      sim = replaySimulation(run.config, entries, body.frames);
    if (
      sim.frame !== body.frames ||
      !["won", "lost"].includes(sim.status) ||
      sim.frame < 1
    )
      return response({ error: "Incomplete replay" }, 400);
    const result = resultFor(sim);
    const { data: accepted, error: acceptError } = await admin.rpc(
      "cosmic_accept",
      {
        p_ticket: run.id,
        p_owner: user.id,
        p_frames: sim.frame,
        p_score: result.score,
        p_won: result.won,
        p_replay: body.replay,
      },
    );
    if (acceptError) return response({ error: "Result/time rejected" }, 400);
    return response(accepted);
  } catch {
    return response({ error: "Invalid replay/request" }, 400);
  }
});
