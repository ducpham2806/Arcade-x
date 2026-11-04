/** Tank Clash room host (P2 1v1, P3b 2v2, P3c queue): private rooms with codes, teams, ready, countdown, authoritative
 * match, seat hold on disconnect, per-player forfeit, surrender, spectators, rematch, a once-only result hook, and one
 * in-memory 2v2 queue for solo players and parties (a party = a private 2v2 room with up to two players on one team).
 * Transport-agnostic: the WebSocket server (server/tank-clash-room) and the network-condition tests
 * both drive it through `connect/message/disconnect/advance`. Time is injected, never read globally.
 */
import { CONFIG, createState, driveTank, forfeitTank, neutral, step, surrender } from './engine.ts';
import type { Input, State } from './engine.ts';
import { ERROR_TEXT, JOIN_ORDER, NET, PROTOCOL, ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH, SEATS, SEATS_OF, cleanName, encodeSnapshot, normalizeCode, parseClientMessage, teamOf } from './protocol.ts';
import type { ClientMessage, ErrorCode, Format, MatchResult, Phase, QueueView, RoomKind, RoomView, SeatId, ServerMessage } from './protocol.ts';

export type Identity = { userId: string; name: string; guest: boolean };
/** Resolve a client token to an account. Return null to reject. Guests are only for local/dev hosts. */
export type Authenticate = (token: string | undefined, name: string | undefined) => Identity | null | Promise<Identity | null>;
export type PeerHandle = { send: (msg: ServerMessage) => void; close?: (reason: string) => void };
export type HostOptions = { now?: () => number; authenticate?: Authenticate; onResult?: (result: MatchResult) => void | Promise<void>;
  randomBytes?: (n: number) => Uint8Array; log?: (event: string, data: Record<string, unknown>) => void;
  /** The public queue needs a signed-in account (owner decision Q2). true only for a local dev host without accounts. */
  guestQueue?: boolean };

type Queued = { seq: number; input: Input };
type Seat = { id: SeatId; userId: string; name: string; guest: boolean; peer: string | null; token: string; ready: boolean; lastSeen: number;
  queue: Queued[]; last: Input; lastInputAt: number; seq: number; ack: number; credit: number; forfeited: boolean };
/** Spectators watch with a public view (MVP has no hidden information). They never send input or count toward start/end. */
type Spectator = { token: string; name: string; peer: string | null; lastSeen: number };
/** A queued unit: one solo player (not in any room) or a party room. `since` orders the queue and survives a cancelled countdown. */
type Member = { peer: string | null; userId: string; name: string; guest: boolean };
type QEntry = { id: number; since: number; solo: (Member & { offlineSince: number | null }) | null; party: string | null };
/** Who came in together, so a party can be put back together after a matched room ends. */
type Group = { party: boolean; since: number; userIds: string[] };
type Room = { code: string; kind: RoomKind; format: Format; phase: Phase; seats: Map<SeatId, Seat>; spectators: Map<string, Spectator>; host: SeatId | null;
  lastActivity: number; emptySince: number | null; countdownEnd: number; state: State | null; matchId: string | null; matchCount: number;
  result: MatchResult | null; accumulator: number; lastAdvance: number; eventCursor: number; wallsKey: string;
  /** Party room in the queue. */ queued: QEntry | null; /** Matched room: arrival groups. */ groups: Group[]; /** Matched room: end of the rematch window. */ dissolveAt: number | null };
type Peer = { handle: PeerHandle; code: string | null; seat: SeatId | null; spectator: string | null; queued: QEntry | null; windowAt: number; messages: number; busy: boolean };

export const guestAuthenticate: Authenticate = (_token, name) => ({ userId: '', name: cleanName(name), guest: true });

