// Authoritative Chess / Xiangqi / Caro rooms. Run `npm run prepare:duel-server` to stage
// rules.ts, server.ts and their rule dependencies from src/ next to this entrypoint.
// NOT DEPLOYED: needs supabase/duel/schema.sql applied and a scheduler calling `tick`.
import { DuelRoomServer, RoomError, GAMES, type Command } from './server.ts';
import { PostgresDuelStore } from './store.ts';
declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (request: Request) => Promise<Response>): void };
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Content-Type': 'application/json' };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(typeof body === 'object' && body !== null ? { ...body, serverNow: Date.now() } : body), { status, headers });
const code = () => { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from(crypto.getRandomValues(new Uint8Array(6)), n => chars[n % chars.length]).join(''); };

export async function handle(req: Request, env: { url?: string; key?: string }, now = Date.now()): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply({ error: 'METHOD_NOT_ALLOWED' }, 405);
  try {
    const { url, key } = env;
    if (!url || !key) return reply({ error: 'SERVER_CONFIGURATION' }, 503);
    const auth = req.headers.get('Authorization') || '';
    if (!/^Bearer \S+$/.test(auth)) return reply({ error: 'UNAUTHORIZED' }, 401);
    const text = await req.text();
    if (text.length > 8192) return reply({ error: 'REQUEST_TOO_LARGE' }, 413);
    let body: any; try { body = JSON.parse(text); } catch { return reply({ error: 'INVALID_JSON' }, 400); }
    const store = new PostgresDuelStore(url, key);
    // Scheduler (pg_cron / worker) only: settle timeouts and absences.
    if (auth === `Bearer ${key}`) {
      if (body?.type !== 'tick') return reply({ error: 'SERVICE_OPERATION_ONLY' }, 403);
      return reply(await new DuelRoomServer(store).tick(now));
    }
    // Verify identity with Auth; never trust a decoded token or a UID from the body.
    const userResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: auth } });
    if (!userResponse.ok) return reply({ error: 'UNAUTHORIZED' }, 401);
    const user = await userResponse.json();
    if (!user.id || user.is_anonymous) return reply({ error: 'REGISTERED_ACCOUNT_REQUIRED' }, 403);
    if (!['create', 'join', 'snapshot', 'command'].includes(body?.type)) return reply({ error: 'BAD_REQUEST' }, 400);
    if (!(await store.takeRequest(user.id, body.type === 'snapshot' ? 'read' : 'write'))) return reply({ error: 'RATE_LIMITED' }, 429);
    const service = new DuelRoomServer(store);
    if (body.type === 'create') {
      if (typeof body.requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.requestId)) return reply({ error: 'INVALID_REQUEST_ID' }, 400);
      if (!GAMES.includes(body.game)) return reply({ error: 'BAD_GAME' }, 400);
      return reply(await service.create(user.id, body.requestId, code(), body.game, now));
    }
    if (body.type === 'join') return typeof body.code === 'string' ? reply(await service.join(user.id, body.code, now)) : reply({ error: 'BAD_CODE' }, 400);
    if (typeof body.roomId !== 'string' || body.roomId.length > 128) return reply({ error: 'INVALID_ROOM_ID' }, 400);
    if (body.type === 'snapshot') return reply(await service.snapshot(user.id, body.roomId, now));
    if (body.command && typeof body.command === 'object') return reply(await service.command(user.id, body.roomId, body.version, body.actionId, body.command as Command, now));
    return reply({ error: 'BAD_REQUEST' }, 400);
  } catch (error) {
    if (error instanceof RoomError) return reply({ error: error.code, message: error.message }, error.code === 'NOT_MEMBER' ? 403 : error.code === 'NOT_FOUND' ? 404 : 409);
    const name = error instanceof Error ? error.name : '';
    // Rule violations are client errors; keep database/internal details private.
    return name === 'RuleError'
      ? reply({ error: 'INVALID_MOVE', message: 'Nước đi không hợp lệ hoặc chưa tới lượt bạn.' }, 400)
      : reply({ error: 'SERVER_ERROR' }, 500);
  }
}

if (typeof Deno !== 'undefined') Deno.serve(req => handle(req, { url: Deno.env.get('SUPABASE_URL'), key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') }));
