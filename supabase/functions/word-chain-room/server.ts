/**
 * Authoritative word-chain room core (2–4 seats), modelled on duel/server.ts and battleship.
 * Import on a trusted server only (the `word-chain-room` Edge Function); clients get roomView().
 * Every accepted change bumps `version` through an atomic compare-and-swap, commands are
 * idempotent per actionId, a seat unseen for RECONNECT_MS is eliminated (not the whole room),
 * and words are checked here against the same dictionary the browser uses.
 */
import {advanceTime,createMatch,forfeit,setReady,submitWord,RuleError,SEATS,type Check,type Dictionary,type Match,type Seat} from './rules.ts';

export const RECONNECT_MS = 90_000, WAITING_MS = 600_000, AUTOSTART_MS = 20_000, REMATCH_MS = 60_000;
export const REACTIONS = ['👏', '😂', '😮', '🔥', '😭', '🤯'] as const;
const MAX_RECEIPTS = 200, MAX_REACTIONS = 12, REACTION_GAP_MS = 2_000;

export type Room = {
  id: string; code: string; version: number; status: 'waiting' | 'active' | 'closed';
  public: boolean; capacity: number; host: Seat;
  members: Partial<Record<Seat, string>>; names: Partial<Record<Seat, string>>; lastSeen: Partial<Record<Seat, number>>;
  /** Public rooms: when the second player arrived (the room starts AUTOSTART_MS later). */
  pairAt?: number;
  match: Match | null; createdAt: number; closedAt?: number;
  closeReason?: 'abandoned' | 'expired' | 'finished';
  rematch?: {votes: Seat[]; until: number};
  reactions: {seat: Seat; emoji: string; at: number}[];
  /** Seats whose absence was applied; the store rejects the write if any was seen after `cutoff`. */
  expiryGuard?: {cutoff: number; seats: Seat[]};
  receipts: {id: string; actor: string; fingerprint: string; version: number}[];
};
export interface RoomStore {
  /** Must enforce one active room per identity. */
  create(room: Room): Promise<Room>;
  read(id: string): Promise<Room | null>;
  byCode(code: string): Promise<Room | null>;
  /** Atomic version check and replace (null when the version moved on or an expiryGuard seat was
   * seen after its cutoff). Strips the guard and keeps the newest lastSeen per seat. */
  cas(expectedVersion: number, next: Room): Promise<Room | null>;
  due(now: number): Promise<Room[]>;
  /** Presence pulse without a version change. */
  touch?(id: string, uid: string, now: number): Promise<Room | null>;
  /** Matchmaking: seat the player in the oldest open public room, or create `fresh`. */
  match?(uid: string, fresh: Room, name: string, now: number): Promise<Room>;
}
export type Command =
  | {type: 'ready'; ready: boolean} | {type: 'submit'; word: string; turn: number}
  | {type: 'start'} | {type: 'forfeit'} | {type: 'leave'} | {type: 'rematch'} | {type: 'react'; emoji: string};

export class RoomError extends Error {constructor(public code: string, message: string) {super(message);}}
const deny = (code: string, message: string): never => {throw new RoomError(code, message);};
const seatOf = (room: Room, uid: string): Seat | null => (Object.entries(room.members) as [Seat, string][]).find(([, m]) => m === uid)?.[0] ?? null;
const memberSeat = (room: Room, uid: string): Seat => seatOf(room, uid) ?? deny('NOT_MEMBER', 'Bạn không có quyền vào phòng này.');
const seatsIn = (room: Room) => SEATS.filter(s => room.members[s]);
export const cleanName = (raw: unknown) => String(raw ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 18) || 'Người chơi';

export function newRoom(o: {id: string; code: string; uid: string; name: string; capacity: number; public: boolean; now: number}): Room {
  if (!o.uid || !o.id || !/^[A-Z2-9]{6}$/.test(o.code)) deny('BAD_REQUEST', 'Mã phòng không hợp lệ.');
  if (!Number.isInteger(o.capacity) || o.capacity < 2 || o.capacity > 4) deny('BAD_CAPACITY', 'Phòng có 2–4 người.');
  return {id: o.id, code: o.code, version: 0, status: 'waiting', public: o.public, capacity: o.capacity, host: 'P1',
    members: {P1: o.uid}, names: {P1: cleanName(o.name)}, lastSeen: {P1: o.now}, match: null, createdAt: o.now, reactions: [], receipts: []};
}