export function createRoomHost(options: HostOptions = {}) {
  const now = options.now ?? (() => Date.now());
  const randomBytes = options.randomBytes ?? ((n: number) => globalThis.crypto.getRandomValues(new Uint8Array(n)));
  const authenticate = options.authenticate ?? guestAuthenticate;
  const log = options.log ?? (() => {});
  const rooms = new Map<string, Room>(), peers = new Map<string, Peer>(), userRooms = new Map<string, string>();
  const queue: QEntry[] = [], queuedUsers = new Map<string, QEntry>(); let entryIds = 0;
  const metrics = { rooms: 0, matches: 0, results: 0, rejected: 0, rateLimited: 0, ticks: 0 };
  const hex = (n: number) => Array.from(randomBytes(n), b => b.toString(16).padStart(2, '0')).join('');
  const seatCount = (room: Room) => SEATS_OF[room.format].length;

  function send(peerId: string | null, msg: ServerMessage) { if (peerId) peers.get(peerId)?.handle.send(msg); }
  function fail(peerId: string, code: ErrorCode, fatal = false) {
    metrics.rejected++; send(peerId, { type: 'error', code, message: ERROR_TEXT[code], fatal });
    if (fatal) peers.get(peerId)?.handle.close?.(code);
  }
  function detach(peerId: string | null) { const p = peerId ? peers.get(peerId) : undefined; if (p) { p.code = p.seat = p.spectator = null; } }
  function newCode() {
    for (let attempt = 0; attempt < 50; attempt++) {
      const bytes = randomBytes(ROOM_CODE_LENGTH), code = Array.from(bytes, b => ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length]).join('');
      if (!rooms.has(code)) return code;
    }
    throw new Error('room code space exhausted');
  }
  function view(room: Room): RoomView {
    const t = now();
    return { code: room.code, kind: room.kind, format: room.format, phase: room.phase, queue: room.queued ? queueView(room.queued) : null,
      rematchMs: room.kind === 'queue' && room.phase === 'finished' && room.dissolveAt !== null ? Math.max(0, room.dissolveAt - t) : null, countdownMs: room.phase === 'countdown' ? Math.max(0, room.countdownEnd - t) : null,
      matchId: room.matchId, result: room.result, spectators: [...room.spectators.values()].filter(v => v.peer).length,
      seats: SEATS_OF[room.format].filter(id => room.seats.has(id)).map(id => { const s = room.seats.get(id)!;
        return { id, team: teamOf(id), name: s.name, ready: s.ready, connected: !!s.peer, host: room.host === id, forfeited: s.forfeited,
          holdMs: s.peer || s.forfeited ? null : Math.max(0, NET.seatHoldMs - (t - s.lastSeen)) }; }) };
  }
  /** Send to every connected seat and spectator. A function gets the receiver's input ack (-1 for spectators). */
  function broadcast(room: Room, msg: ServerMessage | ((ack: number) => ServerMessage)) {
    for (const seat of room.seats.values()) if (seat.peer) send(seat.peer, typeof msg === 'function' ? msg(seat.ack) : msg);
    for (const v of room.spectators.values()) if (v.peer) send(v.peer, typeof msg === 'function' ? msg(-1) : msg);
  }
  const broadcastRoom = (room: Room) => broadcast(room, { type: 'room', room: view(room) });
  function snapshotFor(room: Room, ack: number, withWalls = false) {
    const s = room.state!; return encodeSnapshot(s, ack, s.events.filter(e => e.id > room.eventCursor), withWalls ? s.walls : undefined);
  }
  function joinedMessage(room: Room, role: 'player' | 'spectator', seat: Seat | null, token: string): ServerMessage {
    const playing = room.phase === 'playing' && room.state;
    return { type: 'joined', code: room.code, role, seat: seat?.id ?? null, resumeToken: token, nextSeq: seat ? seat.seq + 1 : 0, serverTime: now(), room: view(room),
      ...(playing ? { walls: room.state!.walls, snapshot: snapshotFor(room, seat?.ack ?? -1, true) } : {}) };
  }

  function seatPeer(peerId: string, room: Room, seat: Seat) {
    const peer = peers.get(peerId)!;
    if (seat.peer && seat.peer !== peerId) { // takeover from a half-open socket on the same seat
      const old = peers.get(seat.peer); if (old) { detach(seat.peer); send(seat.peer, { type: 'error', code: 'RESUME_INVALID', message: 'Ghế này đã được mở ở kết nối khác.', fatal: true }); old.handle.close?.('takeover'); }
    }
    peer.code = room.code; peer.seat = seat.id; peer.spectator = null; seat.peer = peerId; seat.lastSeen = now(); room.emptySince = null; room.lastActivity = now();
    seat.queue = []; seat.lastInputAt = 0; seat.last = neutral(room.state?.tanks.find(t => t.id === seat.id)?.aim ?? 0);
    send(peerId, joinedMessage(room, 'player', seat, seat.token));
  }
  function watchPeer(peerId: string, room: Room, v: Spectator) {
    if (v.peer && v.peer !== peerId) { const old = peers.get(v.peer); detach(v.peer); old?.handle.close?.('takeover'); }
    const peer = peers.get(peerId)!; peer.code = room.code; peer.seat = null; peer.spectator = v.token; v.peer = peerId; v.lastSeen = now();
    send(peerId, joinedMessage(room, 'spectator', null, v.token));
  }
  function makeSeat(id: SeatId, who: Identity): Seat {
    return { id, userId: who.guest && !who.userId ? `guest:${hex(8)}` : who.userId, name: who.name, guest: who.guest, peer: null, token: hex(24), ready: false,
      lastSeen: now(), queue: [], last: neutral(), lastInputAt: 0, seq: -1, ack: -1, credit: 0, forfeited: false };
  }
  function releaseUser(room: Room, seat: Seat) { if (userRooms.get(seat.userId) === room.code) userRooms.delete(seat.userId); }
  function removeSeat(room: Room, id: SeatId) {
    const seat = room.seats.get(id); if (!seat) return;
    releaseUser(room, seat); detach(seat.peer);
    room.seats.delete(id);
    if (room.queued) dropEntry(room.queued); // a party member left: the whole party leaves the queue
    if (room.host === id) room.host = SEATS.find(s => room.seats.has(s)) ?? null; // fixed rule: a, a2, b, b2
    for (const s of room.seats.values()) s.ready = false;
    if (room.kind === 'queue') { if (room.phase === 'countdown' && room.matchCount) room.phase = 'finished'; } // matched rooms take no newcomers
    else if (room.phase === 'finished' || room.phase === 'countdown') room.phase = 'lobby';
    if (!room.seats.size) closeRoom(room, 'empty'); else broadcastRoom(room);
  }
  /** Move a seated player to a free seat of `team`. Returns false when that team is full. */
  function moveSeat(room: Room, seat: Seat, team: number): boolean {
    if (teamOf(seat.id) === team) return true;
    const to = SEATS_OF[room.format].find(id => teamOf(id) === team && !room.seats.has(id)); if (!to) return false;
    const from = seat.id; room.seats.delete(from); seat.id = to; room.seats.set(to, seat);
    if (room.host === from) room.host = to;
    const p = seat.peer ? peers.get(seat.peer) : undefined; if (p) p.seat = to;
    send(seat.peer, { type: 'seat', seat: to });
    return true;
  }
  function newRoom(format: Format, kind: RoomKind): Room {
    const room: Room = { code: newCode(), kind, format, phase: 'lobby', seats: new Map(), spectators: new Map(), host: kind === 'private' ? 'a' : null, lastActivity: now(),
      emptySince: null, countdownEnd: 0, state: null, matchId: null, matchCount: 0, result: null, accumulator: 0, lastAdvance: now(), eventCursor: 0, wallsKey: '',
      queued: null, groups: [], dissolveAt: null };
    rooms.set(room.code, room); metrics.rooms++; return room;
  }
  function closeRoom(room: Room, reason: string) {
    if (room.phase === 'closed') return;
    if (room.queued) dropEntry(room.queued);
    room.phase = 'closed';
    for (const seat of room.seats.values()) { releaseUser(room, seat); if (seat.peer) { fail(seat.peer, 'ROOM_CLOSED'); detach(seat.peer); } }
    for (const v of room.spectators.values()) if (v.peer) { fail(v.peer, 'ROOM_CLOSED'); detach(v.peer); }
    rooms.delete(room.code); log('room.closed', { code: room.code, reason });
  }
  function startCountdown(room: Room) { room.phase = 'countdown'; room.countdownEnd = now() + NET.countdownMs; broadcastRoom(room); }
  function startMatch(room: Room) {
    const seed = parseInt(hex(4), 16) >>> 0;
    room.state = createState(room.format === '2v2' ? 'squad' : 'duel', { online: true, seed }); room.matchCount++; metrics.matches++;
    room.matchId = `${room.code}-${room.matchCount}-${hex(4)}`; room.result = null; room.phase = 'playing'; room.dissolveAt = null;
    room.accumulator = 0; room.lastAdvance = now(); room.eventCursor = room.state.nextId - 1; room.wallsKey = wallsKey(room.state);
    for (const seat of room.seats.values()) { seat.ready = false; seat.forfeited = false; seat.queue = []; seat.ack = seat.seq; seat.credit = 0; seat.lastInputAt = 0; seat.last = neutral(room.state.tanks.find(t => t.id === seat.id)!.aim); }
    broadcast(room, ack => ({ type: 'start', matchId: room.matchId!, walls: room.state!.walls, snapshot: snapshotFor(room, ack) }));
    broadcastRoom(room); log('match.start', { code: room.code, format: room.format, matchId: room.matchId, seed });
  }
  function finish(room: Room, reason: MatchResult['reason'], winner: number | null) {
    if (room.result?.matchId === room.matchId) return; // exactly once while this match exists
    const s = room.state!;
    const result: MatchResult = { matchId: room.matchId!, code: room.code, format: room.format, winner, scores: [...s.scores], reason, rounds: s.round,
      players: SEATS_OF[room.format].filter(id => room.seats.has(id)).map(id => { const seat = room.seats.get(id)!;
        return { seat: id, userId: seat.userId, name: seat.name, team: teamOf(id), forfeited: seat.forfeited }; }), endedAt: now() };
    room.result = result; room.phase = 'finished';
    if (room.kind === 'queue') room.dissolveAt = now() + NET.queueRematchMs;
    for (const seat of room.seats.values()) { seat.ready = false; seat.queue = []; }
    metrics.results++;
    Promise.resolve().then(() => options.onResult?.(result)).catch(error => log('result.error', { matchId: result.matchId, error: String(error) }));
    broadcast(room, ack => ({ type: 'snapshot', snapshot: snapshotFor(room, ack) }));
    room.eventCursor = s.nextId - 1;
    broadcast(room, { type: 'result', result, room: view(room) }); log('match.end', { ...result });
    if (reason === 'cancelled') { closeRoom(room, 'cancelled'); return; }
    // Players who left (or whose hold ran out) free their seats now; the room returns to the lobby for newcomers.
    for (const seat of [...room.seats.values()]) if (seat.forfeited && !seat.peer && (room.phase as Phase) !== 'closed') removeSeat(room, seat.id);
  }
  /** Mark seats as out for the rest of the match; ends the match when a whole team (or everyone) is gone. */
  function forfeitSeats(room: Room, seats: Seat[]) {
    for (const seat of seats) { seat.forfeited = true; seat.ready = false; releaseUser(room, seat); }
    const s = room.state!; forfeitTank(s, ...seats.map(seat => seat.id));
    if (s.status === 'finished') finish(room, s.endReason ?? 'forfeit', s.winner); else broadcastRoom(room);
  }
  const wallsKey = (s: State) => s.walls.map(w => w.hp).join(',');
  function tick(room: Room) {
    const s = room.state!, t = now(), inputs: Record<string, Input> = {};
    for (const seat of room.seats.values()) {
      const tk = s.tanks.find(x => x.id === seat.id)!;
      if (seat.forfeited) { inputs[seat.id] = neutral(tk.aim); continue; }
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
      broadcast(room, ack => ({ type: 'snapshot', snapshot: snapshotFor(room, ack, wallsChanged) }));
      room.eventCursor = s.nextId - 1;
    }
  }
  function advanceRoom(room: Room, t: number) {
    for (const [token, v] of room.spectators) if (!v.peer && t - v.lastSeen >= NET.seatHoldMs) room.spectators.delete(token);
    const held = [...room.seats.values()].filter(s => !s.peer), expired = held.filter(s => t - s.lastSeen >= NET.seatHoldMs);
    const connected = room.seats.size - held.length;
    if (!connected) { room.emptySince ??= t; } else room.emptySince = null;
    if (room.phase === 'playing') {
      const out = expired.filter(s => !s.forfeited); // per player (P3-SPEC §3.4): team-mates play on
      if (out.length) { forfeitSeats(room, out); if ((room.phase as Phase) !== 'playing') return; }
      const step = 1000 / CONFIG.hz;
      room.accumulator += Math.min(250, Math.max(0, t - room.lastAdvance)); room.lastAdvance = t; // cap: a stalled host slows time, it never fast-forwards
      while (room.accumulator >= step && room.phase === 'playing') { room.accumulator -= step; tick(room); }
      return;
    }
    if (room.kind === 'queue' && room.phase === 'countdown' && !room.matchCount) { // matched countdown: no ready needed, nobody may drop
      if (room.seats.size < seatCount(room) || held.length) cancelMatched(room); else if (t >= room.countdownEnd) startMatch(room);
      return;
    }
    if (room.kind === 'queue' && room.phase === 'finished' && room.dissolveAt !== null && t >= room.dissolveAt) { dissolve(room); return; }
    if (room.queued && held.some(s => t - s.lastSeen >= NET.queueDropMs)) { dropEntry(room.queued); broadcastRoom(room); }
    for (const seat of expired) removeSeat(room, seat.id);
    if (room.phase === 'closed') return;
    if (room.emptySince !== null && t - room.emptySince >= NET.emptyRoomMs) { closeRoom(room, 'empty'); return; }
    if (room.phase === 'lobby' && t - room.lastActivity >= NET.lobbyIdleMs) { closeRoom(room, 'idle'); return; }
    if (room.phase === 'countdown') {
      if (room.seats.size < seatCount(room) || [...room.seats.values()].some(s => !s.peer || !s.ready)) { room.phase = room.result ? 'finished' : 'lobby'; broadcastRoom(room); }
      else if (t >= room.countdownEnd) startMatch(room);
    }
  }
  /** Countdown only with every seat filled (each team full), connected and ready. Never with bots (P3-SPEC D4). */
  function maybeCountdown(room: Room) {
    if ((room.phase === 'lobby' || room.phase === 'finished') && room.seats.size === seatCount(room) && [...room.seats.values()].every(s => s.ready && s.peer)) startCountdown(room);
    else broadcastRoom(room);
  }
  // ---- 2v2 queue (P3-SPEC §6) ----------------------------------------------------------------------------------
  function queueView(e: QEntry): QueueView { return { waitedMs: Math.max(0, now() - e.since), size: entryMembers(e).length }; }
  function entryMembers(e: QEntry): Member[] {
    if (e.solo) return [e.solo];
    const room = rooms.get(e.party!); if (!room) return [];
    return SEATS.filter(id => room.seats.has(id)).map(id => { const s = room.seats.get(id)!; return { peer: s.peer, userId: s.userId, name: s.name, guest: s.guest }; });
  }
  const entryOnline = (e: QEntry) => { const m = entryMembers(e); return m.length > 0 && m.every(x => x.peer); };
  function addEntry(e: QEntry) {
    queue.push(e); queue.sort((x, y) => x.since - y.since || x.id - y.id);
    if (e.solo) { queuedUsers.set(e.solo.userId, e); const p = e.solo.peer ? peers.get(e.solo.peer) : undefined; if (p) p.queued = e; }
    else rooms.get(e.party!)!.queued = e;
  }
  function dropEntry(e: QEntry) {
    const i = queue.indexOf(e); if (i >= 0) queue.splice(i, 1);
    if (e.solo) { if (queuedUsers.get(e.solo.userId) === e) queuedUsers.delete(e.solo.userId); const p = e.solo.peer ? peers.get(e.solo.peer) : undefined; if (p?.queued === e) p.queued = null; }
    else { const room = rooms.get(e.party!); if (room?.queued === e) room.queued = null; }
  }
  function soloStatus(e: QEntry, reason?: 'returned') { send(e.solo!.peer, { type: 'queue', queue: queueView(e), ...(reason ? { reason } : {}) }); }
  /** Match when two teams can be formed. Parties are never split; party + party first, then arrival order (§6.2). */
  function matchQueue() {
    for (;;) {
      const live = queue.filter(entryOnline), size = (e: QEntry) => entryMembers(e).length;
      const full = live.filter(e => size(e) === 2), single = live.filter(e => size(e) === 1);
      let teams: QEntry[][] | null = null;
      if (full.length >= 2) teams = [[full[0]], [full[1]]];
      else {
        const units = full.map(e => [e]);
        for (let i = 0; i + 1 < single.length; i += 2) units.push([single[i], single[i + 1]]);
        units.sort((x, y) => x[0].since - y[0].since || x[0].id - y[0].id);
        if (units.length >= 2) teams = [units[0], units[1]];
      }
      if (!teams) return;
      startMatched(teams);
    }
  }
  /** Take every member out of the queue (and out of its party room) and seat them in a new matched room. */
  function startMatched(teams: QEntry[][]) {
    const room = newRoom('2v2', 'queue'), arrivals: [string, Seat][] = [];
    teams.forEach((unit, team) => {
      const free = SEATS_OF['2v2'].filter(id => teamOf(id) === team);
      for (const e of unit) {
        const members = entryMembers(e); dropEntry(e);
        if (e.party) { const party = rooms.get(e.party)!; for (const id of [...party.seats.keys()]) removeSeat(party, id); }
        room.groups.push({ party: !!e.party, since: e.since, userIds: members.map(m => m.userId) });
        for (const m of members) {
          const seat = makeSeat(free.shift()!, m); room.seats.set(seat.id, seat); userRooms.set(seat.userId, room.code); arrivals.push([m.peer!, seat]);
        }
      }
    });
    room.phase = 'countdown'; room.countdownEnd = now() + NET.queueCountdownMs;
    for (const [peerId, seat] of arrivals) seatPeer(peerId, room, seat);
    broadcastRoom(room); log('queue.matched', { code: room.code, groups: room.groups.map(g => g.userIds.length) });
  }
  /** Close a room without telling its seated players (they are being moved elsewhere). Spectators are told. */
  function quietClose(room: Room) {
    for (const seat of room.seats.values()) { releaseUser(room, seat); detach(seat.peer); }
    room.seats.clear(); closeRoom(room, 'moved');
  }
  /** The connected members of each arrival group of a matched room. */
  function groupMembers(room: Room) {
    return room.groups.map(g => ({ g, members: g.userIds.map(u => [...room.seats.values()].find(s => s.userId === u))
      .filter((s): s is Seat => !!s && !!s.peer && !s.forfeited).map(s => ({ peer: s.peer, userId: s.userId, name: s.name, guest: s.guest })) }));
  }
  /** A party gets its own private 2v2 room back (team 0, first member hosts), optionally still queued. */
  function restoreParty(members: Member[], since: number | null) {
    const room = newRoom('2v2', 'private'), seats = members.map((m, i) => makeSeat(i ? 'a2' : 'a', m));
    for (const seat of seats) { room.seats.set(seat.id, seat); userRooms.set(seat.userId, room.code); }
    if (since !== null) addEntry({ id: ++entryIds, since, solo: null, party: room.code });
    seats.forEach((seat, i) => seatPeer(members[i].peer!, room, seat));
    broadcastRoom(room);
  }
  /** Someone dropped or left during the matched countdown: cancel; the others go back to their old place (§6.2). */
  function cancelMatched(room: Room) {
    const back = groupMembers(room); quietClose(room);
    for (const { g, members } of back) {
      if (!members.length) continue;
      if (g.party) { restoreParty(members, g.since); continue; }
      const m = members[0], e: QEntry = { id: ++entryIds, since: g.since, solo: { ...m, offlineSince: null }, party: null };
      addEntry(e); soloStatus(e, 'returned');
    }
    log('queue.cancelled', { code: room.code }); matchQueue();
  }
  /** Matched room after its rematch window: parties go back to a private room together, solo players to the menu. */
  function dissolve(room: Room) {
    const back = groupMembers(room); quietClose(room);
    for (const { g, members } of back) {
      if (!members.length) continue;
      if (g.party && members.length) restoreParty(members, null); else for (const m of members) send(m.peer, { type: 'left' });
    }
  }
  function queueSolo(peerId: string, who: Identity) {
    if (who.guest && !options.guestQueue) return fail(peerId, 'AUTH_REQUIRED');
    const userId = who.guest ? `guest:${hex(8)}` : who.userId, waiting = queuedUsers.get(userId);
    if (waiting?.solo && !waiting.solo.peer) { // same account back within the drop window keeps its place
      waiting.solo.peer = peerId; waiting.solo.offlineSince = null; peers.get(peerId)!.queued = waiting; soloStatus(waiting); matchQueue(); return;
    }
    if (waiting || userRooms.has(userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    const e: QEntry = { id: ++entryIds, since: now(), solo: { peer: peerId, userId, name: who.name, guest: who.guest, offlineSince: null }, party: null };
    addEntry(e); soloStatus(e); log('queue.solo', { userId }); matchQueue();
  }
  function queueParty(peerId: string, room: Room, seat: Seat) {
    if (room.host !== seat.id) return fail(peerId, 'NOT_HOST');
    const seats = [...room.seats.values()];
    if (room.kind !== 'private' || room.format !== '2v2' || room.phase !== 'lobby' || room.queued || new Set(seats.map(s => teamOf(s.id))).size !== 1 || seats.some(s => !s.peer))
      return fail(peerId, 'QUEUE_INVALID');
    if (!options.guestQueue && seats.some(s => s.guest)) return fail(peerId, 'AUTH_REQUIRED');
    for (const s of seats) s.ready = false;
    addEntry({ id: ++entryIds, since: now(), solo: null, party: room.code }); broadcastRoom(room); log('queue.party', { code: room.code, size: seats.length }); matchQueue();
  }

  /** Synchronous when the authenticator is; a Promise only while waiting on a remote token check. */
  type Admission = Extract<ClientMessage, { type: 'create' | 'join' | 'resume' | 'queue' }>;
  function admit(peerId: string, msg: Admission): void | Promise<void> {
    const peer = peers.get(peerId)!;
    if (msg.protocol !== PROTOCOL) return fail(peerId, 'PROTOCOL_MISMATCH', true);
    if (peer.code || peer.queued) return fail(peerId, 'ALREADY_IN_ROOM');
    let who: Identity | null | Promise<Identity | null>;
    try { who = authenticate(msg.token, 'name' in msg ? msg.name : undefined); } catch { who = null; }
    if (who && typeof (who as Promise<Identity | null>).then === 'function') {
      return (who as Promise<Identity | null>).catch(() => null).then(resolved => seatIdentity(peerId, msg, resolved));
    }
    seatIdentity(peerId, msg, who as Identity | null);
  }
  function seatIdentity(peerId: string, msg: Admission, who: Identity | null) {
    if (!peers.has(peerId)) return; // disconnected while authenticating
    if (peers.get(peerId)!.code || peers.get(peerId)!.queued) return fail(peerId, 'ALREADY_IN_ROOM');
    if (!who) return fail(peerId, msg.token ? 'AUTH_FAILED' : 'AUTH_REQUIRED', msg.type !== 'queue');
    // Everything below runs synchronously after the await, so seat claims and queue entries are atomic.
    if (msg.type === 'queue') return queueSolo(peerId, who);
    if (!who.guest && queuedUsers.has(who.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    if (msg.type === 'create') {
      if (!who.guest && userRooms.has(who.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
      const room = newRoom(msg.format ?? '1v1', 'private');
      const seat = makeSeat('a', who); room.seats.set('a', seat); if (!who.guest) userRooms.set(seat.userId, room.code);
      seatPeer(peerId, room, seat); log('room.created', { code: room.code, format: room.format }); return;
    }
    const code = normalizeCode(msg.code), room = code ? rooms.get(code) : undefined;
    if (!room || room.phase === 'closed') return fail(peerId, code ? 'ROOM_NOT_FOUND' : 'BAD_MESSAGE');
    if (msg.type === 'resume') {
      const same = (token: string) => token.length === msg.resumeToken.length && token === msg.resumeToken;
      const watcher = [...room.spectators.values()].find(v => same(v.token));
      if (watcher) { watchPeer(peerId, room, watcher); broadcastRoom(room); return; }
      const seat = [...room.seats.values()].find(s => same(s.token));
      if (!seat || seat.forfeited || (!seat.peer && now() - seat.lastSeen >= NET.seatHoldMs)) return fail(peerId, 'RESUME_INVALID');
      if (!seat.guest && !(who.userId === seat.userId)) return fail(peerId, 'AUTH_FAILED');
      seatPeer(peerId, room, seat); broadcastRoom(room); log('seat.resumed', { code: room.code, seat: seat.id }); return;
    }
    if (!who.guest && [...room.seats.values()].some(s => s.userId === who!.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    if (msg.as === 'spectator') { // allowed in any phase; does not hold a seat or block the account elsewhere
      if (room.spectators.size >= NET.spectatorsMax) return fail(peerId, 'ROOM_FULL');
      const v: Spectator = { token: hex(24), name: who.name, peer: null, lastSeen: now() }; room.spectators.set(v.token, v);
      watchPeer(peerId, room, v); broadcastRoom(room); log('room.spectator', { code: room.code }); return;
    }
    if (room.kind === 'queue' || (room.phase !== 'lobby' && room.phase !== 'finished')) return fail(peerId, 'ROOM_IN_PROGRESS');
    if (room.queued) return fail(peerId, 'ROOM_QUEUED');
    if (!who.guest && userRooms.has(who.userId)) return fail(peerId, 'ALREADY_IN_ROOM');
    const id = JOIN_ORDER[room.format].find(s => !room.seats.has(s)); if (!id) return fail(peerId, 'ROOM_FULL');
    const seat = makeSeat(id, who); room.seats.set(id, seat); if (!who.guest) userRooms.set(seat.userId, room.code);
    if (room.phase === 'finished') { room.phase = 'lobby'; room.result = null; }
    seatPeer(peerId, room, seat); broadcastRoom(room); log('room.joined', { code: room.code, seat: id });
  }
  function onInput(room: Room, seat: Seat, msg: Extract<ClientMessage, { type: 'input' }>) {
    const t = now();
    msg.inputs.forEach((input, i) => {
      const seq = msg.seq + i; if (seq <= seat.seq) return; // duplicate or replayed
      seat.seq = seq;
      if (room.phase !== 'playing' || seat.forfeited) { seat.ack = seq; return; } // discarded outside a match, but acknowledged
      seat.queue.push({ seq, input: { x: input.x, y: input.y, aim: input.aim, fire: input.fire, shield: input.shield } }); seat.lastInputAt = t;
      while (seat.queue.length > NET.inputQueueMax) { // too far behind: merge the oldest so a pulse is never lost
        const old = seat.queue.shift()!, next = seat.queue[0]; next.input.fire ||= old.input.fire; next.input.shield ||= old.input.shield; seat.ack = old.seq;
      }
    });
  }
  const inLobby = (room: Room) => room.phase === 'lobby' || room.phase === 'finished' || room.phase === 'countdown';

  return {
    metrics,
    connect(peerId: string, handle: PeerHandle) { peers.set(peerId, { handle, code: null, seat: null, spectator: null, queued: null, windowAt: now(), messages: 0, busy: false }); },
    message(peerId: string, raw: unknown): void | Promise<void> {
      const peer = peers.get(peerId); if (!peer) return;
      const t = now(); if (t - peer.windowAt >= 1000) { peer.windowAt = t; peer.messages = 0; }
      if (++peer.messages > NET.messagesPerSecond) { metrics.rateLimited++; if (peer.messages > NET.messagesPerSecond * 2) fail(peerId, 'RATE_LIMITED', true); return; }
      const msg = parseClientMessage(raw); if (!msg) return fail(peerId, 'BAD_MESSAGE');
      if (msg.type === 'ping') { send(peerId, { type: 'pong', at: msg.at, serverTime: t, tick: peer.code ? rooms.get(peer.code)?.state?.tick ?? 0 : 0 }); return; }
      if (msg.type === 'unqueue' && peer.queued) { const e = peer.queued; dropEntry(e); send(peerId, { type: 'queue', queue: null, reason: 'unqueued' }); return; }
      if (msg.type === 'create' || msg.type === 'join' || msg.type === 'resume' || (msg.type === 'queue' && !peer.code)) {
        if (msg.type === 'queue' && msg.protocol === undefined) return fail(peerId, 'BAD_MESSAGE');
        if (peer.busy) return fail(peerId, 'BAD_MESSAGE');
        const pending = admit(peerId, msg); if (!pending) return;
        peer.busy = true; return pending.finally(() => { const p = peers.get(peerId); if (p) p.busy = false; });
      }
      const room = peer.code ? rooms.get(peer.code) : undefined;
      if (room && peer.spectator) { // spectators may only leave; anything else is refused without disconnecting
        const v = room.spectators.get(peer.spectator); if (!v || v.peer !== peerId) return fail(peerId, 'NOT_IN_ROOM');
        v.lastSeen = t;
        if (msg.type !== 'leave') return fail(peerId, 'BAD_MESSAGE');
        room.spectators.delete(v.token); detach(peerId); send(peerId, { type: 'left' }); broadcastRoom(room); return;
      }
      const seat = room && peer.seat ? room.seats.get(peer.seat) : undefined;
      if (!room || !seat || seat.peer !== peerId) return fail(peerId, 'NOT_IN_ROOM');
      seat.lastSeen = t;
      if (msg.type === 'input') return onInput(room, seat, msg);
      room.lastActivity = t;
      if (msg.type === 'ready') { if (inLobby(room)) { seat.ready = msg.ready; maybeCountdown(room); } return; }
      if (msg.type === 'queue') return queueParty(peerId, room, seat);
      if (msg.type === 'unqueue') { if (!room.queued) return fail(peerId, 'WRONG_PHASE'); dropEntry(room.queued); broadcastRoom(room); return; }
      if (msg.type === 'team') {
        if (!inLobby(room) || room.kind === 'queue' || room.queued) return fail(peerId, 'WRONG_PHASE');
        if (!moveSeat(room, seat, msg.team)) return fail(peerId, 'TEAM_FULL');
        seat.ready = false; maybeCountdown(room); return;
      }
      if (msg.type === 'move') {
        if (room.host !== seat.id) return fail(peerId, 'NOT_HOST');
        if (!inLobby(room) || room.queued) return fail(peerId, 'WRONG_PHASE');
        const target = room.seats.get(msg.seat); if (!target) return fail(peerId, 'BAD_MESSAGE');
        if (!moveSeat(room, target, msg.team)) return fail(peerId, 'TEAM_FULL');
        for (const s of room.seats.values()) s.ready = false; // the host changed the line-up: everyone confirms again
        maybeCountdown(room); return;
      }
      if (msg.type === 'surrender') {
        if (room.phase !== 'playing' || seat.forfeited) return fail(peerId, 'WRONG_PHASE');
        const team = teamOf(seat.id), mates = [...room.seats.values()].filter(s => s !== seat && teamOf(s.id) === team);
        if (mates.some(s => !s.forfeited && s.peer)) return fail(peerId, 'SURRENDER_LOCKED');
        surrender(room.state!, team); finish(room, 'surrender', room.state!.winner); return;
      }
      if (msg.type === 'leave') {
        if (room.phase === 'playing') { // leaving a running match forfeits this player at once; team-mates play on
          seat.peer = null; seat.lastSeen = -Infinity; detach(peerId); send(peerId, { type: 'left' });
          forfeitSeats(room, [seat]); return;
        }
        removeSeat(room, seat.id); send(peerId, { type: 'left' });
      }
    },
    disconnect(peerId: string) {
      const peer = peers.get(peerId); peers.delete(peerId);
      if (peer?.queued?.solo) { peer.queued.solo.peer = null; peer.queued.solo.offlineSince = now(); return; } // keeps its place for NET.queueDropMs
      if (!peer?.code) return;
      const room = rooms.get(peer.code); if (!room) return;
      if (peer.spectator) { const v = room.spectators.get(peer.spectator); if (v && v.peer === peerId) { v.peer = null; v.lastSeen = now(); broadcastRoom(room); } return; }
      const seat = peer.seat ? room.seats.get(peer.seat) : undefined;
      if (!seat || seat.peer !== peerId) return;
      // Disconnected tanks keep simulating with neutral input and can still be hit (no invulnerability).
      seat.peer = null; seat.lastSeen = now(); seat.queue = []; seat.ready = false; seat.lastInputAt = 0;
      broadcastRoom(room);
    },
    advance(t = now()) {
      for (const e of [...queue]) if (e.solo && !e.solo.peer && t - e.solo.offlineSince! >= NET.queueDropMs) dropEntry(e);
      for (const room of [...rooms.values()]) if (rooms.get(room.code) === room) advanceRoom(room, t);
      matchQueue();
    },
    /** Inspection: queued units in order. */
    queue: () => queue.map(e => ({ since: e.since, party: e.party, members: entryMembers(e).map(m => m.userId), online: entryOnline(e) })),
    rooms: () => [...rooms.values()].map(r => ({ code: r.code, kind: r.kind, format: r.format, phase: r.phase, seats: r.seats.size, spectators: r.spectators.size, matchId: r.matchId, tick: r.state?.tick ?? 0 })),
    /** Counts only: no identities/tokens in operational metrics. */
    diagnostics: () => ({ rooms: rooms.size, peers: peers.size, users: userRooms.size, queueEntries: queue.length, queuedUsers: queuedUsers.size }),
    /** Test/inspection only: the live authoritative state of a room. */
    inspect(code: string) { return rooms.get(code)?.state ?? null; },
  };
}
export type RoomHost = ReturnType<typeof createRoomHost>;
