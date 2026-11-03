/** Tank Clash P2 client netcode. Transport-agnostic core (`createNetSession`) plus a thin browser
 * WebSocket wrapper (`connectTankRoom`).
 *
 * - Own tank: predicted locally with the same `driveTank` rules as the server, reconciled on every
 *   snapshot by replaying inputs the server has not acknowledged yet. Visible corrections are blended out.
 * - Other tank: interpolated between snapshots ~100 ms in the past, never extrapolated more than one interval.
 * - HP, bullets, rounds and results always come from the server.
 */
import { CONFIG, driveTank, neutral, tank as makeTank } from './engine.ts';
import type { Input, State, Tank, Wall, GameEvent } from './engine.ts';
import { NET, PROTOCOL, SNAPSHOT_INTERVAL_MS, quantizeInput } from './protocol.ts';
import type { ClientMessage, ErrorCode, MatchResult, RoomView, SeatId, ServerMessage, Snapshot, TankSnap } from './protocol.ts';

export type NetStats = { snapshots: number; teleports: number; phaseCorrections: number; corrections: number; maxCorrection: number; totalCorrection: number; rtt: number | null; pendingMax: number; sentInputs: number };
export type SessionOptions = { send: (msg: ClientMessage) => void; now: () => number; name?: string; token?: () => string | undefined;
  onChange?: (kind: ServerMessage['type']) => void };
const TICK_MS = 1000 / CONFIG.hz;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

