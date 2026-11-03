/** Tank Clash room host (P2 1v1, P3b 2v2): private rooms with codes, teams, ready, countdown, authoritative
 * match, seat hold on disconnect, per-player forfeit, surrender, spectators, rematch and a once-only result hook.
 * Transport-agnostic: the WebSocket server (server/tank-clash-room) and the network-condition tests
 * both drive it through `connect/message/disconnect/advance`. Time is injected, never read globally.
 */
import { CONFIG, createState, driveTank, forfeitTank, neutral, step, surrender } from './engine.ts';
import type { Input, State } from './engine.ts';
import { ERROR_TEXT, FILL_ORDER, FORMATS, NET, PROTOCOL, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, SEATS, cleanName, encodeSnapshot, normalizeCode, parseClientMessage, teamOf } from './protocol.ts';
import type { ClientMessage, ErrorCode, Format, MatchResult, Phase, RoomView, SeatId, ServerMessage } from './protocol.ts';

export type Identity = { userId: string; name: string; guest: boolean };
/** Resolve a client token to an account. Return null to reject. Guests are only for local/dev hosts. */
export type Authenticate = (token: string | undefined, name: string | undefined) => Identity | null | Promise<Identity | null>;
export type PeerHandle = { send: (msg: ServerMessage) => void; close?: (reason: string) => void };
export type HostOptions = { now?: () => number; authenticate?: Authenticate; onResult?: (result: MatchResult) => void | Promise<void>;
  randomBytes?: (n: number) => Uint8Array; log?: (event: string, data: Record<string, unknown>) => void };

type Queued = { seq: number; input: Input };
type Seat = { id: SeatId; userId: string; name: string; guest: boolean; peer: string | null; token: string; ready: boolean; lastSeen: number;
  queue: Queued[]; last: Input; lastInputAt: number; seq: number; ack: number; credit: number;
  /** Left the running match or its hold expired: tank out for the rest of the match, seat freed at the result. */ forfeited: boolean };
type Room = { code: string; format: Format; phase: Phase; seats: Map<SeatId, Seat>; host: Seat | null; spectators: Map<string, { name: string }>;
  lastActivity: number; emptySince: number | null;
  countdownEnd: number; state: State | null; matchId: string | null; matchCount: number; result: MatchResult | null;
  accumulator: number; lastAdvance: number; eventCursor: number; wallsKey: string };
type Peer = { handle: PeerHandle; code: string | null; seat: SeatId | null; spectator: boolean; windowAt: number; messages: number; busy: boolean };

export const guestAuthenticate: Authenticate = (_token, name) => ({ userId: '', name: cleanName(name), guest: true });

