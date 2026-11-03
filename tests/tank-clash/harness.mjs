// Deterministic virtual network for Tank Clash P2 tests. One virtual clock drives the room host,
// both directions of every link, and the clients. WebSocket runs on TCP, so "loss" is modelled as a
// retransmission delay with head-of-line blocking (order is always preserved), not as a dropped message.
import { createRoomHost } from '../../src/games/tank-clash/room.ts';
import { createNetSession } from '../../src/games/tank-clash/net-client.ts';

export function rng(seed = 1) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909), (s ^= s >>> 16) >>> 0) / 4294967296); }

export function createWorld({ hostOptions = {}, seed = 7 } = {}) {
  let time = 1_000_000;
  const random = rng(seed), queue = []; // [{at, order, fn}]
  let order = 0;
  const schedule = (at, fn) => { queue.push({ at, order: order++, fn }); };
  const host = createRoomHost({ now: () => time, randomBytes: n => Uint8Array.from({ length: n }, () => Math.floor(random() * 256)), ...hostOptions });
  let peerCount = 0;
  function link({ rtt = 0, jitter = 0, loss = 0 } = {}) {
    let lastDelivery = 0;
    return (bytes, fn) => {
      let delay = rtt / 2 + (jitter ? (random() * 2 - 1) * jitter : 0);
      if (loss && random() < loss) delay += Math.max(200, rtt * 1.5); // TCP retransmission (RTO floor 200 ms)
      const at = Math.max(time + Math.max(0, delay), lastDelivery); lastDelivery = at;
      schedule(at, fn);
    };
  }
  /** Attach a client (new peer id, fresh up/down links) to the host. */
  function attach(c, net) {
    const id = `peer-${++peerCount}`, up = link(net), down = link(net);
    c.id = id; c.connected = true;
    host.connect(id, { send: msg => { const json = JSON.stringify(msg); c.bytesDown += json.length;
      down(json.length, () => { if (c.connected && c.id === id) { c.inbox.push(msg); c.session.receive(JSON.parse(json)); } }); }, close: () => {} });
    c.sendRaw = msg => { const json = JSON.stringify(msg); c.bytesUp += json.length; up(json.length, () => host.message(id, json)); };
  }
  /** A client: a NetSession wired to the host through an up and a down link. */
  function client(net = {}, name = 'P', token) {
    const c = { id: '', inbox: [], bytesUp: 0, bytesDown: 0, connected: false, session: null, sendRaw: () => {} };
    c.session = createNetSession({ now: () => time, name, token: token ? () => token : undefined, send: msg => { if (c.connected) c.sendRaw(msg); } });
    attach(c, net);
    c.drop = () => { c.connected = false; host.disconnect(c.id); };
    c.last = type => [...c.inbox].reverse().find(m => m.type === type);
    return c;
  }
  /** Reconnect a dropped client's session on a fresh peer (same NetSession, new transport). */
  function reconnect(c, net = {}) { attach(c, net); return c; }
  /** Advance virtual time in 1 ms steps; the host advances every ms, clients tick on their own 60 Hz clock. */
  function run(ms, onClientTick = () => {}) {
    const end = time + ms;
    let nextTick = Math.ceil(time / (1000 / 60)) * (1000 / 60);
    while (time < end) {
      time = Math.min(end, time + 1);
      queue.sort((a, b) => a.at - b.at || a.order - b.order);
      while (queue.length && queue[0].at <= time) queue.shift().fn();
      host.advance(time);
      while (nextTick <= time) { onClientTick(); nextTick += 1000 / 60; }
    }
  }
  return { host, client, reconnect, run, get time() { return time; }, random };
}
export const press = (o = {}) => ({ x: 0, y: 0, aim: 0, fire: false, shield: false, ...o });