/** What one member may see: no UIDs, no match seed. */
export function roomView(room: Room, uid: string) {
  const seat = memberSeat(room, uid);
  const match = room.match ? {...room.match, seed: 0} : null;
  return {
    id: room.id, code: room.code, version: room.version, status: room.status, seat, host: room.host,
    public: room.public, capacity: room.capacity, closeReason: room.closeReason ?? null,
    roster: SEATS.filter(s => room.members[s] || room.match?.players.some(p => p.seat === s)).map(s => ({seat: s, name: room.names[s] ?? s, present: !!room.members[s], lastSeen: room.lastSeen[s] ?? room.createdAt})),
    autoStartAt: room.public && room.status === 'waiting' && room.pairAt ? room.pairAt + AUTOSTART_MS : null,
    rematch: room.rematch ?? null, reactions: room.reactions, match,
    connection: {ownLastSeen: room.lastSeen[seat] ?? room.createdAt, graceMs: RECONNECT_MS},
  };
}
export type RoomView = ReturnType<typeof roomView>;

export class WordChainRoomServer {
  constructor(private store: RoomStore, private dict: Dictionary, private seed: () => number = () => crypto.getRandomValues(new Uint32Array(1))[0]) {}

  async create(uid: string, id: string, code: string, name: string, capacity: number, now: number) {
    const room = await this.store.create(newRoom({id, code, uid, name, capacity, public: false, now}));
    return this.snapshot(uid, room.id, now);
  }

  async match(uid: string, id: string, code: string, name: string, now: number) {
    if (!this.store.match) return deny('UNAVAILABLE', 'Ghép trận chưa bật.');
    const room = await this.store.match(uid, newRoom({id, code, uid, name, capacity: 4, public: true, now}), cleanName(name), now);
    return this.snapshot(uid, room.id, now);
  }