export function createRoomHost(options: HostOptions = {}) {
  const now = options.now ?? (() => Date.now());
  const randomBytes = options.randomBytes ?? ((n: number) => globalThis.crypto.getRandomValues(new Uint8Array(n)));
  const authenticate = options.authenticate ?? guestAuthenticate;
  const log = options.log ?? (() => {});
  const rooms = new Map<string, Room>(), peers = new Map<string, Peer>(), userRooms = new Map<string, string>();
  const reported = new Set<string>();
  const metrics = { rooms: 0, matches: 0, results: 0, rejected: 0, rateLimited: 0, ticks: 0 };
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
    return { code: room.code, format: room.format, phase: room.phase, countdownMs: room.phase === 'countdown' ? Math.max(0, room.countdownEnd - t) : null,
      matchId: room.matchId, result: room.result, spectators: room.spectators.size,
      seats: SEATS.filter(id => room.seats.has(id)).map(id => { const s = room.seats.get(id)!;
        return { id, team: teamOf(id), name: s.name, ready: s.ready, connected: !!s.peer, host: room.host === s, forfeited: s.forfeited,
          holdMs: s.peer || s.forfeited ? null : Math.max(0, NET.seatHoldMs - (t - s.lastSeen)) }; }) };
  }
  /** Players and spectators. A function message is built per seat (null for spectators). */
  function broadcast(room: Room, msg: ServerMessage | ((seat: Seat | null) => ServerMessage)) {
    for (const seat of room.seats.values()) if (seat.peer) send(seat.peer, typeof msg === 'function' ? msg(seat) : msg);
    for (const peerId of room.spectators.keys()) send(peerId, typeof msg === 'function' ? msg(null) : msg);
  }
  const broadcastRoom = (room: Room) => broadcast(room, { type: 'room', room: view(room) });
  const ackOf = (seat: Seat | null) => seat ? seat.ack : -1;
  function snapshotFor(room: Room, seat: Seat | null, withWalls = false) {
    const s = room.state!; return encodeSnapshot(s, ackOf(seat), s.events.filter(e => e.id > room.eventCursor), withWalls ? s.walls : undefined);
  }

  function seatPeer(peerId: string, room: Room, seat: Seat) {
    const peer = peers.get(peerId)!;
    if (seat.peer && seat.peer !== peerId) { // takeover from a half-open socket on the same seat
      const old = peers.get(seat.peer); if (old) { old.code = old.seat = null; send(seat.peer, { type: 'error', code: 'RESUME_INVALID', message: 'Ghế này đã được mở ở kết nối khác.', fatal: true }); old.handle.close?.('takeover'); }
    }
    peer.code = room.code; peer.seat = seat.id; seat.peer = peerId; seat.lastSeen = now(); room.emptySince = null; room.lastActivity = now();
    seat.queue = []; seat.lastInputAt = 0; seat.last = neutral(room.state?.tanks.find(t => t.id === seat.id)?.aim ?? 0);
    const playing = room.phase === 'playing' && room.state;
    send(peerId, { type: 'joined', code: room.code, role: 'player', seat: seat.id, resumeToken: seat.token, nextSeq: seat.seq + 1, serverTime: now(), room: view(room),
      ...(playing ? { walls: room.state!.walls, snapshot: snapshotFor(room, seat, true) } : {}) });
  }
  function makeSeat(id: SeatId, who: Identity): Seat {
    return { id, userId: who.guest ? `guest:${hex(8)}` : who.userId, name: who.name, guest: who.guest, peer: null, token: hex(24), ready: false,
      lastSeen: now(), queue: [], last: neutral(), lastInputAt: 0, seq: -1, ack: -1, credit: 0, forfeited: false };
  }
  function spectate(peerId: string, room: Room, name: string) {
    if (room.spectators.size >= NET.spectatorsMax) return fail(peerId, 'SPECTATORS_FULL');
    const peer = peers.get(peerId)!; peer.code = room.code; peer.seat = null; peer.spectator = true;
    room.spectators.set(peerId, { name });
    const playing = room.phase === 'playing' && room.state;
    send(peerId, { type: 'joined', code: room.code, role: 'spectator', seat: null, resumeToken: '', nextSeq: 0, serverTime: now(), room: view(room),
      ...(playing ? { walls: room.state!.walls, snapshot: snapshotFor(room, null, true) } : {}) });
    broadcastRoom(room); log('room.spectate', { code: room.code });
  }
  function dropSpectator(room: Room, peerId: string) {
    room.spectators.delete(peerId); const p = peers.get(peerId); if (p) { p.code = null; p.spectator = false; }
    if (room.phase !== 'closed') broadcastRoom(room);
  }
  /** Lobby seat change (team switch or host move): the moved player gets a fresh `joined` with the new seat id. */
  function reseat(room: Room, moves: [Seat, SeatId][]) {
    for (const [seat] of moves) room.seats.delete(seat.id);
    for (const [seat, to] of moves) { seat.id = to; room.seats.set(to, seat); if (seat.peer) { const p = peers.get(seat.peer); if (p) p.seat = to; } }
    for (const [seat] of moves) if (seat.peer) send(seat.peer, { type: 'joined', code: room.code, role: 'player', seat: seat.id, resumeToken: seat.token, nextSeq: seat.seq + 1, serverTime: now(), room: view(room) });
    broadcastRoom(room);
  }
  function removeSeat(room: Room, id: SeatId) {
    const seat = room.seats.get(id); if (!seat) return;
    if (userRooms.get(seat.userId) === room.code) userRooms.delete(seat.userId);
    if (seat.peer) { const p = peers.get(seat.peer); if (p) { p.code = p.seat = null; } }
    room.seats.delete(id);
    if (room.host === seat) { const next = SEATS.find(s => room.seats.has(s)); room.host = next ? room.seats.get(next)! : null; } // fixed rule: first remaining seat in SEATS order
    for (const s of room.seats.values()) s.ready = false;
    if (room.phase === 'finished' || room.phase === 'countdown') room.phase = 'lobby';
    if (!room.seats.size) closeRoom(room, 'empty'); else broadcastRoom(room);
  }
  function closeRoom(room: Room, reason: string) {
    if (room.phase === 'closed') return;
    room.phase = 'closed';
    for (const seat of room.seats.values()) {
      if (userRooms.get(seat.userId) === room.code) userRooms.delete(seat.userId);
      if (seat.peer) { fail(seat.peer, 'ROOM_CLOSED'); const p = peers.get(seat.peer); if (p) { p.code = p.seat = null; } }
    }
    for (const peerId of room.spectators.keys()) { fail(peerId, 'ROOM_CLOSED'); const p = peers.get(peerId); if (p) { p.code = null; p.spectator = false; } }
    room.spectators.clear();
    rooms.delete(room.code); log('room.closed', { code: room.code, reason });
  }
  function startCountdown(room: Room) { room.phase = 'countdown'; room.countdownEnd = now() + NET.countdownMs; broadcastRoom(room); }
  function startMatch(room: Room) {
    const seed = new DataView(randomBytes(4).buffer).getUint32(0);
    room.state = room.format === '2v2' ? createState('squad', { online: true, seed }) : createState('duel', { online: true }); room.matchCount++; metrics.matches++;
    room.matchId = `${room.code}-${room.matchCount}-${hex(4)}`; room.result = null; room.phase = 'playing';
    room.accumulator = 0; room.lastAdvance = now(); room.eventCursor = room.state.nextId - 1; room.wallsKey = wallsKey(room.state);
    for (const seat of room.seats.values()) { seat.ready = false; seat.forfeited = false; seat.queue = []; seat.ack = seat.seq; seat.credit = 0; seat.lastInputAt = 0; seat.last = neutral(room.state.tanks.find(t => t.id === seat.id)!.aim); }
    broadcast(room, seat => ({ type: 'start', matchId: room.matchId!, walls: room.state!.walls, snapshot: snapshotFor(room, seat) }));
    broadcastRoom(room); log('match.start', { code: room.code, matchId: room.matchId });
  }
  function finish(room: Room, reason: MatchResult['reason'], winner: number | null) {
    const s = room.state!;
    const result: MatchResult = { matchId: room.matchId!, code: room.code, format: room.format, winner, scores: [...s.scores], reason, rounds: s.round, seed: s.map?.seed ?? null,
      players: SEATS.filter(id => room.seats.has(id)).map(id => { const seat = room.seats.get(id)!; return { seat: id, userId: seat.userId, team: teamOf(id), forfeited: seat.forfeited }; }), endedAt: now() };
    room.result = result; room.phase = 'finished';
    for (const seat of room.seats.values()) { seat.ready = false; seat.queue = []; }
    if (!reported.has(result.matchId)) { // idempotent by match id: a result is reported once
      reported.add(result.matchId); metrics.results++;
      Promise.resolve().then(() => options.onResult?.(result)).catch(error => log('result.error', { matchId: result.matchId, error: String(error) }));
    }
    broadcast(room, seat => ({ type: 'snapshot', snapshot: snapshotFor(room, seat) }));
    room.eventCursor = s.nextId - 1;
    broadcast(room, { type: 'result', result, room: view(room) }); log('match.end', { ...result });
    if (reason === 'cancelled') { closeRoom(room, 'cancelled'); return; }
    // Players who left or timed out free their seat now; the others stay for a rematch.
    for (const seat of [...room.seats.values()]) if (seat.forfeited && !seat.peer && (room.phase as Phase) !== 'closed') removeSeat(room, seat.id);
  }
  /** Put seats out of the running match (batch = same server tick), then end it if a team is gone. */
  function forfeitSeats(room: Room, seats: Seat[]) {
    const s = room.state!;
    for (const seat of seats) { seat.forfeited = true; if (userRooms.get(seat.userId) === room.code) userRooms.delete(seat.userId); log('seat.forfeit', { code: room.code, seat: seat.id }); }
    forfeitTank(s, ...seats.map(x => x.id));
    if (s.status === 'finished') finish(room, s.endReason ?? 'forfeit', s.winner); else broadcastRoom(room);
  }
  const wallsKey = (s: State) => s.walls.map(w => w.hp).join(',');
  function tick(room: Room) {
    const s = room.state!, t = now(), inputs: Record<string, Input> = {};
    for (const seat of room.seats.values()) {
      if (seat.forfeited) continue;
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
    step(s, inputs); metrics.ticks++;
    const key = wallsKey(s), wallsChanged = key !== room.wallsKey; room.wallsKey = key;
    if (s.status === 'finished') { finish(room, s.endReason ?? 'score', s.winner); return; }
    if (s.tick % NET.snapshotEvery === 0 || wallsChanged) {
      broadcast(room, seat => ({ type: 'snapshot', snapshot: snapshotFor(room, seat, wallsChanged) }));
      room.eventCursor = s.nextId - 1;
    }
  }
  function advanceRoom(room: Room, t: number) {
    const held = [...room.seats.values()].filter(s => !s.peer), expired = held.filter(s => !s.forfeited && t - s.lastSeen >= NET.seatHoldMs);
    const connected = room.seats.size - held.length;
    if (!connected) { room.emptySince ??= t; } else room.emptySince = null;
    if (room.phase === 'playing') {
      if (expired.length) { forfeitSeats(room, expired); if (room.phase !== 'playing') return; }
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
      if (room.seats.size < FORMATS[room.format].length || [...room.seats.values()].some(s => !s.peer || !s.ready)) { room.phase = room.result ? 'finished' : 'lobby'; broadcastRoom(room); }
      else if (t >= room.countdownEnd) startMatch(room);
    }
  }
  function maybeCountdown(room: Room) {
    if ((room.phase === 'lobby' || room.phase === 'finished') && room.seats.size === FORMATS[room.format].length && [...room.seats.values()].every(s => s.ready && s.peer)) startCountdown(room);
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
    if (!peers.has(peerId)) return; // disconnected while authenticating
    if (peers.get(peerId)!.code) return fail(peerId, 'ALREADY_IN_ROOM');
    if (!who) return fail(peerId, msg.token ? 'AUTH_FAILED' : 'AUTH_REQUIRED', true);
    // Everything below runs synchronously after the await, so seat claims are atomic.
    if (msg.type === 'create') {
      if (!who.guest && userRooms.has(who.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
      const room: Room = { code: newCode(), format: msg.format ?? '1v1', phase: 'lobby', seats: new Map(), host: null, spectators: new Map(), lastActivity: now(), emptySince: null, countdownEnd: 0, state: null,
        matchId: null, matchCount: 0, result: null, accumulator: 0, lastAdvance: now(), eventCursor: 0, wallsKey: '' };
      rooms.set(room.code, room); metrics.rooms++;
      const seat = makeSeat('a', who); room.seats.set('a', seat); room.host = seat; if (!who.guest) userRooms.set(seat.userId, room.code);
      seatPeer(peerId, room, seat); log('room.created', { code: room.code, format: room.format }); return;
    }
    const code = normalizeCode(msg.code), room = code ? rooms.get(code) : undefined;
    if (!room || room.phase === 'closed') return fail(peerId, code ? 'ROOM_NOT_FOUND' : 'BAD_MESSAGE');
    if (msg.type === 'resume') {
      const seat = [...room.seats.values()].find(s => s.token.length === msg.resumeToken.length && s.token === msg.resumeToken);
      if (!seat || seat.forfeited || (!seat.peer && now() - seat.lastSeen >= NET.seatHoldMs)) return fail(peerId, 'RESUME_INVALID');
      if (!seat.guest && !(who.userId === seat.userId)) return fail(peerId, 'AUTH_FAILED');
      seatPeer(peerId, room, seat); broadcastRoom(room); log('seat.resumed', { code: room.code, seat: seat.id }); return;
    }
    if (msg.as === 'spectator') return spectate(peerId, room, who.name);
    if (room.phase !== 'lobby' && room.phase !== 'finished') return fail(peerId, 'ROOM_IN_PROGRESS');
    if (!who.guest && [...room.seats.values()].some(s => s.userId === who!.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    if (!who.guest && userRooms.has(who.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    const id = FILL_ORDER[room.format].find(s => !room.seats.has(s)); if (!id) return fail(peerId, 'ROOM_FULL');
    const seat = makeSeat(id, who); room.seats.set(id, seat); if (!who.guest) userRooms.set(seat.userId, room.code);
    if (room.phase === 'finished') { room.phase = 'lobby'; room.result = null; }
    seatPeer(peerId, room, seat); broadcastRoom(room); log('room.joined', { code: room.code, seat: id });
  }
  function onInput(room: Room, seat: Seat, msg: Extract<ClientMessage, { type: 'input' }>) {
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
    connect(peerId: string, handle: PeerHandle) { peers.set(peerId, { handle, code: null, seat: null, spectator: false, windowAt: now(), messages: 0, busy: false }); },
    message(peerId: string, raw: unknown): void | Promise<void> {
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
      const room = peer.code ? rooms.get(peer.code) : undefined;
      if (room && peer.spectator) {
        if (msg.type === 'leave') { dropSpectator(room, peerId); send(peerId, { type: 'left' }); return; }
        return msg.type === 'input' ? undefined : fail(peerId, 'SPECTATOR'); // inputs are dropped silently (no error flood)
      }
      const seat = room && peer.seat ? room.seats.get(peer.seat) : undefined;
      if (!room || !seat || seat.peer !== peerId) return fail(peerId, 'NOT_IN_ROOM');
      seat.lastSeen = t;
      if (msg.type === 'input') return onInput(room, seat, msg);
      room.lastActivity = t;
      const lobby = room.phase === 'lobby' || room.phase === 'finished' || room.phase === 'countdown';
      if (msg.type === 'ready') { if (lobby) { seat.ready = msg.ready; maybeCountdown(room); } return; }
      if (msg.type === 'team') {
        if (!lobby) return fail(peerId, 'WRONG_PHASE');
        const to = FORMATS[room.format].find(id => teamOf(id) !== teamOf(seat.id) && !room.seats.has(id)); if (!to) return fail(peerId, 'TEAM_FULL');
        seat.ready = false; reseat(room, [[seat, to]]); return;
      }
      if (msg.type === 'move') {
        if (room.host !== seat) return fail(peerId, 'NOT_HOST');
        if (!lobby) return fail(peerId, 'WRONG_PHASE');
        const mover = room.seats.get(msg.seat); if (!mover || !FORMATS[room.format].includes(msg.to)) return fail(peerId, 'BAD_MESSAGE');
        const other = room.seats.get(msg.to);
        for (const x of room.seats.values()) x.ready = false; // a lineup change needs everyone to confirm again
        reseat(room, other ? [[mover, msg.to], [other, msg.seat]] : [[mover, msg.to]]); return;
      }
      if (msg.type === 'surrender') {
        if (room.phase !== 'playing' || seat.forfeited) return fail(peerId, 'WRONG_PHASE');
        const mates = [...room.seats.values()].filter(x => x !== seat && teamOf(x.id) === teamOf(seat.id) && !x.forfeited && x.peer);
        if (mates.length) return fail(peerId, 'SURRENDER_DENIED');
        surrender(room.state!, teamOf(seat.id)); finish(room, 'surrender', room.state!.winner); return;
      }
      if (msg.type === 'leave') {
        if (room.phase === 'playing') { // leaving a running match: that tank is out for the rest of the match
          seat.peer = null; seat.lastSeen = -Infinity; peer.code = peer.seat = null;
          forfeitSeats(room, [seat]);
        } else removeSeat(room, seat.id);
        send(peerId, { type: 'left' });
      }
    },
    disconnect(peerId: string) {
      const peer = peers.get(peerId); peers.delete(peerId); if (!peer?.code) return;
      if (peer.spectator) { const r = rooms.get(peer.code); if (r) dropSpectator(r, peerId); return; }
      if (!peer.seat) return;
      const room = rooms.get(peer.code), seat = room?.seats.get(peer.seat);
      if (!room || !seat || seat.peer !== peerId) return;
      // Disconnected tanks keep simulating with neutral input and can still be hit (no invulnerability).
      seat.peer = null; seat.lastSeen = now(); seat.queue = []; seat.ready = false; seat.lastInputAt = 0;
      broadcastRoom(room);
    },
    advance(t = now()) { for (const room of [...rooms.values()]) advanceRoom(room, t); },
    rooms: () => [...rooms.values()].map(r => ({ code: r.code, format: r.format, phase: r.phase, seats: r.seats.size, spectators: r.spectators.size, matchId: r.matchId, tick: r.state?.tick ?? 0 })),
    /** Test/inspection only: the live authoritative state of a room. */
    inspect(code: string) { return rooms.get(code)?.state ?? null; },
  };
}
export type RoomHost = ReturnType<typeof createRoomHost>;
