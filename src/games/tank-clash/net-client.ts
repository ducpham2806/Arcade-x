/** Tank Clash P2 client netcode. Transport-agnostic core (`createNetSession`) plus a thin browser
 * WebSocket wrapper (`connectTankRoom`).
 *
 * - Own tank: predicted locally with the same `driveTank` rules as the server, reconciled on every
 *   snapshot by replaying inputs the server has not acknowledged yet. Visible corrections are blended out.
 * - Other tank: interpolated between snapshots ~100 ms in the past, never extrapolated more than one interval.
 * - HP, bullets, rounds and results always come from the server.
 */
import { accountEndpoint, tankEndpoint } from './access.ts';
import { CONFIG, driveTank, neutral, tank as makeTank } from './engine.ts';
import type { Input, State, Tank, Wall, GameEvent } from './engine.ts';
import { NET, PROTOCOL, SNAPSHOT_INTERVAL_MS, quantizeInput } from './protocol.ts';
import type { ClientMessage, ErrorCode, MatchResult, RoomView, SeatId, ServerMessage, Snapshot, TankSnap } from './protocol.ts';

export type NetStats = { snapshots: number; teleports: number; phaseCorrections: number; corrections: number; maxCorrection: number; totalCorrection: number; rtt: number | null; pendingMax: number; sentInputs: number };
export type SessionOptions = { send: (msg: ClientMessage) => void; now: () => number; name?: string; token?: () => string | undefined;
  onChange?: (kind: ServerMessage['type'] | 'stalled') => void };
const TICK_MS = 1000 / CONFIG.hz;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

