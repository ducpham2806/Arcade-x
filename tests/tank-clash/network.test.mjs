import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSpikeServer } from '../../server/tank-clash-spike/server.mjs';
import { neutral } from '../../src/games/tank-clash/engine.ts';
const pause = ms => new Promise(r => setTimeout(r, ms));
async function connect(url, resumeToken) {
  const ws = new WebSocket(url), messages = [];
  ws.addEventListener('message', e => messages.push(JSON.parse(e.data)));
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  ws.send(JSON.stringify({ type: 'hello', protocol: 'tank-clash.p0.v1', ...(resumeToken ? { resumeToken } : {}) }));
  for (let i = 0; i < 50 && !messages.some(m => m.type === 'welcome'); i++) await pause(10);
  const welcome = messages.find(m => m.type === 'welcome'); assert.ok(welcome, 'handshake completed'); return { ws, messages, welcome };
}
test('two independent WebSocket clients converge; input is authoritative; reconnect retains the same seat and HP', { timeout: 12000 }, async () => {
  const server = await createSpikeServer(); let a, b, resumed;
  const started = performance.now();
  try {
    a = await connect(server.url); b = await connect(server.url);
    assert.equal(a.welcome.id, 'a'); assert.equal(b.welcome.id, 'b');
    const initial = server.state.tanks[0].x;
    a.ws.send(JSON.stringify({ type: 'input', seq: 0, input: { ...neutral(), x: 1 } }));
    await pause(190); assert.ok(server.state.tanks[0].x > initial);
    a.ws.send(JSON.stringify({ type: 'input', seq: 0, input: { ...neutral(), x: -1 } })); // duplicate seq
    a.ws.send(JSON.stringify({ type: 'input', seq: 1, input: { ...neutral(), position: { x: 9999, y: 0 } } }));
    a.ws.send(JSON.stringify({ type: 'input', seq: 2, input: { ...neutral(), x: 500 } }));
    await pause(150); assert.ok(server.metrics.rejected >= 3);
    const stoppedAt = server.state.tanks[0].x; await pause(300); assert.equal(server.state.tanks[0].x, stoppedAt, 'stale input becomes neutral');
    const aa = a.messages.filter(m => m.type === 'snapshot'), bb = b.messages.filter(m => m.type === 'snapshot');
    const sharedTick = aa.map(m => m.tick).find(t => bb.some(m => m.tick === t)); assert.ok(sharedTick);
    assert.deepEqual(aa.find(m => m.tick === sharedTick), bb.find(m => m.tick === sharedTick));
    server.state.tanks[0].hp = 2;
    a.ws.close(); await pause(100); resumed = await connect(server.url, a.welcome.resumeToken);
    assert.equal(resumed.welcome.id, 'a'); assert.equal(resumed.welcome.snapshot.tanks[0].hp, 2); assert.equal(server.state.tanks.length, 2);
    const before = server.state.tanks[0].y;
    resumed.ws.send(JSON.stringify({ type: 'input', seq: resumed.welcome.nextSeq, input: { ...neutral(), y: 1 } }));
    await pause(100); assert.ok(server.state.tanks[0].y > before, 'reconnected client can resume input with the acknowledged sequence');
    const pingAt = performance.now(); resumed.ws.send(JSON.stringify({ type: 'ping', at: pingAt }));
    for (let i = 0; i < 40 && !resumed.messages.some(m => m.type === 'pong'); i++) await pause(5);
    assert.ok(resumed.messages.some(m => m.type === 'pong'));
    const seconds = (performance.now() - started) / 1000;
    console.log(JSON.stringify({ experiment: 'P0 loopback only', seconds: +seconds.toFixed(2), snapshotsA: aa.length, snapshotsB: bb.length,
      bytesSentAllClients: server.metrics.sent, bytesReceivedAllClients: server.metrics.received, rejectedInputs: server.metrics.rejected,
      estimatedOutboundKBpsPerClient: +(server.metrics.sent / seconds / 2 / 1024).toFixed(2), pingObservationMs: +(performance.now() - pingAt).toFixed(2) }));
  } finally { a?.ws.close(); b?.ws.close(); resumed?.ws.close(); await server.close(); }
});
