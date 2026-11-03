/** One-process P2 room host. Deploy behind TLS; room state is intentionally in RAM. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createRoomHost, guestAuthenticate } from '../../src/games/tank-clash/room.ts';
import { NET, PROTOCOL } from '../../src/games/tank-clash/protocol.ts';
import { admissionFromEnv, publicAuthConfig } from './auth.mjs';
export { supabaseAuthenticator } from './auth.mjs';
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

export async function createTankRoomServer({ port = 0, host = '127.0.0.1', allowedOrigins = [], authenticate = guestAuthenticate,
  allowReviewGuests = false, staticDirectory, publicAuth, onResult, log = () => {} } = {}) {
  const loopback = ['127.0.0.1', 'localhost', '::1'].includes(host);
  if (!loopback && !allowedOrigins.length) throw new Error('Non-loopback host needs explicit TANK_ALLOWED_ORIGINS.');
  if (!loopback && authenticate === guestAuthenticate && !allowReviewGuests) throw new Error('Non-loopback guests need explicit review mode.');
  const previewAuth = publicAuth ? publicAuthConfig(publicAuth) : null;
  const roomHost = createRoomHost({ now: () => performance.now(), authenticate, onResult, log });
  const transport = { connections: 0, open: 0, bytesIn: 0, bytesOut: 0, refusedOrigin: 0 };
  let draining = false, closing;
  const http = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://local').pathname;
    if (path === '/health' || path === '/ready') {
      const ready = !draining;
      res.writeHead(path === '/ready' && !ready ? 503 : 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ ok: true, ready, protocol: PROTOCOL, rooms: roomHost.rooms().length, transport, host: roomHost.metrics })); return;
    }
    if (staticDirectory && req.method === 'GET' && ['/', '/index.html'].includes(path)) {
      try { let html = await readFile(resolve(staticDirectory, 'index.html'), 'utf8');
        const config = JSON.stringify({ auth: previewAuth }).replace(/</g, String.fromCharCode(92) + 'u003c');
        html = html.replace('<!--TANK_CONFIG-->', `<script id="tank-public-config" type="application/json">${config}</script>`);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
          'Content-Security-Policy': `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; frame-ancestors 'self'; base-uri 'none'; form-action 'none'; connect-src 'self' ws: wss: ${previewAuth ? new URL(previewAuth.url).origin : ''}` }); res.end(html);
      } catch { res.writeHead(503); res.end('Preview has not been built.'); } return;
    }
    res.writeHead(404); res.end('Not found');
  });
  const originOk = origin => allowedOrigins.includes(origin) || loopback && (!origin || origin === 'null' || LOCAL_ORIGIN.test(origin));
  const wss = new WebSocketServer({ server: http, path: '/tank', maxPayload: NET.maxPayload, perMessageDeflate: false,
    verifyClient: ({ origin }, done) => {
      if (draining || wss.clients.size >= NET.maxConnections) { done(false, 503, 'Temporarily unavailable'); return; }
      if (originOk(origin)) done(true); else { transport.refusedOrigin++; done(false, 403, 'Origin not allowed'); }
    } });
  let nextId = 0;
  wss.on('connection', ws => {
    const id = `ws-${++nextId}`; transport.connections++; transport.open++;
    ws.on('error', () => {});
    const admissionTimer = setTimeout(() => { if (!roomHost.seated(id)) ws.close(1008, 'Admission timeout'); }, 60_000);
    roomHost.connect(id, {
      send: msg => {
        if (ws.readyState !== WebSocket.OPEN) return;
        if (ws.bufferedAmount > 64 * 1024) { ws.terminate(); return; }
        const json = JSON.stringify(msg); transport.bytesOut += Buffer.byteLength(json); ws.send(json);
      },
      close: reason => { try { ws.close(1008, String(reason).slice(0, 60)); } catch { ws.terminate(); } },
    });
    ws.on('message', (raw, isBinary) => {
      transport.bytesIn += raw.length; if (isBinary || draining) return;
      Promise.resolve(roomHost.message(id, raw.toString())).then(() => { if (roomHost.seated(id)) clearTimeout(admissionTimer); }).catch(() => {});
    });
    ws.on('close', () => { clearTimeout(admissionTimer); transport.open--; roomHost.disconnect(id); });
  });
  const timer = setInterval(() => { if (!draining) roomHost.advance(performance.now()); }, 4);
  const alive = new WeakMap();
  wss.on('connection', ws => { alive.set(ws, true); ws.on('pong', () => alive.set(ws, true)); });
  const heartbeat = setInterval(() => { for (const ws of wss.clients) { if (!alive.get(ws)) { ws.terminate(); continue; } alive.set(ws, false); if (ws.readyState === WebSocket.OPEN) ws.ping(); } }, 5000);
  try { await new Promise((done, reject) => { http.once('error', reject); http.listen(port, host, done); }); }
  catch (error) { clearInterval(timer); clearInterval(heartbeat); throw error; }
  const address = http.address();
  return { url: `ws://${host.includes(':') ? `[${host}]` : host}:${address.port}/tank`, port: address.port, roomHost, transport, wss,
    close() {
      if (closing) return closing;
      draining = true; clearInterval(timer); clearInterval(heartbeat); roomHost.shutdown();
      for (const socket of wss.clients) socket.close(1012, 'Server maintenance');
      closing = (async () => {
        const cutoff = setTimeout(() => { for (const socket of wss.clients) socket.terminate(); }, 750);
        await new Promise(r => wss.close(r)); clearTimeout(cutoff); http.closeAllConnections(); await new Promise(r => http.close(r));
      })(); return closing;
    } };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const env = process.env, authenticate = admissionFromEnv(env) || guestAuthenticate;
  const server = await createTankRoomServer({ port: Number(env.PORT ?? 3223), host: env.HOST ?? '127.0.0.1',
    allowedOrigins: (env.TANK_ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean), authenticate,
    allowReviewGuests: env.NODE_ENV !== 'production' && env.TANK_REVIEW_MODE === '1', staticDirectory: env.TANK_STATIC_DIRECTORY, publicAuth: authenticate === guestAuthenticate ? undefined : { url: env.SUPABASE_URL, publishableKey: env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY },
    onResult: r => console.log(JSON.stringify({ event: 'match.result', ...r })), log: (event, data) => console.log(JSON.stringify({ event, ...data })) });
  console.log(`Tank Clash ${PROTOCOL} ready on port ${server.port}; auth=${authenticate === guestAuthenticate ? 'review guests' : 'verified accounts'}`);
  let stopped = false; const stop = () => { if (!stopped) { stopped = true; server.close().then(() => process.exit(0)); } };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