export function createNetSession(options: SessionOptions) {
  const { send, now } = options;
  let code: string | null = null, seat: SeatId | null = null, resumeToken: string | null = null, nextSeq = 0;
  let transportOnline = true;
  const commands = new Map<string, { message: Extract<ClientMessage, { type: 'ready' | 'leave' }>; at: number; created: number }>();
  const opId = () => Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
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
  const world = (): State => ({ version: 1, mode: 'duel', online: true, tick: latest?.tick ?? 0, time: 0, tanks: [], walls, bullets: [], events: [], nextId: 0,
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
    if (!matchId || snap.epoch !== `${matchId}:${snap.round}` || latest && (snap.tick <= latest.tick || snap.round < latest.round)) return;
    const at = now(); stats.snapshots++;
    if (latest && latest.epoch !== snap.epoch) {
      pending = []; outbox = []; buffer = []; offset = { x: 0, y: 0 }; predicted = null; shown.clear();
    }
    if (snap.walls) walls = snap.walls;
    for (const e of snap.events) events.set(e.id, e);
    if (events.size > 80) for (const id of [...events.keys()].slice(0, events.size - 80)) events.delete(id);
    // Server-tick clock estimate: follow the freshest arrival, drift slowly toward later ones.
    const sample = snap.tick - at / TICK_MS;
    clockOffset = clockOffset === null || sample > clockOffset ? sample : clockOffset + (sample - clockOffset) * 0.02;
    latest = snap; buffer.push({ snap, at }); if (buffer.length > 30) buffer.splice(0, buffer.length - 30);
    reconcile(snap);
  }
  function reset() { clockOffset = null; lastViewAt = null; latest = null; buffer = []; pending = []; outbox = []; predicted = null; offset = { x: 0, y: 0 }; events.clear(); shown.clear(); }
  function flush() {
    if (!outbox.length) return;
    send({ type: 'input', epoch: latest!.epoch, seq: outboxSeq, inputs: outbox }); stats.sentInputs += outbox.length; outbox = [];
  }

  function control(message: Extract<ClientMessage, { type: 'ready' | 'leave' }>) {
    if (commands.size >= 8) return;
    commands.set(message.opId, { message, at: now(), created: now() }); send(message);
  }
  const api = {
    stats,
    get epoch() { return latest?.epoch ?? null; },
    get pendingControlCount() { return commands.size; },
    get code() { return code; }, get seat() { return seat; }, get room() { return room; }, get result() { return result; },
    get error() { return error; }, get matchId() { return matchId; }, get resumeToken() { return resumeToken; }, get pendingCount() { return pending.length; },
    create(name = options.name) { error = null; send({ type: 'create', protocol: PROTOCOL, name, token: options.token?.() }); },
    join(roomCode: string, name = options.name) { error = null; send({ type: 'join', protocol: PROTOCOL, code: roomCode, name, token: options.token?.() }); },
    /** Re-attach to the previous seat after a dropped connection. */
    resume() { if (code && resumeToken) send({ type: 'resume', protocol: PROTOCOL, code, resumeToken, token: options.token?.() }); },
    restore(saved: { code: string; resumeToken: string }) { code = saved.code; resumeToken = saved.resumeToken; },
    ready(value: boolean) { control({ type: 'ready', ready: value, opId: opId(), context: room?.matchId ?? null }); },
    leave() { control({ type: 'leave', opId: opId() }); },
    ping() { send({ type: 'ping', at: now() }); },
    suspend() { transportOnline = false; pending = []; outbox = []; },
    connectionError(message: string, code: ErrorCode = 'CONNECTION_TIMEOUT') {
      error = { code, message, fatal: true }; commands.clear(); transportOnline = false; options.onChange?.('error');
    },
    retryControls() {
      if (!transportOnline) return;
      for (const [id, c] of commands) {
        if (now() - c.created > 10_000) { commands.delete(id); error = { code: 'CONNECTION_TIMEOUT', message: 'Thao tác phòng hết thời gian chờ.', fatal: false }; options.onChange?.('error'); }
        else if (now() - c.at > 600) { c.at = now(); send(c.message); }
      }
    },
    receive(msg: ServerMessage) {
      switch (msg.type) {
        case 'joined':
          transportOnline = true; matchId = msg.room.matchId;
          code = msg.code; seat = msg.seat; resumeToken = msg.resumeToken; nextSeq = msg.nextSeq; room = msg.room; result = msg.room.result; error = null;
          reset(); if (msg.walls) walls = msg.walls; if (msg.snapshot) { matchId = msg.room.matchId; onSnapshot(msg.snapshot); }
          break;
        case 'room': room = msg.room; if (msg.room.phase !== 'finished') result = msg.room.result; break;
        case 'start':
          if (msg.snapshot.epoch !== `${msg.matchId}:${msg.snapshot.round}`) break;
          if (matchId === msg.matchId && latest) { onSnapshot(msg.snapshot); break; }
          // A new match only starts from its countdown. A duplicate/late start must not rewind it.
          if (room?.phase !== 'countdown') break;
          matchId = msg.matchId; result = null; reset(); walls = msg.walls; onSnapshot(msg.snapshot); break;
        case 'snapshot': onSnapshot(msg.snapshot); break;
        case 'result': if (msg.result.matchId !== matchId) break; result = msg.result; room = msg.room; pending = []; outbox = []; break;
        case 'ack': commands.delete(msg.opId); if (msg.error) error = { code: msg.error, message: 'Thao tác không còn hợp lệ với phòng.', fatal: false }; break;
        case 'shutdown': api.connectionError('Máy chủ đang bảo trì. Trận đang chơi đã được hủy.', 'SERVER_RESTART'); code = seat = resumeToken = null; break;
        case 'pong': { const rtt = now() - msg.at; stats.rtt = stats.rtt === null ? rtt : stats.rtt * 0.8 + rtt * 0.2; break; }
        case 'error': error = { code: msg.code, message: msg.message, fatal: msg.fatal };
          if (msg.code === 'RESUME_INVALID' || msg.code === 'ROOM_CLOSED' || msg.code === 'ROOM_NOT_FOUND') { code = seat = resumeToken = null; room = null; reset(); }
          break;
        case 'left': commands.clear(); code = seat = resumeToken = null; room = null; result = null; reset(); break;
      }
      options.onChange?.(msg.type);
    },
    /** One fixed 60 Hz client tick. Sends intents in small batches; predicts movement only. */
    tick(raw: Input) {
      if (!transportOnline) return;
      if (!playingNow() || !seat) { flush(); return; }
      const input = quantizeInput(raw); lastAim = input.aim;
      const seq = nextSeq++;
      if (!outbox.length) outboxSeq = seq;
      outbox.push(input); pending.push({ seq, input }); stats.pendingMax = Math.max(stats.pendingMax, pending.length);
      if (pending.length >= NET.maxPendingInputs) { api.suspend(); options.onChange?.('stalled'); return; }
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
        .filter(bl => bl.x >= 0 && bl.y >= 0 && bl.x <= CONFIG.width && bl.y <= CONFIG.height);
      w.events = [...events.values()]; w.time = present / CONFIG.hz; w.tick = latest.tick;
      return w;
    },
    neutral: () => neutral(lastAim),
  };
  return api;
}
export type NetSession = ReturnType<typeof createNetSession>;

/** Browser transport: endpoint-bound resume, fresh account token per admission, bounded retries/queues. */
export type TankConnectionOptions = { name?: string; token?: () => string | undefined | Promise<string | undefined>;
  trustedServerUrl?: string; onChange?: (kind: string) => void; storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
  socketFactory?: (url: string) => WebSocket; now?: () => number };
export function connectTankRoom(url: string, options: TankConnectionOptions) {
  const endpoint = options.token ? accountEndpoint(url, options.trustedServerUrl) : tankEndpoint(url);
  const now = options.now ?? (() => performance.now());
  const store = options.storage === undefined ? (() => { try { return sessionStorage; } catch { return null; } })() : options.storage;
  const key = 'tank-clash.seat:v2';
  let ws: WebSocket | null = null, stopped = false, generation = 0, retry = 0, retryAt = Infinity;
  let openedAt = now(), heardAt = now(), pingAt = 0, lostAt: number | null = null;
  let admission: Extract<ClientMessage, { type: 'create' | 'join' | 'resume' }> | null = null, authenticating = false, authAt = 0;
  let status: 'connecting' | 'open' | 'reconnecting' | 'closed' = 'connecting';
  const notify = () => options.onChange?.('status');
  const forget = () => { try { store?.removeItem(key); } catch {} };
  const write = (message: ClientMessage) => {
    if (!ws || ws.readyState !== 1) return false;
    if (ws.bufferedAmount > 64 * 1024) { drop(); return false; }
    ws.send(JSON.stringify(message)); return true;
  };
  const session = createNetSession({ now, name: options.name,
    send: msg => {
      if (msg.type === 'create' || msg.type === 'join' || msg.type === 'resume') {
        if (authenticating) return;
        const clean = { ...msg }; delete clean.token; admission = clean;
        if (status === 'open') void admit();
      } else { if (msg.type === 'leave') forget(); if (status === 'open' && !authenticating) write(msg); } // never queue movement while disconnected
    },
    onChange: kind => {
      if (kind === 'stalled') { drop(); return; }
      try {
        if (session.code && session.resumeToken) store?.setItem(key, JSON.stringify({ protocol: PROTOCOL, endpoint, code: session.code, resumeToken: session.resumeToken }));
        else if (kind === 'left' || kind === 'error' || kind === 'shutdown') forget();
      } catch {}
      if (kind === 'joined') { retry = 0; lostAt = null; }
      options.onChange?.(kind);
    } });
  try { const saved = JSON.parse(store?.getItem(key) ?? 'null');
    if (saved?.protocol === PROTOCOL && saved.endpoint === endpoint && /^[A-Z2-9]{6}$/.test(saved.code) && /^[a-f0-9]{48}$/.test(saved.resumeToken)) session.restore(saved);
  } catch {}
  function terminal(message: string, code: ErrorCode = 'CONNECTION_TIMEOUT') {
    if (stopped) return; stopped = true; status = 'closed'; generation++; clearInterval(timer);
    const socket = ws; ws = null; admission = null; authenticating = false; forget(); socket?.close();
    session.connectionError(message, code); notify();
  }
  function drop() {
    if (stopped) return;
    const socket = ws; ws = null; generation++; authenticating = false; admission = null; session.suspend(); socket?.close();
    if (!session.code || !session.resumeToken) { terminal('Không kết nối được máy chủ phòng. Hãy kiểm tra địa chỉ rồi thử lại.'); return; }
    lostAt ??= now(); status = 'reconnecting';
    const backoff = Math.min(3000, 250 * 2 ** retry++); retryAt = now() + backoff + Math.random() * backoff * .3; notify();
  }
  async function admit() {
    if (authenticating || !admission || !ws || ws.readyState !== 1 || stopped) return;
    const message = admission, socket = ws, current = generation; admission = null; authenticating = true; authAt = now();
    try {
      const token = await options.token?.();
      if (stopped || current !== generation || ws !== socket) return;
      if (options.token && !token) throw new Error('Đăng nhập Arcade-X để vào phòng thử.');
      write({ ...message, ...(token ? { token } : {}) });
    } catch (error) { if (current === generation) terminal(error instanceof Error ? error.message : 'Không lấy được phiên đăng nhập.', 'AUTH_FAILED'); }
    finally { if (current === generation) authenticating = false; }
  }
  function open() {
    openedAt = heardAt = now(); const current = ++generation;
    try {
      const socket = options.socketFactory?.(endpoint) ?? new WebSocket(endpoint); ws = socket;
      socket.onopen = () => {
        if (ws !== socket || stopped || current !== generation) return;
        status = 'open'; heardAt = now(); notify();
        if (session.code && session.resumeToken) session.resume(); else void admit();
      };
      socket.onmessage = event => {
        if (ws !== socket || stopped || current !== generation) return;
        heardAt = now();
        try {
          const message = JSON.parse(String(event.data)) as ServerMessage; session.receive(message);
          if (message.type === 'shutdown' || message.type === 'error' && (message.fatal || ['RESUME_INVALID', 'ROOM_CLOSED', 'ROOM_NOT_FOUND'].includes(message.code)))
            terminal(message.type === 'shutdown' ? 'Máy chủ đang bảo trì. Trận đang chơi đã được hủy.' : message.message, message.type === 'shutdown' ? 'SERVER_RESTART' : message.code);
        } catch { /* Ignore malformed messages, heartbeat deadline still applies. */ }
      };
      socket.onclose = () => { if (ws === socket && !stopped) drop(); };
      socket.onerror = () => {};
    } catch { terminal('Địa chỉ máy chủ phòng không kết nối được.'); }
  }
  const timer = setInterval(() => {
    if (stopped) return;
    if (lostAt !== null && now() - lostAt >= NET.seatHoldMs) { terminal('Đã hết 20 giây giữ ghế. Hãy tạo hoặc vào phòng mới.'); return; }
    if ((status === 'connecting' || status === 'reconnecting' && ws) && now() - openedAt >= NET.connectTimeoutMs) { drop(); return; }
    if (status === 'reconnecting' && !ws && now() >= retryAt) { open(); return; }
    if (status === 'open') {
      if (authenticating && now() - authAt > NET.connectTimeoutMs || now() - heardAt > NET.clientStaleMs) { drop(); return; }
      if (now() - pingAt > 1000) { session.ping(); pingAt = now(); }
      session.retryControls();
    }
  }, 100);
  open();
  return { session, get status() { return status; },
    close() { if (stopped) return; stopped = true; status = 'closed'; generation++; clearInterval(timer); session.suspend(); admission = null; const socket = ws; ws = null; socket?.close(); } };
}
