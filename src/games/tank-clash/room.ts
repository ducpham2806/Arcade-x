/** Tank Clash P2 room host: private 1v1 rooms with codes, ready, countdown, authoritative match,
 * seat hold on disconnect, forfeit, rematch and a once-only result hook.
 * Transport-agnostic: the WebSocket server (server/tank-clash-room) and the network-condition tests
 * both drive it through `connect/message/disconnect/advance`. Time is injected, never read globally.
 */
import { CONFIG, createState, driveTank, neutral, step } from './engine.ts';
import type { Input, State } from './engine.ts';
import { ERROR_TEXT, NET, PROTOCOL, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, SEATS, cleanName, encodeSnapshot, normalizeCode, parseClientMessage } from './protocol.ts';
import type { ClientMessage, ErrorCode, MatchResult, Phase, RoomView, SeatId, ServerMessage } from './protocol.ts';

export type Identity = { userId: string; name: string; guest: boolean };
/** Resolve a client token to an account. Return null to reject. Guests are only for local/dev hosts. */
export type Authenticate = (token: string | undefined, name: string | undefined) => Identity | null | Promise<Identity | null>;
export type PeerHandle = { send: (msg: ServerMessage) => void; close?: (reason: string) => void };
export type HostOptions = { now?: () => number; authenticate?: Authenticate; onResult?: (result: MatchResult) => void | Promise<void>;
  randomBytes?: (n: number) => Uint8Array; log?: (event: string, data: Record<string, unknown>) => void };

type Queued = { seq: number; input: Input };
type Seat = { id: SeatId; userId: string; name: string; guest: boolean; peer: string | null; token: string; ready: boolean; lastSeen: number;
  queue: Queued[]; last: Input; lastInputAt: number; seq: number; ack: number; credit: number; receipts: Map<string, Extract<ServerMessage, { type: 'ack' }>> };
type Room = { code: string; phase: Phase; seats: Map<SeatId, Seat>; host: SeatId | null; lastActivity: number; emptySince: number | null;
  countdownEnd: number; state: State | null; matchId: string | null; matchCount: number; result: MatchResult | null;
  accumulator: number; lastAdvance: number; eventCursor: number; wallsKey: string };
type Peer = { handle: PeerHandle; code: string | null; seat: SeatId | null; windowAt: number; messages: number; busy: boolean; receipts: Map<string, Extract<ServerMessage, { type: 'ack' }>> };

export const guestAuthenticate: Authenticate = (_token, name) => ({ userId: '', name: cleanName(name), guest: true });

