/** P0 transport experiment, LOOPBACK ONLY. Not a production room or auth service. */
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { createState, step, neutral, validInput } from '../../src/games/tank-clash/engine.ts';

export async function createSpikeServer({ port = 0 } = {}) {
  const state = createState('duel'); state.tanks[1].kind = 'player';
  const seats = new Map(), metrics = { received: 0, sent: 0, rejected: 0, connections: 0, ticks: 0 };
  const http = createServer((req, res) => { res.writeHead(req.url === '/health' ? 200 : 404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ experiment: 'tank-clash.p0.v1', seats: seats.size, metrics })); });
  const wss = new WebSocketServer({ server: http, path: '/tank-spike', maxPayload: 2048, perMessageDeflate: false });
  function send(ws, data) { if (ws.readyState === WebSocket.OPEN && ws.bufferedAmount < 65536) { const json = JSON.stringify(data); metrics.sent += Buffer.byteLength(json); ws.send(json); } }
  function snapshot() { return { version: 1, tick: state.tick, status: state.status, round: state.round, scores: state.scores,
    remaining: state.remaining, tanks: state.tanks.map(({ id, x, y, hp, aim, angle, shield, shieldCooldown }) => ({ id, x, y, hp, aim, angle, shield, shieldCooldown })), bullets: state.bullets } }
  wss.on('connection', (ws, req) => {
    // Accept loopback development origins only; an absent Origin is allowed for Node smoke clients.
    if (req.headers.origin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.origin)) { ws.close(1008, 'Local experiment only'); return; }
    let seat = null, authTimer = setTimeout(() => ws.close(1008, 'Handshake timeout'), 3000);
    metrics.connections++;
    ws.on('message', raw => {
      metrics.received += raw.length;
      let msg; try { msg = JSON.parse(raw.toString()); } catch { metrics.rejected++; return; }
      if (!seat) {
        if (msg.type !== 'hello' || msg.protocol !== 'tank-clash.p0.v1') { ws.close(1008, 'Protocol mismatch'); return; }
        if (typeof msg.resumeToken === 'string') {
          const token = Buffer.from(msg.resumeToken);
          seat = [...seats.values()].find(s => token.length === s.token.length && timingSafeEqual(token, s.token) && !s.ws && Date.now() - s.lastSeen < 20000);
          if (!seat) { ws.close(1008, 'Invalid or expired resume'); return; }
        } else {
          const id = ['a', 'b'].find(id => !seats.has(id));
          if (!id) { ws.close(1008, 'Room full'); return; }
          seat = { id, token: Buffer.from(randomBytes(24).toString('hex')), ws: null, input: neutral(), seq: -1, lastInput: 0, lastSeen: Date.now(), windowAt: Date.now(), messages: 0 };
          seats.set(id, seat);
        }
        clearTimeout(authTimer); seat.ws = ws; seat.input = neutral(state.tanks.find(t => t.id === seat.id).aim); seat.lastInput = 0;
        send(ws, { type: 'welcome', id: seat.id, nextSeq: seat.seq + 1, resumeToken: seat.token.toString(), snapshot: snapshot(), walls: state.walls }); return;
      }
      const now = Date.now();
      if (now - seat.windowAt >= 1000) { seat.windowAt = now; seat.messages = 0; }
      if (++seat.messages > 90) { metrics.rejected++; return; }
      if (msg.type === 'ping' && Number.isFinite(msg.at)) { send(ws, { type: 'pong', at: msg.at, tick: state.tick }); return; }
      if (msg.type !== 'input' || !Number.isSafeInteger(msg.seq) || msg.seq <= seat.seq || !validInput(msg.input)
        || Object.keys(msg.input).some(k => !['x', 'y', 'aim', 'fire', 'shield'].includes(k))) { metrics.rejected++; return; }
      seat.seq = msg.seq; seat.input = msg.input; seat.lastInput = now;
    });
    ws.on('close', () => { clearTimeout(authTimer); if (seat?.ws === ws) { seat.ws = null; seat.lastSeen = Date.now(); seat.input = neutral(); } });
    ws.on('error', () => {});
  });
  let previousWalls = JSON.stringify(state.walls), simAccumulator = 0;
  const timer = setInterval(() => {
    const ready = ['a', 'b'].every(id => seats.has(id));
    if (!ready) return;
    const inputs = {};
    for (const [id, seat] of seats) inputs[id] = seat.ws && Date.now() - seat.lastInput < 250 ? seat.input : neutral(state.tanks.find(t => t.id === id).aim);
    // Real simulation is fixed 60 Hz, independent of the 10 Hz snapshot stream.
    step(state, inputs); metrics.ticks++; simAccumulator++;
    // A held local pulse does not repeat: future fire/shield commands require new input.
    for (const seat of seats.values()) { seat.input = { ...seat.input, fire: false, shield: false }; }
    if (simAccumulator % 6 === 0) {
      const walls = JSON.stringify(state.walls), msg = { type: 'snapshot', ...snapshot(), ...(walls !== previousWalls ? { walls: state.walls } : {}) };
      previousWalls = walls; for (const seat of seats.values()) if (seat.ws) send(seat.ws, msg);
    }
  }, 1000 / 60);
  await new Promise((resolve, reject) => { http.once('error', reject); http.listen(port, '127.0.0.1', resolve); });
  return { url: `ws://127.0.0.1:${http.address().port}/tank-spike`, state, metrics,
    async close() { clearInterval(timer); for (const client of wss.clients) client.terminate(); await new Promise(resolve => wss.close(resolve)); await new Promise(resolve => http.close(resolve)); } };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = await createSpikeServer({ port: 3222 }); console.log(`LOCAL P0 spike: ${server.url}`);
  const close = () => server.close().then(() => process.exit(0)); process.on('SIGINT', close); process.on('SIGTERM', close);
}
