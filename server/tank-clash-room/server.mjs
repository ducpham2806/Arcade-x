/** Tank Clash P2 room server: WebSocket transport around src/games/tank-clash/room.ts.
 * Long-running Node process (rooms live in memory). NOT DEPLOYED: hosting is an owner decision
 * (docs/tank-clash/P2-review.md). Defaults are local-only: bind 127.0.0.1, guests allowed, localhost origins.
 *
 * Environment:
 *   PORT=3223  HOST=127.0.0.1
 *   TANK_ALLOWED_ORIGINS=https://arcadex.example,https://...   (comma list; default: localhost only)
 *   SUPABASE_URL + SUPABASE_ANON_KEY   → require a signed-in Supabase user (token checked at /auth/v1/user)
 *   TANK_ALLOW_GUESTS=1                → allow guests even when NODE_ENV=production (testing only)
 */
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createRoomHost, guestAuthenticate } from '../../src/games/tank-clash/room.ts';
import { NET, PROTOCOL, cleanName } from '../../src/games/tank-clash/protocol.ts';

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/** Verify a Supabase access token by asking Supabase Auth who it belongs to. No service-role key needed. */
export function supabaseAuthenticator({ url, anonKey, fetchImpl = fetch, timeoutMs = 4000 }) {
  const cache = new Map(); // token → { identity, until }; short cache so reconnect storms do not hammer Auth
  return async (token, name) => {
    if (!token) return null;
    const hit = cache.get(token); if (hit && hit.until > Date.now()) return hit.identity;
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${url.replace(/\/$/, '')}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` }, signal: controller.signal });
      if (!res.ok) return null;
      const user = await res.json(); if (!user?.id) return null;
      const meta = user.user_metadata ?? {};
      const identity = { userId: String(user.id), name: cleanName(meta.display_name ?? meta.full_name ?? meta.name ?? name), guest: false };
      cache.set(token, { identity, until: Date.now() + 60_000 }); if (cache.size > 5000) cache.clear();
      return identity;
    } catch { return null; } finally { clearTimeout(timer); }
  };
}

export async function createTankRoomServer({ port = 0, host = '127.0.0.1', allowedOrigins = [], authenticate = guestAuthenticate, onResult, log = () => {} } = {}) {
  const roomHost = createRoomHost({ now: () => performance.now(), authenticate, onResult, log });
  const transport = { connections: 0, open: 0, bytesIn: 0, bytesOut: 0, refusedOrigin: 0 };
  const http = createServer((req, res) => {
    const body = req.url === '/health' ? { ok: true, protocol: PROTOCOL, rooms: roomHost.rooms().length, transport, host: roomHost.metrics } : { ok: false };
    res.writeHead(req.url === '/health' ? 200 : 404, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body));
  });
  const originOk = origin => !origin || LOCAL_ORIGIN.test(origin) || allowedOrigins.includes(origin);
  const wss = new WebSocketServer({ server: http, path: '/tank', maxPayload: NET.maxPayload, perMessageDeflate: false,
    verifyClient: ({ origin }, done) => { if (originOk(origin)) done(true); else { transport.refusedOrigin++; done(false, 403, 'Origin not allowed'); } } });
  let nextId = 0;
  wss.on('connection', ws => {
    const id = `ws-${++nextId}`; transport.connections++; transport.open++;
    ws.on('error', () => {});
    roomHost.connect(id, {
      send: msg => { if (ws.readyState !== WebSocket.OPEN) return; if (ws.bufferedAmount > 256 * 1024) { ws.terminate(); return; } // slow consumer
        const json = JSON.stringify(msg); transport.bytesOut += json.length; ws.send(json); },
      close: reason => { try { ws.close(1008, String(reason).slice(0, 60)); } catch { ws.terminate(); } },
    });
    ws.on('message', (raw, isBinary) => { transport.bytesIn += raw.length; if (isBinary) return; Promise.resolve(roomHost.message(id, raw.toString())).catch(() => {}); });
    ws.on('close', () => { transport.open--; roomHost.disconnect(id); });
  });
  // Drift-free scheduler: the room host integrates real elapsed time with a fixed-step accumulator,
  // so timer jitter changes when ticks run, never how many run.
  const timer = setInterval(() => roomHost.advance(performance.now()), 4);
  // Heartbeat: terminate half-open sockets so their seat enters the hold window promptly.
  const alive = new WeakMap();
  wss.on('connection', ws => { alive.set(ws, true); ws.on('pong', () => alive.set(ws, true)); });
  const heartbeat = setInterval(() => { for (const ws of wss.clients) { if (!alive.get(ws)) { ws.terminate(); continue; } alive.set(ws, false); ws.ping(); } }, 10_000);
  await new Promise((resolve, reject) => { http.once('error', reject); http.listen(port, host, resolve); });
  const address = http.address();
  return { url: `ws://${host.includes(':') ? `[${host}]` : host}:${address.port}/tank`, port: address.port, roomHost, transport, wss,
    async close() { clearInterval(timer); clearInterval(heartbeat); for (const c of wss.clients) c.terminate(); await new Promise(r => wss.close(r)); await new Promise(r => http.close(r)); } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const env = process.env, production = env.NODE_ENV === 'production';
  let authenticate = guestAuthenticate;
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) authenticate = supabaseAuthenticator({ url: env.SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY });
  else if (production && env.TANK_ALLOW_GUESTS !== '1') { console.error('Refusing to start: production needs SUPABASE_URL and SUPABASE_ANON_KEY (or TANK_ALLOW_GUESTS=1 for a test host).'); process.exit(1); }
  const server = await createTankRoomServer({ port: Number(env.PORT ?? 3223), host: env.HOST ?? '127.0.0.1',
    allowedOrigins: (env.TANK_ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean), authenticate,
    // Results are only logged here. Persisting them (idempotent by matchId) belongs to the integration milestone.
    onResult: r => console.log(JSON.stringify({ event: 'match.result', ...r })),
    log: (event, data) => console.log(JSON.stringify({ event, ...data })) });
  console.log(`Tank Clash room server (${PROTOCOL}) on ${server.url} · auth: ${authenticate === guestAuthenticate ? 'guests (dev)' : 'Supabase'}`);
  const stop = () => server.close().then(() => process.exit(0)); process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