export function createNetSession(options: SessionOptions) {
  const { send, now } = options;
  let code: string | null = null, seat: SeatId | null = null, resumeToken: string | null = null, nextSeq = 0;
  let room: RoomView | null = null, result: MatchResult | null = null, matchId: string | null = null;
  let error: { code: ErrorCode; message: string; fatal: boolean } | null = null;
  let walls: Wall[] = [], latest: Snapshot | null = null;
  let buffer: { snap: Snapshot; at: number }[] = [];
  let pending: { seq: number; input: Input }[] = [], outbox: Input[] = [], outboxSeq = 0;
  let predicted: Tank | null = null, offset = { x: 0, y: 0 }, lastAim = 0, clockOffset: number | null = null;
  // Visual smoothing for remote tanks: rendered position chases the interpolated target at a capped speed,
  // so a stalled-then-bursting TCP stream (loss) never shows as a teleport. Gameplay is unaffected (server-side).
  const shown = new Map<string, { x: number; y: number; round: number }>(); let lastViewAt: number | null = null;
  const events = new Map<number, GameEvent>();
  const stats: NetStats = { snapshots: 0, teleports: 0, phaseCorrections: 0, corrections: 0, maxCorrection: 0, totalCorrection: 0, rtt: null, pendingMax: 0, sentInputs: 0 };
  const world = (): State => ({ version: 1, mode: 'duel', online: true, tick: latest?.tick ?? 0, time: 0, width: CONFIG.width, height: CONFIG.height, out: [], tanks: [], walls, bullets: [], events: [], nextId: 0,
    status: latest?.status ?? 'playing', round: latest?.round ?? 1, scores: latest?.scores ?? [0, 0], remaining: latest?.remaining ?? CONFIG.roundSeconds,
    phaseTime: 0, winner: latest?.winner ?? null, roundWinner: latest?.roundWinner ?? null, lesson: 0, lessonDone: false, stats: { shots: 0, hits: 0, ricochets: 0, blocks: 0, bricks: 0 } });
  const toTank = (t: TankSnap): Tank => ({ ...makeTank(t.id, t.id === 'a' ? 0 : 1, t.x, t.y, 'player'), ...t });
  const playingNow = () => room?.phase === 'playing' && latest?.status === 'playing';

  /** Rebuild the own tank from the authoritative snapshot and replay unacknowledged inputs on top. */
  function reconcile(snap: Snapshot) {
    pending = pending.filter(p => p.seq > snap.ack);
    const mine = snap.tanks.find(t => t.id === seat); if (!mine) { predicted = null; return; }
    const before = predicted ? { x: predicted.x, y: predicted.y } : null;
    const w = world(); const own = toTank(mine);
    w.tanks = [own, ...snap.tanks.filter(t => t.id !== seat).map(toTank)];
    if (snap.status === 'playing') for (const p of pending) driveTank(w, own, p.input);
    predicted = own;
    if (before) {
      const dx = before.x - own.x, dy = before.y - own.y, error = Math.hypot(dx, dy);
      // Teleports (round reset, big desync) snap immediately; small errors are blended over a few frames.
      if (error >= 48) { stats.teleports++; offset = { x: 0, y: 0 }; }
      else if (snap.status !== 'playing' || mine.hp <= 0) { offset.x += dx; offset.y += dy; if (error > 0.5) stats.phaseCorrections++; } // round end/death rewinds the last RTT
      else { offset.x += dx; offset.y += dy; if (error > 0.5) { stats.corrections++; stats.totalCorrection += error; stats.maxCorrection = Math.max(stats.maxCorrection, error); } }
    }
  }
  function onSnapshot(snap: Snapshot) {
    const at = now(); stats.snapshots++;
    if (snap.walls) walls = snap.walls;
    for (const e of snap.events) events.set(e.id, e);
    if (events.size > 80) for (const id of [...events.keys()].slice(0, events.size - 80)) events.delete(id);
    // Server-tick clock estimate: follow the freshest arrival, drift slowly toward later ones.
    const sample = snap.tick - at / TICK_MS;
    clockOffset = clockOffset === null || sample > clockOffset ? sample : clockOffset + (sample - clockOffset) * 0.02;
    if (latest && snap.tick < latest.tick) return; // stale reordering cannot happen on TCP, but stay safe
    latest = snap; buffer.push({ snap, at }); if (buffer.length > 30) buffer.splice(0, buffer.length - 30);
    reconcile(snap);
  }
  function reset() { latest = null; buffer = []; pending = []; outbox = []; predicted = null; offset = { x: 0, y: 0 }; events.clear(); shown.clear(); }
  function flush() {
    if (!outbox.length) return;
    send({ type: 'input', seq: outboxSeq, inputs: outbox }); stats.sentInputs += outbox.length; outbox = [];
  }

  const api = {
    stats,
    get code() { return code; }, get seat() { return seat; }, get room() { return room; }, get result() { return result; },
    get error() { return error; }, get matchId() { return matchId; }, get resumeToken() { return resumeToken; }, get pendingCount() { return pending.length; },
    create(name = options.name) { error = null; send({ type: 'create', protocol: PROTOCOL, name, token: options.token?.() }); },
    join(roomCode: string, name = options.name) { error = null; send({ type: 'join', protocol: PROTOCOL, code: roomCode, name, token: options.token?.() }); },
    /** Re-attach to the previous seat after a dropped connection. */
    resume() { if (code && resumeToken) send({ type: 'resume', protocol: PROTOCOL, code, resumeToken, token: options.token?.() }); },
    restore(saved: { code: string; resumeToken: string }) { code = saved.code; resumeToken = saved.resumeToken; },
    ready(value: boolean) { send({ type: 'ready', ready: value }); },
    leave() { send({ type: 'leave' }); },
    ping() { send({ type: 'ping', at: now() }); },
    receive(msg: ServerMessage) {
      switch (msg.type) {
        case 'joined':
          code = msg.code; seat = msg.seat; resumeToken = msg.resumeToken; nextSeq = msg.nextSeq; room = msg.room; result = msg.room.result; error = null;
          reset(); if (msg.walls) walls = msg.walls; if (msg.snapshot) { matchId = msg.room.matchId; onSnapshot(msg.snapshot); }
          break;
        case 'room': room = msg.room; if (msg.room.phase !== 'finished') result = msg.room.result; break;
        case 'start': matchId = msg.matchId; result = null; reset(); walls = msg.walls; onSnapshot(msg.snapshot); break;
        case 'snapshot': onSnapshot(msg.snapshot); break;
        case 'result': result = msg.result; room = msg.room; pending = []; outbox = []; break;
        case 'pong': { const rtt = now() - msg.at; stats.rtt = stats.rtt === null ? rtt : stats.rtt * 0.8 + rtt * 0.2; break; }
        case 'error': error = { code: msg.code, message: msg.message, fatal: msg.fatal };
          if (msg.code === 'RESUME_INVALID' || msg.code === 'ROOM_CLOSED' || msg.code === 'ROOM_NOT_FOUND') { code = seat = resumeToken = null; room = null; reset(); }
          break;
        case 'left': code = seat = resumeToken = null; room = null; result = null; reset(); break;
      }
      options.onChange?.(msg.type);
    },
    /** One fixed 60 Hz client tick. Sends intents in small batches; predicts movement only. */
    tick(raw: Input) {
      if (!playingNow() || !seat) { flush(); return; }
      const input = quantizeInput(raw); lastAim = input.aim;
      const seq = nextSeq++;
      if (!outbox.length) outboxSeq = seq;
      outbox.push(input); pending.push({ seq, input }); stats.pendingMax = Math.max(stats.pendingMax, pending.length);
      if (pending.length > 240) pending.shift(); // ~4 s without acks: stop growing; reconcile resyncs
      if (predicted && predicted.hp > 0) {
        const w = world(); w.tanks = [predicted, ...(latest?.tanks.filter(t => t.id !== seat).map(toTank) ?? [])];
        driveTank(w, predicted, input);
      }
      if (outbox.length >= 2) flush();
    },
    flush,
    /** Estimated current server tick. */
    serverTick(at = now()) { return clockOffset === null ? latest?.tick ?? 0 : at / TICK_MS + clockOffset; },
    /** A render-ready, State-shaped view: predicted own tank, interpolated opponent, server bullets/HP. */
    view(at = now()): State | null {
      if (!latest) return null;
      const w = world(), present = api.serverTick(at), renderTick = present - NET.interpolationMs / TICK_MS;
      const frameMs = lastViewAt === null ? 0 : Math.max(0, Math.min(10_000, at - lastViewAt)); lastViewAt = at;
      // Blend correction offset out (~100 ms half-life). Repeated calls at the same instant change nothing.
      const decay = Math.pow(0.5, frameMs / 100); offset.x *= decay; offset.y *= decay;
      let a = buffer[0], b = buffer[buffer.length - 1];
      for (let i = buffer.length - 1; i > 0; i--) if (buffer[i - 1].snap.tick <= renderTick) { a = buffer[i - 1]; b = buffer[i]; break; }
      // Never interpolate across a round reset: the new round starts from spawn positions at once.
      if (a.snap.round !== latest.round || b.snap.round !== latest.round) { a = b = buffer[buffer.length - 1]; }
      const span = b.snap.tick - a.snap.tick, t = span > 0 ? Math.max(0, Math.min(1, (renderTick - a.snap.tick) / span)) : 1;
      w.tanks = latest.tanks.map(snap => {
        if (snap.id === seat && predicted && latest!.status === 'playing') {
          return { ...toTank(snap), x: predicted.x + offset.x, y: predicted.y + offset.y, angle: predicted.angle, aim: snap.hp > 0 ? lastAim || predicted.aim : snap.aim };
        }
        const pa = a.snap.tanks.find(x => x.id === snap.id) ?? snap, pb = b.snap.tanks.find(x => x.id === snap.id) ?? snap;
        let x = lerp(pa.x, pb.x, t), y = lerp(pa.y, pb.y, t);
        // Starved (renderTick past the newest snapshot): extrapolate from the last velocity for at most 150 ms.
        const prev = buffer.length > 1 ? buffer[buffer.length - 2].snap : null;
        if (renderTick > latest!.tick && prev && prev.round === latest!.round && snap.hp > 0) {
          const pp = prev.tanks.find(q => q.id === snap.id), dt = latest!.tick - prev.tick, ahead = Math.min(renderTick - latest!.tick, 150 / TICK_MS);
          if (pp && dt > 0) { x = snap.x + (snap.x - pp.x) / dt * ahead; y = snap.y + (snap.y - pp.y) / dt * ahead; }
        }
        const old = shown.get(snap.id), maxStep = CONFIG.speed / 1000 * frameMs * 2;
        if (old && old.round === latest!.round && snap.hp > 0) {
          const dx = x - old.x, dy = y - old.y, d = Math.hypot(dx, dy);
          if (d < 120 && d > maxStep) { x = old.x + dx / d * maxStep; y = old.y + dy / d * maxStep; }
        }
        shown.set(snap.id, { x, y, round: latest!.round });
        return { ...toTank(snap), x, y, angle: lerpAngle(pa.angle, pb.angle, t), aim: lerpAngle(pa.aim, pb.aim, t) };
      });
      if (seat === 'b') w.tanks.reverse(); // runtime treats tanks[0] as "you"
      const ahead = Math.max(0, Math.min(SNAPSHOT_INTERVAL_MS / TICK_MS * 2, present - latest.tick)) / CONFIG.hz;
      w.bullets = latest.bullets.map(bl => ({ ...bl, owner: bl.team ? 'b' : 'a', age: 0, x: bl.x + bl.vx * ahead, y: bl.y + bl.vy * ahead }))
        .filter(bl => bl.x >= 0 && bl.y >= 0 && bl.x <= w.width && bl.y <= w.height);
      w.events = [...events.values()]; w.time = present / CONFIG.hz; w.tick = latest.tick;
      return w;
    },
    neutral: () => neutral(lastAim),
  };
  return api;
}
export type NetSession = ReturnType<typeof createNetSession>;