export function createRoomHost(options: HostOptions = {}) {
  const now = options.now ?? (() => Date.now());
  const randomBytes = options.randomBytes ?? ((n: number) => globalThis.crypto.getRandomValues(new Uint8Array(n)));
  const authenticate = options.authenticate ?? guestAuthenticate;
  const log = options.log ?? (() => {});
  const rooms = new Map<string, Room>(), peers = new Map<string, Peer>(), userRooms = new Map<string, string>();
  let shuttingDown = false;

  const metrics = { staleInputs: 0, rooms: 0, matches: 0, results: 0, rejected: 0, rateLimited: 0, ticks: 0 };
  const hex = (n: number) => Array.from(randomBytes(n), b => b.toString(16).padStart(2, '0')).join('');

  function send(peerId: string | null, msg: ServerMessage) { if (peerId) peers.get(peerId)?.handle.send(msg); }
  function fail(peerId: string, code: ErrorCode, fatal = false) {
    metrics.rejected++; send(peerId, { type: 'error', code, message: ERROR_TEXT[code], fatal });
    if (fatal) peers.get(peerId)?.handle.close?.(code);
  }
  function newCode() {
    for (let attempt = 0; attempt < 50; attempt++) {
      const bytes = randomBytes(ROOM_CODE_LENGTH), code = Array.from(bytes, b => ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length]).join('');
      if (!rooms.has(code)) return code;
    }
    throw new Error('room code space exhausted');
  }
  function view(room: Room): RoomView {
    const t = now();
    return { code: room.code, phase: room.phase, countdownMs: room.phase === 'countdown' ? Math.max(0, room.countdownEnd - t) : null,
      matchId: room.matchId, result: room.result,
      seats: SEATS.filter(id => room.seats.has(id)).map(id => { const s = room.seats.get(id)!;
        return { id, name: s.name, ready: s.ready, connected: !!s.peer, host: room.host === id, holdMs: s.peer ? null : Math.max(0, NET.seatHoldMs - (t - s.lastSeen)) }; }) };
  }
  function broadcast(room: Room, msg: ServerMessage | ((seat: Seat) => ServerMessage)) {
    for (const seat of room.seats.values()) if (seat.peer) send(seat.peer, typeof msg === 'function' ? msg(seat) : msg);
  }
  const broadcastRoom = (room: Room) => broadcast(room, { type: 'room', room: view(room) });
  const ackOf = (seat: Seat) => seat.ack;
  const epochOf = (room: Room) => `${room.matchId}:${room.state?.round ?? 0}`;
  function snapshotFor(room: Room, seat: Seat, withWalls = false) {
    const s = room.state!; return encodeSnapshot(s, ackOf(seat), s.events.filter(e => e.id > room.eventCursor), withWalls ? s.walls : undefined, epochOf(room));
  }

  function seatPeer(peerId: string, room: Room, seat: Seat) {
    const peer = peers.get(peerId)!;
    if (seat.peer && seat.peer !== peerId) { // takeover from a half-open socket on the same seat
      const old = peers.get(seat.peer); if (old) { old.code = old.seat = null; send(seat.peer, { type: 'error', code: 'RESUME_INVALID', message: 'Ghế này đã được mở ở kết nối khác.', fatal: true }); old.handle.close?.('takeover'); }
    }
    peer.code = room.code; peer.seat = seat.id; seat.peer = peerId; seat.lastSeen = now(); room.emptySince = null; room.lastActivity = now();
    seat.queue = []; seat.lastInputAt = 0; seat.last = neutral(room.state?.tanks.find(t => t.id === seat.id)?.aim ?? 0);
    const playing = room.phase === 'playing' && room.state;
    send(peerId, { type: 'joined', code: room.code, seat: seat.id, resumeToken: seat.token, nextSeq: seat.seq + 1, serverTime: now(), room: view(room),
      ...(playing ? { walls: room.state!.walls, snapshot: snapshotFor(room, seat, true) } : {}) });
  }
  function makeSeat(id: SeatId, who: Identity): Seat {
    return { id, userId: who.guest ? `guest:${hex(8)}` : who.userId, name: who.name, guest: who.guest, peer: null, token: hex(24), ready: false,
      lastSeen: now(), queue: [], last: neutral(), lastInputAt: 0, seq: -1, ack: -1, credit: 0, receipts: new Map() };
  }
  function removeSeat(room: Room, id: SeatId) {
    const seat = room.seats.get(id); if (!seat) return;
    if (userRooms.get(seat.userId) === room.code) userRooms.delete(seat.userId);
    if (seat.peer) { const p = peers.get(seat.peer); if (p) { p.code = p.seat = null; } }
    room.seats.delete(id);
    if (room.host === id) room.host = SEATS.find(s => room.seats.has(s)) ?? null; // fixed rule: lowest remaining seat
    for (const s of room.seats.values()) s.ready = false;
    if (room.phase === 'finished' || room.phase === 'countdown') room.phase = 'lobby';
    if (!room.seats.size) closeRoom(room, 'empty'); else broadcastRoom(room);
  }
  function closeRoom(room: Room, reason: string, silent = false) {
    if (room.phase === 'closed') return;
    room.phase = 'closed';
    for (const seat of room.seats.values()) {
      if (userRooms.get(seat.userId) === room.code) userRooms.delete(seat.userId);
      if (seat.peer) { if (!silent) fail(seat.peer, 'ROOM_CLOSED'); const p = peers.get(seat.peer); if (p) { p.code = p.seat = null; } }
    }
    rooms.delete(room.code); log('room.closed', { code: room.code, reason });
  }
  function startCountdown(room: Room) { room.phase = 'countdown'; room.countdownEnd = now() + NET.countdownMs; broadcastRoom(room); }
  function startMatch(room: Room) {
    room.state = createState('duel', { online: true }); room.matchCount++; metrics.matches++;
    room.matchId = `${room.code}-${room.matchCount}-${hex(4)}`; room.result = null; room.phase = 'playing';
    room.accumulator = 0; room.lastAdvance = now(); room.eventCursor = room.state.nextId - 1; room.wallsKey = wallsKey(room.state);
    for (const seat of room.seats.values()) { seat.ready = false; seat.queue = []; seat.ack = seat.seq; seat.credit = 0; seat.lastInputAt = 0; seat.last = neutral(room.state.tanks.find(t => t.id === seat.id)!.aim); }
    broadcast(room, seat => ({ type: 'start', matchId: room.matchId!, walls: room.state!.walls, snapshot: snapshotFor(room, seat) }));
    broadcastRoom(room); log('match.start', { code: room.code, matchId: room.matchId });
  }
  function finish(room: Room, reason: MatchResult['reason'], winner: number | null, closeCancelled = true) {
    if (room.phase === 'finished' || room.phase === 'closed' || !room.state) return;
    const s = room.state!;
    const result: MatchResult = { matchId: room.matchId!, code: room.code, winner, scores: [...s.scores], reason, rounds: s.round,
      players: [...room.seats.values()].map(seat => ({ seat: seat.id, userId: seat.userId, team: seat.id === 'a' ? 0 : 1 })), endedAt: now() };
    room.result = result; room.phase = 'finished';
    for (const seat of room.seats.values()) { seat.ready = false; seat.queue = []; }
    { // Phase guard makes results once-only; no process-wide unbounded set.
      metrics.results++;
      Promise.resolve().then(() => options.onResult?.(result)).catch(error => log('result.error', { matchId: result.matchId, error: String(error) }));
    }
    broadcast(room, seat => ({ type: 'snapshot', snapshot: snapshotFor(room, seat) }));
    room.eventCursor = s.nextId - 1;
    broadcast(room, { type: 'result', result, room: view(room) }); log('match.end', { ...result });
    if (reason === 'cancelled' && closeCancelled) closeRoom(room, 'cancelled');
  }
  const wallsKey = (s: State) => s.walls.map(w => w.hp).join(',');
  function tick(room: Room) {
    const s = room.state!, t = now(), inputs: Record<string, Input> = {};
    for (const seat of room.seats.values()) {
      const tk = s.tanks.find(x => x.id === seat.id)!;
      // Input credit: one per tick, banked up to NET.inputCreditMax. A late burst (jitter, TCP retransmit) is
      // caught up at most 2 inputs per tick, so a seat can never apply more inputs than ticks elapsed + the bank.
      seat.credit = Math.min(NET.inputCreditMax, seat.credit + 1);
      if (!seat.queue.length || seat.credit < 1) {
        // Starved: stand still (keep the turret). The delayed input is applied when it arrives, exactly as predicted.
        inputs[seat.id] = seat.last = neutral(seat.peer && t - seat.lastInputAt < NET.staleInputMs ? seat.last.aim : tk.aim);
        continue;
      }
      if (seat.queue.length > 1 && seat.credit >= 2 && s.status === 'playing') {
        const extra = seat.queue.shift()!; seat.credit--; seat.ack = extra.seq;
        if (tk.hp > 0) driveTank(s, tk, extra.input); // movement sub-step; its pulses carry over to the next input
        seat.queue[0].input.fire ||= extra.input.fire; seat.queue[0].input.shield ||= extra.input.shield;
      }
      const next = seat.queue.shift()!; seat.credit--; seat.ack = next.seq; seat.last = next.input; inputs[seat.id] = next.input;
    }
    const roundBefore = s.round;
    step(s, inputs); metrics.ticks++;
    if (s.round !== roundBefore) for (const seat of room.seats.values()) {
      seat.queue = []; seat.ack = seat.seq; seat.credit = 0; seat.lastInputAt = 0;
    }
    const key = wallsKey(s), wallsChanged = key !== room.wallsKey; room.wallsKey = key;
    if (s.status === 'finished') { finish(room, 'score', s.winner); return; }
    if (s.tick % NET.snapshotEvery === 0 || wallsChanged) {
      broadcast(room, seat => ({ type: 'snapshot', snapshot: snapshotFor(room, seat, wallsChanged) }));
      room.eventCursor = s.nextId - 1;
    }
  }
  function advanceRoom(room: Room, t: number) {
    const held = [...room.seats.values()].filter(s => !s.peer), expired = held.filter(s => t - s.lastSeen >= NET.seatHoldMs);
    const connected = room.seats.size - held.length;
    if (!connected) { room.emptySince ??= t; } else room.emptySince = null;
    if (room.phase === 'playing') {
      if (expired.length === room.seats.size) { finish(room, 'cancelled', null); return; }
      if (expired.length) { const loser = expired[0].id === 'a' ? 0 : 1; finish(room, 'forfeit', 1 - loser); return; }
      const step = 1000 / CONFIG.hz;
      room.accumulator += Math.min(250, Math.max(0, t - room.lastAdvance)); room.lastAdvance = t; // cap: a stalled host slows time, it never fast-forwards
      while (room.accumulator >= step && room.phase === 'playing') { room.accumulator -= step; tick(room); }
      return;
    }
    for (const seat of expired) removeSeat(room, seat.id);
    if (room.phase === 'closed') return;
    if (room.emptySince !== null && t - room.emptySince >= NET.emptyRoomMs) { closeRoom(room, 'empty'); return; }
    if (room.phase === 'lobby' && t - room.lastActivity >= NET.lobbyIdleMs) { closeRoom(room, 'idle'); return; }
    if (room.phase === 'countdown') {
      if (room.seats.size < 2 || [...room.seats.values()].some(s => !s.peer || !s.ready)) { room.phase = room.result ? 'finished' : 'lobby'; broadcastRoom(room); }
      else if (t >= room.countdownEnd) startMatch(room);
    }
  }
  function maybeCountdown(room: Room) {
    if ((room.phase === 'lobby' || room.phase === 'finished') && room.seats.size === 2 && [...room.seats.values()].every(s => s.ready && s.peer)) startCountdown(room);
    else broadcastRoom(room);
  }
  /** Synchronous when the authenticator is; a Promise only while waiting on a remote token check. */
  function admit(peerId: string, msg: Extract<ClientMessage, { type: 'create' | 'join' | 'resume' }>): void | Promise<void> {
    const peer = peers.get(peerId)!;
    if (msg.protocol !== PROTOCOL) return fail(peerId, 'PROTOCOL_MISMATCH', true);
    if (peer.code) return fail(peerId, 'ALREADY_IN_ROOM');
    let who: Identity | null | Promise<Identity | null>;
    try { who = authenticate(msg.token, 'name' in msg ? msg.name : undefined); } catch { who = null; }
    if (who && typeof (who as Promise<Identity | null>).then === 'function') {
      return (who as Promise<Identity | null>).catch(() => null).then(resolved => seatIdentity(peerId, msg, resolved));
    }
    seatIdentity(peerId, msg, who as Identity | null);
  }
  function seatIdentity(peerId: string, msg: Extract<ClientMessage, { type: 'create' | 'join' | 'resume' }>, who: Identity | null) {
    if (shuttingDown || !peers.has(peerId)) return; // disconnected or shut down while authenticating
    if (peers.get(peerId)!.code) return fail(peerId, 'ALREADY_IN_ROOM');
    if (!who) return fail(peerId, msg.token ? 'AUTH_FAILED' : 'AUTH_REQUIRED', true);
    // Everything below runs synchronously after the await, so seat claims are atomic.
    if (msg.type === 'create') {
      if (rooms.size >= NET.maxRooms) return fail(peerId, 'SERVER_FULL', true);
      if (!who.guest && userRooms.has(who.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
      const room: Room = { code: newCode(), phase: 'lobby', seats: new Map(), host: 'a', lastActivity: now(), emptySince: null, countdownEnd: 0, state: null,
        matchId: null, matchCount: 0, result: null, accumulator: 0, lastAdvance: now(), eventCursor: 0, wallsKey: '' };
      rooms.set(room.code, room); metrics.rooms++;
      const seat = makeSeat('a', who); room.seats.set('a', seat); if (!who.guest) userRooms.set(seat.userId, room.code);
      seatPeer(peerId, room, seat); log('room.created', { code: room.code }); return;
    }
    const code = normalizeCode(msg.code), room = code ? rooms.get(code) : undefined;
    if (!room || room.phase === 'closed') return fail(peerId, code ? 'ROOM_NOT_FOUND' : 'BAD_MESSAGE');
    if (msg.type === 'resume') {
      const seat = [...room.seats.values()].find(s => s.token.length === msg.resumeToken.length && s.token === msg.resumeToken);
      if (!seat || (!seat.peer && now() - seat.lastSeen >= NET.seatHoldMs)) return fail(peerId, 'RESUME_INVALID');
      if (!seat.guest && !(who.userId === seat.userId)) return fail(peerId, 'AUTH_FAILED');
      seatPeer(peerId, room, seat); broadcastRoom(room); log('seat.resumed', { code: room.code, seat: seat.id }); return;
    }
    if (room.phase !== 'lobby' && room.phase !== 'finished') return fail(peerId, 'ROOM_IN_PROGRESS');
    if (!who.guest && [...room.seats.values()].some(s => s.userId === who!.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    if (!who.guest && userRooms.has(who.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    const id = SEATS.find(s => !room.seats.has(s)); if (!id) return fail(peerId, 'ROOM_FULL');
    const seat = makeSeat(id, who); room.seats.set(id, seat); if (!who.guest) userRooms.set(seat.userId, room.code);
    if (room.phase === 'finished') { room.phase = 'lobby'; room.result = null; }
    seatPeer(peerId, room, seat); broadcastRoom(room); log('room.joined', { code: room.code, seat: id });
  }
  function onInput(room: Room, seat: Seat, msg: Extract<ClientMessage, { type: 'input' }>) {
    if (room.phase !== 'playing' || room.state?.status !== 'playing' || msg.epoch !== epochOf(room)) { metrics.staleInputs++; return; }
    if (msg.seq > seat.seq + NET.maxPendingInputs) { metrics.rejected++; return; }
    const t = now();
    msg.inputs.forEach((input, i) => {
      const seq = msg.seq + i; if (seq <= seat.seq) return; // duplicate or replayed
      seat.seq = seq;
      if (room.phase !== 'playing') { seat.ack = seq; return; } // discarded outside a match, but acknowledged
      seat.queue.push({ seq, input: { x: input.x, y: input.y, aim: input.aim, fire: input.fire, shield: input.shield } }); seat.lastInputAt = t;
      while (seat.queue.length > NET.inputQueueMax) { // too far behind: merge the oldest so a pulse is never lost
        const old = seat.queue.shift()!, next = seat.queue[0]; next.input.fire ||= old.input.fire; next.input.shield ||= old.input.shield; seat.ack = old.seq;
      }
    });
  }

  return {
    metrics,
    connect(peerId: string, handle: PeerHandle) { if (shuttingDown) { handle.close?.('shutdown'); return; } peers.set(peerId, { handle, code: null, seat: null, windowAt: now(), messages: 0, busy: false, receipts: new Map() }); },
    message(peerId: string, raw: unknown): void | Promise<void> {
      if (shuttingDown) return;
      const peer = peers.get(peerId); if (!peer) return;
      const t = now(); if (t - peer.windowAt >= 1000) { peer.windowAt = t; peer.messages = 0; }
      if (++peer.messages > NET.messagesPerSecond) { metrics.rateLimited++; if (peer.messages > NET.messagesPerSecond * 2) fail(peerId, 'RATE_LIMITED', true); return; }
      const msg = parseClientMessage(raw); if (!msg) return fail(peerId, 'BAD_MESSAGE');
      if (msg.type === 'ping') { send(peerId, { type: 'pong', at: msg.at, serverTime: t, tick: peer.code ? rooms.get(peer.code)?.state?.tick ?? 0 : 0 }); return; }
      if (msg.type === 'create' || msg.type === 'join' || msg.type === 'resume') {
        if (peer.busy) return fail(peerId, 'BAD_MESSAGE');
        const pending = admit(peerId, msg); if (!pending) return;
        peer.busy = true; return pending.finally(() => { const p = peers.get(peerId); if (p) p.busy = false; });
      }
      if ((msg.type === 'ready' || msg.type === 'leave') && peer.receipts.has(msg.opId)) { send(peerId, peer.receipts.get(msg.opId)!); return; }
      const room = peer.code ? rooms.get(peer.code) : undefined, seat = room && peer.seat ? room.seats.get(peer.seat) : undefined;
      if (!room || !seat || seat.peer !== peerId) return fail(peerId, 'NOT_IN_ROOM');
      seat.lastSeen = t;
      if (msg.type === 'input') return onInput(room, seat, msg);
      room.lastActivity = t;
      if (msg.type === 'ready' || msg.type === 'leave') {
        const old = seat.receipts.get(msg.opId);
        if (old) { send(peerId, old); return; }
        const ack: Extract<ServerMessage, { type: 'ack' }> = { type: 'ack', opId: msg.opId };
        if (msg.type === 'ready' && msg.context !== room.matchId) ack.error = 'BAD_PHASE';
        peer.receipts.set(msg.opId, ack); seat.receipts.set(msg.opId, ack);
        if (peer.receipts.size > 128) peer.receipts.delete(peer.receipts.keys().next().value!);
        if (seat.receipts.size > 128) seat.receipts.delete(seat.receipts.keys().next().value!);
        send(peerId, ack); if (ack.error) return;
      }
      if (msg.type === 'ready') { if (room.phase === 'lobby' || room.phase === 'finished' || room.phase === 'countdown') { seat.ready = msg.ready; maybeCountdown(room); } return; }
      if (msg.type === 'leave') {
        if (room.phase === 'playing') { // leaving a running match is an immediate forfeit
          seat.peer = null; seat.lastSeen = -Infinity; peer.code = peer.seat = null;
          finish(room, 'forfeit', seat.id === 'a' ? 1 : 0);
          if ((room.phase as Phase) !== 'closed') removeSeat(room, seat.id);
        } else removeSeat(room, seat.id);
        send(peerId, { type: 'left' });
      }
    },
    disconnect(peerId: string) {
      const peer = peers.get(peerId); peers.delete(peerId); if (!peer?.code || !peer.seat) return;
      const room = rooms.get(peer.code), seat = room?.seats.get(peer.seat);
      if (!room || !seat || seat.peer !== peerId) return;
      // Disconnected tanks keep simulating with neutral input and can still be hit (no invulnerability).
      seat.peer = null; seat.lastSeen = now(); seat.queue = []; seat.ready = false; seat.lastInputAt = 0;
      broadcastRoom(room);
    },
    advance(t = now()) { for (const room of [...rooms.values()]) advanceRoom(room, t); },
    shutdown() {
      if (shuttingDown) return;
      shuttingDown = true;
      for (const room of [...rooms.values()]) {
        if (room.phase === 'playing') finish(room, 'cancelled', null, false);
        broadcast(room, { type: 'shutdown' });
        closeRoom(room, 'shutdown', true);
      }
    },
    seated(peerId: string) { return !!peers.get(peerId)?.code; },
    rooms: () => [...rooms.values()].map(r => ({ code: r.code, phase: r.phase, seats: r.seats.size, matchId: r.matchId, tick: r.state?.tick ?? 0 })),
    /** Test/inspection only: the live authoritative state of a room. */
    inspect(code: string) { return rooms.get(code)?.state ?? null; },
  };
}
export type RoomHost = ReturnType<typeof createRoomHost>;
