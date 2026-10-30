/**
 * Authoritative duel room core for Chess, Xiangqi and Caro, modelled on battleship/server.ts.
 * Import on a trusted server only (the `duel-room` Edge Function); clients receive roomView().
 * Every accepted change bumps `version` through an atomic compare-and-swap, commands are
 * idempotent per actionId, and a seat unseen for RECONNECT_MS forfeits.
 */
import { advanceTime, applyMove, createDuel, forfeitAbsent, offerDraw, other, resign, respondDraw, type DuelGame, type DuelMoveInput, type DuelState, type Seat } from './rules.ts';

export const RECONNECT_MS = 90_000;
export const WAITING_MS = 600_000;
export const GAMES: DuelGame[] = ['chess', 'xiangqi', 'caro'];

export type Room = {
  id: string; code: string; version: number; game: DuelGame;
  status: 'waiting' | 'active' | 'closed';
  members: Partial<Record<Seat, string>>;
  lastSeen: Partial<Record<Seat, number>>;
  state: DuelState | null;
  createdAt: number; closedAt?: number;
  closeReason?: 'disconnect' | 'abandoned' | 'cancelled' | 'expired';
  /** Seats whose absence closed the room; the store rejects the write if any of them was seen after `cutoff`. */
  expiryGuard?: { cutoff: number; seats: Seat[] };
  receipts: { id: string; actor: string; fingerprint: string; version: number }[];
};
export interface RoomStore {
  /** Must enforce one active room per identity. */
  create(room: Room): Promise<Room>;
  read(id: string): Promise<Room | null>;
  byCode(code: string): Promise<Room | null>;
  /** Atomic version check and replace; returns null when the stored version moved on or an
   *  `expiryGuard` seat was seen after its cutoff. Strips the guard and keeps the latest lastSeen. */
  cas(expectedVersion: number, next: Room): Promise<Room | null>;
  due(now: number): Promise<Room[]>;
  /** Presence pulse without a gameplay version change. */
  touch?(id: string, uid: string, now: number): Promise<Room | null>;
}
export type Command =
  | { type: 'move'; move: DuelMoveInput }
  | { type: 'resign' } | { type: 'offer-draw' } | { type: 'answer-draw'; accept: boolean } | { type: 'leave' };

export class RoomError extends Error { constructor(public code: string, message: string) { super(message); } }
const deny = (code: string, message: string): never => { throw new RoomError(code, message); };
const MAX_RECEIPTS = 200;
const seatFor = (room: Room, uid: string): Seat =>
  (Object.entries(room.members) as [Seat, string][]).find(([, member]) => member === uid)?.[0] ?? deny('NOT_MEMBER', 'Bạn không có quyền vào phòng này.');
const withReceipt = (room: Room, receipt: Room['receipts'][number]) => [...room.receipts, receipt].slice(-MAX_RECEIPTS);

export function roomView(room: Room, uid: string) {
  const seat = seatFor(room, uid), opponent = other(seat);
  return {
    id: room.id, code: room.code, version: room.version, game: room.game, status: room.status, seat,
    closeReason: room.closeReason ?? null,
    opponentJoined: !!room.members[opponent],
    connection: { ownLastSeen: room.lastSeen[seat] ?? room.createdAt, opponentLastSeen: room.lastSeen[opponent] ?? room.createdAt, graceMs: RECONNECT_MS },
    state: room.state,
  };
}

export class DuelRoomServer {
  constructor(private store: RoomStore, private chooseFirst: () => Seat = () => (crypto.getRandomValues(new Uint8Array(1))[0] % 2 ? 'guest' : 'host')) {}

  async create(uid: string, id: string, code: string, game: DuelGame, now: number) {
    if (!uid || !id || !/^[A-Z2-9]{6}$/.test(code)) deny('BAD_REQUEST', 'Mã phòng không hợp lệ.');
    if (!GAMES.includes(game)) deny('BAD_GAME', 'Trò chơi không hỗ trợ phòng đấu.');
    const room = await this.store.create({ id, code, game, version: 0, status: 'waiting', members: { host: uid }, lastSeen: { host: now }, state: null, createdAt: now, receipts: [] });
    return this.snapshot(uid, room.id, now);
  }

