// Real WebSocket end-to-end for the P2 room server (loopback). Needs: npm ci --prefix server/tank-clash-room
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTankRoomServer, supabaseAuthenticator } from '../../server/tank-clash-room/server.mjs';
import { connectTankRoom } from '../../src/games/tank-clash/net-client.ts';
import { NET } from '../../src/games/tank-clash/protocol.ts';
const pause = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 3000) { const end = Date.now() + ms; while (Date.now() < end) { if (fn()) return; await pause(10); } assert.fail('timed out waiting'); }
const input = (o = {}) => ({ x: 0, y: 0, aim: 0, fire: false, shield: false, ...o });

test('two browser clients over real WebSockets: create, join, ready, play, drop and auto-resume the same seat', { timeout: 30_000 }, async () => {
  const results = [];
  const server = await createTankRoomServer({ onResult: r => results.push(r) });
  const a = connectTankRoom(server.url, { name: 'An', storage: null }), b = connectTankRoom(server.url, { name: 'Bình', storage: null });
  let ticker;
  try {
    await until(() => a.status === 'open' && b.status === 'open');
    a.session.create(); await until(() => a.session.code);
    b.session.join(a.session.code); await until(() => b.session.seat === 'b');
    a.session.ready(true); b.session.ready(true);
    await until(() => a.session.room?.phase === 'playing', NET.countdownMs + 2000);
    ticker = setInterval(() => { a.session.tick(input({ x: 1 })); b.session.tick(input({ aim: Math.PI })); }, 1000 / 60);
    const state = server.roomHost.inspect(a.session.code), x0 = state.tanks[0].x;
    await pause(400); assert.ok(state.tanks[0].x > x0 + 20, 'server moved tank a from real input');
    await until(() => a.session.view().tanks[0].x > x0 + 20);
    // Kill a's socket from the server side (like a mobile network drop); the client retries and resumes the same seat.
    const hp = state.tanks[0].hp, before = server.transport.connections;
    [...server.wss.clients][0].terminate();
    await until(() => a.status === 'reconnecting');
    await until(() => a.status === 'open' && server.transport.connections > before && a.session.room?.seats.every(seat => seat.connected), 5000);
    assert.equal(a.session.seat, 'a'); assert.equal(a.session.room.phase, 'playing');
    assert.equal(state.tanks[0].hp, hp); assert.equal(state.tanks.length, 2);
    // A second device holding the resume token takes the seat over; the old one is told and stops retrying.
    const again = connectTankRoom(server.url, { name: 'An', storage: null });
    again.session.restore({ code: a.session.code, resumeToken: a.session.resumeToken });
    await until(() => again.session.seat === 'a' && again.session.room?.phase === 'playing');
    await until(() => a.session.error?.code === 'RESUME_INVALID');
    again.session.leave(); await until(() => b.session.result?.reason === 'forfeit');
    assert.equal(b.session.result.winner, 1); await pause(20); assert.equal(results.length, 1);
    again.close();
    const health = await (await fetch(server.url.replace('ws:', 'http:').replace('/tank', '/health'))).json();
    assert.equal(health.ok, true); assert.ok(health.transport.bytesOut > 0);
  } finally { clearInterval(ticker); a.close(); b.close(); await server.close(); }
});

test('foreign origins are refused; oversized frames close the socket', { timeout: 10_000 }, async () => {
  const server = await createTankRoomServer({ allowedOrigins: ['https://arcadex.example'] });
  try {
    const WS = (await import('../../server/tank-clash-room/node_modules/ws/index.js')).default;
    const refused = await new Promise(resolve => { const ws = new WS(server.url, { origin: 'https://evil.example' }); ws.on('unexpected-response', (_q, res) => resolve(res.statusCode)); ws.on('error', () => resolve('error')); });
    assert.equal(refused, 403);
    const allowed = new WS(server.url, { origin: 'https://arcadex.example' }); await new Promise(r => allowed.on('open', r));
    const closed = new Promise(r => allowed.on('close', code => r(code))); allowed.send('x'.repeat(NET.maxPayload + 10));
    assert.equal(await closed, 1009);
  } finally { await server.close(); }
});

test('Supabase authenticator: valid token → account identity; bad token, network error and missing token → refused', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push([url, init.headers.Authorization]);
    if (init.headers.Authorization === 'Bearer good') return { ok: true, json: async () => ({ id: 'user-1', user_metadata: { display_name: 'Đức <b>' } }) };
    if (init.headers.Authorization === 'Bearer boom') throw new Error('network');
    return { ok: false, json: async () => ({}) }; };
  const auth = supabaseAuthenticator({ url: 'https://staging.example.supabase.co/', anonKey: 'anon', fetchImpl });
  assert.deepEqual(await auth('good', 'x'), { userId: 'user-1', name: 'Đức b', guest: false });
  await auth('good'); assert.equal(calls.length, 1, 'cached');
  assert.equal(calls[0][0], 'https://staging.example.supabase.co/auth/v1/user');
  assert.equal(await auth('bad'), null); assert.equal(await auth('boom'), null); assert.equal(await auth(undefined), null);
});