/** Browser wrapper: one WebSocket, auto-resume within the seat hold window, pings every second. */
export function connectTankRoom(url: string, options: { name?: string; token?: () => string | undefined; onChange?: (kind: string) => void; storage?: Storage | null }) {
  let ws: WebSocket | null = null, closed = false, retry = 0, queue: ClientMessage[] = [];
  let retryTimer: ReturnType<typeof setTimeout> | undefined, pingTimer: ReturnType<typeof setInterval> | undefined;
  const store = options.storage === undefined ? (() => { try { return sessionStorage; } catch { return null; } })() : options.storage;
  const session = createNetSession({ now: () => performance.now(), name: options.name, token: options.token,
    send: msg => { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg)); else if (msg.type !== 'input' && msg.type !== 'ping') queue.push(msg); },
    onChange: kind => {
      try { if (session.code && session.resumeToken) store?.setItem('tank-clash.seat', JSON.stringify({ code: session.code, resumeToken: session.resumeToken })); else if (kind === 'left' || kind === 'error') store?.removeItem('tank-clash.seat'); } catch { /* storage optional */ }
      options.onChange?.(kind);
    } });
  try { const saved = JSON.parse(store?.getItem('tank-clash.seat') ?? 'null'); if (saved?.code && saved?.resumeToken) session.restore(saved); } catch { /* ignore */ }
  let status: 'connecting' | 'open' | 'reconnecting' | 'closed' = 'connecting';
  function open() {
    clearTimeout(retryTimer); status = retry ? 'reconnecting' : 'connecting'; options.onChange?.('status');
    const socket = new WebSocket(url); ws = socket;
    socket.onopen = () => {
      retry = 0; status = 'open'; options.onChange?.('status');
      const wasSeated = !!(session.code && session.resumeToken);
      const waiting = queue; queue = [];
      if (wasSeated && !waiting.some(m => m.type === 'create' || m.type === 'join')) session.resume();
      for (const m of waiting) socket.send(JSON.stringify(m));
      clearInterval(pingTimer); pingTimer = setInterval(() => session.ping(), 1000);
    };
    socket.onmessage = e => { try { session.receive(JSON.parse(String(e.data))); } catch { /* malformed server frame */ } };
    socket.onclose = () => {
      clearInterval(pingTimer); if (ws !== socket) return; ws = null;
      if (closed) { status = 'closed'; options.onChange?.('status'); return; }
      const fatal = session.error?.fatal && session.error.code !== 'RESUME_INVALID';
      if (fatal) { status = 'closed'; options.onChange?.('status'); return; }
      // Retry inside the 20 s hold window: 0.5, 1, 2, 4, 4, 4 ... seconds.
      status = 'reconnecting'; options.onChange?.('status');
      retryTimer = setTimeout(open, Math.min(4000, 500 * 2 ** retry++));
    };
    socket.onerror = () => {};
  }
  open();
  return { session, get status() { return status; },
    close() { closed = true; clearTimeout(retryTimer); clearInterval(pingTimer); try { ws?.close(); } catch { /* ignore */ } ws = null; } };
}