  async join(uid: string, rawCode: string, now: number) {
    const code = String(rawCode ?? '').trim().toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) deny('BAD_CODE', 'Mã phòng phải gồm 6 ký tự.');
    for (let i = 0; i < 8; i++) {
      const room = await this.store.byCode(code);
      if (!room) return deny('NOT_FOUND', 'Phòng không tồn tại hoặc đã hết hạn.');
      if (Object.values(room.members).includes(uid)) return this.snapshot(uid, room.id, now);
      const expired = this.expire(room, now);
      if (expired !== room) { if (await this.store.cas(room.version, expired)) deny('ROOM_CLOSED', 'Phòng đã đóng.'); continue; }
      if (room.status !== 'waiting') deny(room.status === 'closed' ? 'ROOM_CLOSED' : 'ROOM_FULL', room.status === 'closed' ? 'Phòng đã đóng.' : 'Phòng đã đủ người.');
      const next: Room = { ...room, version: room.version + 1, status: 'active', members: { ...room.members, guest: uid }, lastSeen: { ...room.lastSeen, guest: now }, state: createDuel(room.game, now, { first: this.chooseFirst() }) };
      const saved = await this.store.cas(room.version, next);
      if (saved) return roomView(saved, uid);
    }
    return deny('CONFLICT', 'Phòng đang thay đổi. Hãy thử lại.');
  }

  async snapshot(uid: string, id: string, now: number) {
    for (let i = 0; i < 8; i++) {
      const room = await this.store.read(id);
      if (!room) return deny('NOT_FOUND', 'Phòng không tồn tại.');
      const seat = seatFor(room, uid);
      const next = this.expire(room, now);
      if (next === room) return roomView((await this.store.touch?.(id, uid, now)) ?? room, uid);
      if (next.status !== 'closed') next.lastSeen = { ...next.lastSeen, [seat]: now };
      const saved = await this.store.cas(room.version, next);
      if (saved) return roomView(saved, uid);
    }
    return deny('CONFLICT', 'Phòng đang đồng bộ. Hãy thử lại.');
  }

  async command(uid: string, id: string, version: number, actionId: string, command: Command, now: number) {
    if (typeof actionId !== 'string' || !actionId || actionId.length > 128) deny('BAD_ACTION', 'Mã thao tác không hợp lệ.');
    if (!command || typeof command !== 'object') deny('BAD_COMMAND', 'Lệnh không hợp lệ.');
    const fingerprint = JSON.stringify(command);
    for (let i = 0; i < 8; i++) {
      let room = await this.store.read(id);
      if (!room) return deny('NOT_FOUND', 'Phòng không tồn tại.');
      const seat = seatFor(room, uid);
      const receipt = room.receipts.find(r => r.id === actionId && r.actor === uid);
      if (receipt) {
        if (receipt.fingerprint !== fingerprint) deny('ACTION_REUSED', 'Không được dùng lại mã thao tác cho lệnh khác.');
        return { ...roomView(room, uid), duplicate: true, acceptedVersion: receipt.version };
      }
      const expired = this.expire(room, now);
      if (expired !== room) {
        if (expired.status !== 'closed') expired.lastSeen = { ...expired.lastSeen, [seat]: now };
        if (!(await this.store.cas(room.version, expired))) continue;
        return deny('EXPIRED', 'Hết giờ. Hãy tải trạng thái mới trước khi thao tác.');
      }
      room = (await this.store.touch?.(id, uid, now)) ?? room;
      if (!Number.isInteger(version) || version !== room.version) deny('VERSION_CONFLICT', 'Bàn đã thay đổi. Hãy đồng bộ trước khi thử lại.');
      let state = room.state, status = room.status, closeReason = room.closeReason;
      if (command.type === 'leave') {
        if (room.status === 'closed') deny('NOT_ACTIVE', 'Phòng đã kết thúc.');
        if (state?.status === 'active') state = resign(state, seat); else closeReason = 'cancelled';
        status = 'closed';
      } else {
        if (room.status !== 'active' || !state) return deny('NOT_ACTIVE', 'Phòng chưa bắt đầu hoặc đã kết thúc.');
        switch (command.type) {
          case 'move': state = applyMove(state, seat, command.move, now); break;
          case 'resign': state = resign(state, seat); break;
          case 'offer-draw': state = offerDraw(state, seat); break;
          case 'answer-draw':
            if (typeof command.accept !== 'boolean') deny('BAD_REQUEST', 'Câu trả lời không hợp lệ.');
            state = respondDraw(state, seat, command.accept); break;
          default: return deny('BAD_COMMAND', 'Lệnh không được hỗ trợ.');
        }
        if (state.status === 'ended') status = 'closed';
      }
      const next: Room = {
        ...room, state, status, closeReason, version: room.version + 1,
        ...(status === 'closed' ? { closedAt: now } : {}),
        receipts: withReceipt(room, { id: actionId, actor: uid, fingerprint, version: room.version + 1 }),
      };
      const saved = await this.store.cas(room.version, next);
      if (saved) return { ...roomView(saved, uid), duplicate: false, acceptedVersion: saved.version };
    }
    return deny('CONFLICT', 'Có thao tác đồng thời. Hãy đồng bộ rồi thử lại.');
  }

  /** Applies time-based outcomes: reconnect forfeits, turn timeouts and stale waiting rooms. */
  private expire(room: Room, now: number): Room {
    if (room.status === 'closed') return room;
    if (room.status === 'waiting') {
      return now - room.createdAt >= WAITING_MS ? { ...room, status: 'closed', closedAt: now, closeReason: 'expired', version: room.version + 1 } : room;
    }
    const seats = Object.keys(room.members) as Seat[];
    const absent = seats.filter(seat => (room.lastSeen[seat] ?? room.createdAt) <= now - RECONNECT_MS);
    if (absent.length && room.state) {
      const both = absent.length === seats.length;
      const state = both ? room.state : forfeitAbsent(room.state, absent[0]);
      return { ...room, state, status: 'closed', closedAt: now, closeReason: both ? 'abandoned' : 'disconnect', version: room.version + 1, expiryGuard: { cutoff: now - RECONNECT_MS, seats: absent } };
    }
    if (!room.state) return room;
    const state = advanceTime(room.state, now);
    return state === room.state ? room : { ...room, state, status: 'closed', closedAt: now, version: room.version + 1 };
  }

  /** Scheduler entrypoint: settles timeouts and absences without any connected browser. */
  async tick(now: number) {
    let updated = 0;
    for (const room of await this.store.due(now)) {
      const next = this.expire(room, now);
      if (next !== room && (await this.store.cas(room.version, next))) updated++;
    }
    return { updated };
  }
}