  async join(uid: string, rawCode: string, name: string, now: number) {
    const code = String(rawCode ?? '').trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) deny('BAD_CODE', 'Mã phòng phải gồm 6 ký tự.');
    for (let i = 0; i < 8; i++) {
      const room = await this.store.byCode(code);
      if (!room) return deny('NOT_FOUND', 'Phòng không tồn tại hoặc đã hết hạn.');
      if (seatOf(room, uid)) return this.snapshot(uid, room.id, now);
      const settled = this.expire(room, now);
      if (settled !== room) {await this.store.cas(room.version, settled); continue;}
      if (room.public) deny('QUEUE_ONLY', 'Phòng ghép trận không nhận mã.');
      if (room.status !== 'waiting') deny(room.status === 'closed' ? 'ROOM_CLOSED' : 'ROOM_STARTED', room.status === 'closed' ? 'Phòng đã đóng.' : 'Trận đã bắt đầu.');
      const seat = SEATS.slice(0, room.capacity).find(s => !room.members[s]);
      if (!seat) return deny('ROOM_FULL', 'Phòng đã đủ người.');
      let next: Room = {...room, version: room.version + 1, members: {...room.members, [seat]: uid}, names: {...room.names, [seat]: cleanName(name)}, lastSeen: {...room.lastSeen, [seat]: now}};
      if (seatsIn(next).length >= room.capacity) next = this.start(next, now);
      const saved = await this.store.cas(room.version, next);
      if (saved) return roomView(saved, uid);
    }
    return deny('CONFLICT', 'Phòng đang thay đổi. Hãy thử lại.');
  }

  async snapshot(uid: string, id: string, now: number) {
    for (let i = 0; i < 8; i++) {
      const room = await this.store.read(id);
      if (!room) return deny('NOT_FOUND', 'Phòng không tồn tại.');
      const seat = memberSeat(room, uid);
      const next = this.expire(room, now);
      if (next === room) return roomView((await this.store.touch?.(id, uid, now)) ?? room, uid);
      if (next.status !== 'closed' && next.members[seat]) next.lastSeen = {...next.lastSeen, [seat]: now};
      const saved = await this.store.cas(room.version, next);
      if (saved && seatOf(saved, uid)) return roomView(saved, uid);
      if (saved) return deny('LEFT_ROOM', 'Bạn đã rời phòng.');
    }
    return deny('CONFLICT', 'Phòng đang đồng bộ. Hãy thử lại.');
  }

  async command(uid: string, id: string, version: number, actionId: string, command: Command, now: number): Promise<RoomView & {duplicate: boolean; acceptedVersion: number; result?: Check}> {
    if (typeof actionId !== 'string' || !actionId || actionId.length > 128) deny('BAD_ACTION', 'Mã thao tác không hợp lệ.');
    if (!command || typeof command !== 'object') deny('BAD_COMMAND', 'Lệnh không hợp lệ.');
    const fingerprint = JSON.stringify(command);
    for (let i = 0; i < 8; i++) {
      let room = await this.store.read(id);
      if (!room) return deny('NOT_FOUND', 'Phòng không tồn tại.');
      const seat = memberSeat(room, uid);
      const receipt = room.receipts.find(r => r.id === actionId && r.actor === uid);
      if (receipt) {
        if (receipt.fingerprint !== fingerprint) deny('ACTION_REUSED', 'Không được dùng lại mã thao tác cho lệnh khác.');
        return {...roomView(room, uid), duplicate: true, acceptedVersion: receipt.version};
      }
      const settled = this.expire(room, now);
      if (settled !== room) {
        if (settled.status !== 'closed' && settled.members[seat]) settled.lastSeen = {...settled.lastSeen, [seat]: now};
        if (!(await this.store.cas(room.version, settled))) continue;
        return deny('EXPIRED', 'Trạng thái đã đổi theo thời gian. Hãy đồng bộ rồi thử lại.');
      }
      room = (await this.store.touch?.(id, uid, now)) ?? room;
      if (!Number.isInteger(version) || version !== room.version) deny('VERSION_CONFLICT', 'Phòng đã thay đổi. Hãy đồng bộ trước khi thử lại.');
      const {next, result} = this.apply(room, seat, command, now);
      next.version = room.version + 1;
      next.receipts = [...room.receipts, {id: actionId, actor: uid, fingerprint, version: next.version}].slice(-MAX_RECEIPTS);
      const saved = await this.store.cas(room.version, next);
      if (saved) return {...(seatOf(saved, uid) ? roomView(saved, uid) : {...roomView(room, uid), status: 'closed' as const}), duplicate: false, acceptedVersion: saved.version, result};
    }
    return deny('CONFLICT', 'Có thao tác đồng thời. Hãy đồng bộ rồi thử lại.');
  }

  private apply(room: Room, seat: Seat, c: Command, now: number): {next: Room; result?: Check} {
    const next: Room = {...room};
    const m = room.match, playing = m && m.phase !== 'finished';
    switch (c.type) {
      case 'start':
        if (room.status !== 'waiting' || room.public) deny('NOT_WAITING', 'Phòng không ở trạng thái chờ.');
        if (seat !== room.host) deny('HOST_ONLY', 'Chỉ chủ phòng được bắt đầu.');
        if (seatsIn(room).length < 2) deny('NEED_PLAYERS', 'Cần ít nhất 2 người.');
        return {next: this.start(next, now)};
      case 'ready':
        if (!m || m.phase !== 'ready' || typeof c.ready !== 'boolean') deny('NOT_READY_PHASE', 'Không ở giai đoạn chuẩn bị.');
        next.match = setReady(m!, seat, c.ready, now, this.dict); return {next: this.settleMatch(next, now)};
      case 'submit': {
        if (!m || m.phase !== 'turn') throw new RuleError('NOT_PLAYING', 'Chưa đến lúc trả lời.');
        if (typeof c.word !== 'string' || c.word.length > 60) deny('BAD_WORD', 'Từ không hợp lệ.');
        if (c.turn !== m.turnNumber) throw new RuleError('NOT_YOUR_TURN', 'Lượt đã đổi.');
        const r = submitWord(m, seat, c.word, now, this.dict);
        next.match = r.match; return {next: this.settleMatch(next, now), result: r.result};
      }
      case 'forfeit':
        if (!playing) deny('NOT_PLAYING', 'Không có trận đang diễn ra.');
        next.match = forfeit(m!, seat, 'forfeit', now, this.dict); return {next: this.settleMatch(next, now)};
      case 'leave':
        return {next: this.remove(next, [seat], playing ? 'forfeit' : null, now)};
      case 'rematch': {
        if (!m || m.phase !== 'finished' || !room.rematch || now >= room.rematch.until) deny('NO_REMATCH', 'Không thể tái đấu lúc này.');
        const votes = [...new Set([...room.rematch!.votes, seat])];
        next.rematch = {...room.rematch!, votes};
        if (seatsIn(room).length >= 2 && seatsIn(room).every(s => votes.includes(s))) return {next: this.start({...next, rematch: undefined}, now)};
        return {next};
      }
      case 'react': {
        if (!REACTIONS.includes(c.emoji as typeof REACTIONS[number])) deny('BAD_REACTION', 'Biểu cảm không hỗ trợ.');
        const last = [...room.reactions].reverse().find(r => r.seat === seat);
        if (last && now - last.at < REACTION_GAP_MS) deny('TOO_FAST', 'Chậm lại một chút.');
        next.reactions = [...room.reactions, {seat, emoji: c.emoji, at: now}].slice(-MAX_REACTIONS); return {next};
      }
      default: return deny('BAD_COMMAND', 'Lệnh không được hỗ trợ.');
    }
  }

  /** A new match for everyone in the room (30 s ready check). */
  private start(room: Room, now: number): Room {
    const players = seatsIn(room).map(seat => ({seat, name: room.names[seat] ?? seat}));
    return {...room, status: 'active', pairAt: undefined, rematch: undefined, reactions: [], match: createMatch(players, now, this.seed())};
  }

  /** Room consequences of the match state: unready players leave, a failed ready check goes back
   * to waiting, a finished match opens the rematch vote. */
  private settleMatch(room: Room, now: number): Room {
    const m = room.match; if (!m) return room;
    const unready = m.players.filter(p => p.out?.reason === 'unready' && room.members[p.seat]).map(p => p.seat);
    let next = unready.length ? this.remove(room, unready, null, now) : room;
    if (next.status === 'closed' || !next.match) return next;
    if (next.match.phase === 'finished' && next.match.reason === 'not-enough-ready')
      return {...next, status: 'waiting', match: null, pairAt: next.public && seatsIn(next).length >= 2 ? now : undefined};
    if (next.match.phase === 'finished' && !next.rematch) next = {...next, rematch: {votes: [], until: now + REMATCH_MS}};
    return next;
  }

  /** Seats leave the room (by choice, unready or absent); in a live match they are eliminated. */
  private remove(room: Room, seats: Seat[], reason: 'forfeit' | 'absent' | null, now: number): Room {
    const members = {...room.members}, lastSeen = {...room.lastSeen};
    let match = room.match;
    for (const seat of seats) {
      delete members[seat]; delete lastSeen[seat];
      if (reason && match && match.phase !== 'finished' && match.players.some(p => p.seat === seat && !p.out)) match = forfeit(match, seat, reason, now, this.dict);
    }
    const left = SEATS.filter(s => members[s]);
    let next: Room = {...room, members, lastSeen, match, host: left.includes(room.host) ? room.host : left[0] ?? room.host};
    if (!left.length) return {...next, status: 'closed', closedAt: now, closeReason: 'abandoned'};
    if (next.status === 'waiting') next.pairAt = next.public && left.length >= 2 ? next.pairAt ?? now : undefined;
    if (next.rematch) next.rematch = {...next.rematch, votes: next.rematch.votes.filter(v => left.includes(v))};
    return match === room.match ? next : this.settleMatch(next, now);
  }

  /** Time-based outcomes: absences, ready/turn deadlines, public auto-start, stale rooms. */
  private expire(room: Room, now: number): Room {
    if (room.status === 'closed') return room;
    const absent = seatsIn(room).filter(s => (room.lastSeen[s] ?? room.createdAt) <= now - RECONNECT_MS);
    if (absent.length) {
      const next = this.remove(room, absent, 'absent', now);
      return {...next, version: room.version + 1, expiryGuard: {cutoff: now - RECONNECT_MS, seats: absent}};
    }
    if (room.status === 'waiting') {
      if (now - room.createdAt >= WAITING_MS) return {...room, status: 'closed', closedAt: now, closeReason: 'expired', version: room.version + 1};
      if (room.public && room.pairAt !== undefined && seatsIn(room).length >= 2 && now >= room.pairAt + AUTOSTART_MS) return {...this.start(room, room.pairAt + AUTOSTART_MS), version: room.version + 1};
      if (seatsIn(room).length >= room.capacity) return {...this.start(room, now), version: room.version + 1};
      return room;
    }
    if (room.match?.phase === 'finished') {
      if (room.rematch && now >= room.rematch.until) return {...room, status: 'closed', closedAt: now, closeReason: 'finished', version: room.version + 1};
      return room;
    }
    if (!room.match) return room;
    const match = advanceTime(room.match, now, this.dict);
    if (match === room.match) return room;
    return {...this.settleMatch({...room, match}, now), version: room.version + 1};
  }

  /** Scheduler entry point: settles deadlines and absences with nobody connected. */
  async tick(now: number) {
    let updated = 0;
    for (const room of await this.store.due(now)) {
      const next = this.expire(room, now);
      if (next !== room && (await this.store.cas(room.version, next))) updated++;
    }
    return {updated};
  }
}

/** When the scheduler next has to look at a room (mirrors wc_room_due in SQL). */
export function nextDeadline(room: Room): number | null {
  if (room.status === 'closed') return null;
  if (room.status === 'waiting') return Math.min(room.createdAt + WAITING_MS, room.public && room.pairAt !== undefined ? room.pairAt + AUTOSTART_MS : Infinity);
  if (room.match?.phase === 'finished') return room.rematch?.until ?? null;
  return room.match?.deadline ?? null;
}
