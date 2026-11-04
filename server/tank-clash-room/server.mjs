/** Tank room process; deployment configuration and local operation checks are in TC2-RUNBOOK.md. */
import { createServer } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { monitorEventLoopDelay } from 'node:perf_hooks';
import { loadServerConfig } from './config.mjs';
import { pathToFileURL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createRoomHost, guestAuthenticate } from '../../src/games/tank-clash/room.ts';
import { NET, PROTOCOL, cleanName } from '../../src/games/tank-clash/protocol.ts';

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/** Verify a Supabase access token by asking Supabase Auth who it belongs to. No service-role key needed. */
export function supabaseAuthenticator({ url, anonKey, fetchImpl = fetch, timeoutMs = 4000, allowedUserIds, requireRegistered = false, now = Date.now }) {
  const allow = allowedUserIds ? new Set(allowedUserIds) : null;
  const cache = new Map(); // token → { identity, until }; short cache so reconnect storms do not hammer Auth
  return async (token, name) => {
    if (!token) return null;
    const hit = cache.get(token); if (hit && hit.until > now()) return hit.identity;
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${url.replace(/\/$/, '')}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` }, signal: controller.signal, redirect: 'error' });
      if (!res.ok) return null;
      const user = await res.json(); if (!user?.id) return null;
      if ((requireRegistered && user.is_anonymous !== false) || (allow && !allow.has(String(user.id)))) return null;
      const meta = user.user_metadata ?? {};
      const identity = { userId: String(user.id), name: cleanName(meta.display_name ?? meta.full_name ?? meta.name ?? name), guest: user.is_anonymous === true };
      // Auth verifies the token; its exp only shortens the cache, never grants access.
      let until = now() + 60_000;
      try { const exp = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).exp; if (Number.isFinite(exp)) until = Math.min(until, exp * 1000); } catch { /* opaque test tokens have only the short TTL */ }
      if (until <= now()) return null;
      cache.set(token, { identity, until }); if (cache.size > 5000) cache.clear();
      return identity;
    } catch { return null; } finally { clearTimeout(timer); }
  };
}

export async function createTankRoomServer({ port = 0, host = '127.0.0.1', allowedOrigins = [], authenticate = guestAuthenticate, onResult, log = () => {}, guestQueue = false, allowLocalOrigins = true, allowMissingOrigin = true, maxConnections = 256, detailedHealth = true, metricsToken = '' } = {}) {
  const roomHost = createRoomHost({ now: () => performance.now(), authenticate, onResult, log, guestQueue });
  const transport = { connections: 0, open: 0, bytesIn: 0, bytesOut: 0, refusedOrigin: 0, refusedCapacity: 0 };
  const instance = randomUUID(), started = performance.now(), lag = monitorEventLoopDelay({ resolution: 20 }); lag.enable();
  let closing = false, closePromise;
  const stats = () => ({ ok: !closing, protocol: PROTOCOL, instance, uptimeSeconds: (performance.now() - started) / 1000,
    rooms: roomHost.rooms().length, queued: roomHost.queue().length, transport: { ...transport }, host: { ...roomHost.metrics },
    retained: roomHost.diagnostics(), memory: process.memoryUsage(), cpuMicros: process.cpuUsage(),
    eventLoopP95Ms: lag.percentile(95) / 1e6, listeners: wss?.listenerCount('connection') ?? 0 });
  const authorizedMetrics = req => { const given = Buffer.from(String(req.headers.authorization || '').replace(/^Bearer /, '')), expected = Buffer.from(metricsToken); return !!expected.length && given.length === expected.length && timingSafeEqual(given, expected); };
  const http = createServer((req, res) => {
    const path = String(req.url).split('?')[0];
    let status = 404, body = { ok: false };
    if (req.method !== 'GET' && req.method !== 'HEAD') status = 405;
    else if (path === '/health') { status = closing ? 503 : 200; body = detailedHealth ? stats() : { ok: !closing, protocol: PROTOCOL, instance }; }
    else if (path === '/metrics') { status = authorizedMetrics(req) ? 200 : 401; if (status === 200) body = stats(); }
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
  });
  // A file:// page sends Origin "null"; accept it only on a loopback-bound dev host (owner playtest of the HTML file).
  const loopback = ['127.0.0.1', 'localhost', '::1'].includes(host);
  const originOk = origin => allowedOrigins.includes(origin) || (allowMissingOrigin && !origin) || (allowLocalOrigins && (LOCAL_ORIGIN.test(origin) || (loopback && origin === 'null')));
  const wss = new WebSocketServer({ server: http, path: '/tank', maxPayload: NET.maxPayload, perMessageDeflate: false,
    verifyClient: ({ origin }, done) => {
      if (closing || transport.open >= maxConnections) { transport.refusedCapacity++; done(false, 503, 'Server capacity reached'); }
      else if (originOk(origin)) done(true); else { transport.refusedOrigin++; done(false, 403, 'Origin not allowed'); }
    } });
  let nextId = 0;
  wss.on('connection', ws => {
    const id = `ws-${++nextId}`; transport.connections++; transport.open++;
    ws.on('error', () => {});
    roomHost.connect(id, {
      send: msg => { if (ws.readyState !== WebSocket.OPEN) return; if (ws.bufferedAmount > 256 * 1024) { ws.terminate(); return; } // slow consumer
        const json = JSON.stringify(msg); transport.bytesOut += Buffer.byteLength(json); ws.send(json); },
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
  return { stats, url: `ws://${host.includes(':') ? `[${host}]` : host}:${address.port}/tank`, port: address.port, roomHost, transport, wss,
    close({ notify = false } = {}) {
      if (closePromise) return closePromise;
      closing = true; clearInterval(timer); clearInterval(heartbeat); lag.disable();
      closePromise = (async () => {
        for (const c of wss.clients) {
          if (notify && c.readyState === WebSocket.OPEN) { c.send(JSON.stringify({ type: 'error', code: 'ROOM_CLOSED', message: 'Máy chủ đang khởi động lại. Ván và hàng chờ trên máy chủ này không được giữ; hãy vào phòng hoặc tìm trận lại.', fatal: true })); c.close(1012, 'Server restart'); }
          else c.terminate();
        }
        const deadline = setTimeout(() => { for (const c of wss.clients) c.terminate(); }, 500); deadline.unref();
        await new Promise(r => wss.close(r)); clearTimeout(deadline);
        await new Promise(r => http.close(r));
      })();
      return closePromise;
    } };

}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let config;
  try { config = loadServerConfig(); } catch (error) { console.error(`Invalid room server configuration: ${error.message}`); process.exit(1); }
  const authenticate = config.supabaseUrl && config.publishableKey ? supabaseAuthenticator({ url: config.supabaseUrl, anonKey: config.publishableKey, allowedUserIds: config.allowedUserIds, requireRegistered: config.production }) : guestAuthenticate;
  const server = await createTankRoomServer({ ...config, authenticate, allowLocalOrigins: !config.production,
    allowMissingOrigin: !config.production, detailedHealth: !config.production,
    onResult: r => console.log(JSON.stringify({ event: 'match.result', ...r })),
    log: (event, data) => console.log(JSON.stringify({ event, ...data })) });
  console.log(`Tank Clash room server (${PROTOCOL}) on ${server.url} · auth: ${authenticate === guestAuthenticate ? 'guests (dev)' : 'Supabase'} · instance: ${server.stats().instance}`);
  const stop = () => { console.log(JSON.stringify({ event: 'server.stopping', stateLostOnRestart: true })); void server.close({ notify: true }).then(() => process.exit(0)); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
