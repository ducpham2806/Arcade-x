import {
  otherSeat, type FolkCommand, type FolkOnlineRoom, type FolkReply, type FolkRequest,
} from '../../../src/games/folk-duel/online-protocol.ts';
import type { FolkGameKind, FolkSeat } from '../../../src/games/folk-duel/types.ts';
import { applyNlcAction, applySow, firstNlcStep, FolkRoomError, initialFolkState } from './engine.ts';

const TURN_MS = 25_000;
const COUNTDOWN_MS = 3_000;
const LOBBY_MS = 10 * 60_000;
const REMATCH_MS = 60_000;
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export type StoredRoom = Omit<FolkOnlineRoom, 'mySeat' | 'players'> & {
  players: (FolkOnlineRoom['players'][number] & { uid: string })[];
  revision: number;
  activeUntil: number;
  createdAt: number;
  first: FolkSeat;
  round: number;
  receipts: { uid: string; id: string; command: string }[];
};

export type Lookup = 'member' | 'code' | 'resume' | 'queue';
export interface FolkStore {
  lookup(game: FolkGameKind, uid: string, kind: Lookup, value: string, now: number): Promise<StoredRoom | null>;
  due(now: number): Promise<StoredRoom[]>;
  commit(expectedRevision: number, room: StoredRoom, now: number): Promise<boolean>;
}

function newCode() {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), byte => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

const fail = (code: string, message: string): never => { throw new FolkRoomError(code, message); };
const member = (room: StoredRoom, uid: string) => room.players.find(player => player.uid === uid && !player.left);
const clean = (value: string) => value.replace(/[\p{Cc}\p{Cf}]/gu, '').trim();
const nameOf = (value: string) => clean(value).slice(0, 40) || 'Kỳ thủ';

function view(room: StoredRoom, seat: FolkSeat): FolkOnlineRoom {
  const { roomId, game, code, isPublic, matchId, version, phase, readyAt, deadlineAt, rematchUntil,
    rematchVotes, winner, finishReason, state, nlc, chat } = room;
  return { roomId, game, code, isPublic, matchId, version, phase, mySeat: seat,
    players: room.players.map(({ seat, name, left }) => ({ seat, name, left })),
    readyAt, deadlineAt, rematchUntil, rematchVotes, winner, finishReason, state, nlc, chat };
}

function finish(room: StoredRoom, reason: NonNullable<StoredRoom['finishReason']>, winner: StoredRoom['winner'], now: number) {
  const canRematch = reason === 'normal' || reason === 'timeout';
  room.phase = 'finished';
  room.winner = winner;
  room.finishReason = reason;
  room.rematchUntil = canRematch ? now + REMATCH_MS : 0;
  room.activeUntil = room.rematchUntil;
  if (winner) room.state = { ...room.state, finished: true, winner };
}

function startCountdown(room: StoredRoom, now: number) {
  room.phase = 'countdown';
  room.deadlineAt = now + COUNTDOWN_MS;
  room.readyAt = room.deadlineAt;
  room.activeUntil = room.deadlineAt + TURN_MS + REMATCH_MS;
  room.state = initialFolkState(room.game, room.first);
  room.nlc = null;
  room.winner = null;
  room.finishReason = null;
  room.rematchUntil = 0;
  room.rematchVotes = [];
}

function expire(room: StoredRoom, now: number) {
  if (room.phase === 'finished' || now < room.deadlineAt) return false;
  if (room.phase === 'lobby') finish(room, 'expired', null, room.deadlineAt);
  else if (room.phase === 'countdown') {
    room.phase = 'playing';
    if (room.game === 'nhay-lo-co') {
      room.nlc = firstNlcStep(room.deadlineAt, `Người ${room.first === 'P1' ? 1 : 2} thảy Chàm.`);
    }
    room.deadlineAt += TURN_MS;
    if (now >= room.deadlineAt) finish(room, 'timeout', otherSeat(room.state.turn), room.deadlineAt);
  } else finish(room, 'timeout', otherSeat(room.state.turn), room.deadlineAt);
  return true;
}

export class FolkOnlineServer {
  constructor(private store: FolkStore, private code = newCode) {}

  async handle(uid: string, request: FolkRequest, now: number): Promise<FolkReply> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const { game, type } = request;
      const lookup = (kind: Lookup, value = '') => this.store.lookup(game, uid, kind, value, now);
      const send = (room: StoredRoom, seat: FolkSeat, accepted?: boolean): FolkReply => ({
        room: view(room, seat), serverNow: now, accepted,
      });
      if (type === 'create' || type === 'match' || type === 'join' || type === 'resume') {
        const existing = await lookup('resume');
        if (existing) {
          if (type === 'join' && request.code !== existing.code) fail('ACTIVE_ROOM', 'Bạn đang ở phòng khác. Hãy vào lại rồi rời phòng đó.');
          // Use the normal member path to settle a phase transition before returning.
          return this.handle(uid, { game, type: 'snapshot', roomId: existing.roomId }, now);
        }
        if (type === 'resume') return { room: null, serverNow: now };
        const candidate = type === 'join' ? await lookup('code', request.code) : type === 'match' ? await lookup('queue') : null;
        if (candidate) {
          if (candidate.phase !== 'lobby' || now >= candidate.deadlineAt) fail('ROOM_UNAVAILABLE', 'Phòng đã đủ người hoặc hết hạn.');
          candidate.players.push({ uid, seat: 'P2', name: nameOf(request.name), left: false });
          startCountdown(candidate, now);
          const previous = candidate.revision++;
          candidate.version++;
          if (await this.store.commit(previous, candidate, now)) return send(candidate, 'P2');
          continue;
        }
        if (type === 'join') return fail('NOT_FOUND', 'Không tìm thấy phòng của game này.');
        const roomId = request.requestId;
        const room: StoredRoom = {
          roomId, game, code: this.code(), matchId: `${roomId}/1`, isPublic: type === 'match',
          revision: 1, version: 1, phase: 'lobby', first: 'P1', round: 1,
          players: [{ uid, seat: 'P1', name: nameOf(request.name), left: false }],
          createdAt: now, readyAt: 0, deadlineAt: now + LOBBY_MS, activeUntil: now + LOBBY_MS,
          rematchUntil: 0, rematchVotes: [], winner: null, finishReason: null,
          state: initialFolkState(game, 'P1'), nlc: null, chat: [], receipts: [],
        };
        if (await this.store.commit(0, room, now)) return send(room, 'P1');
        continue;
      }
      if (!('roomId' in request)) return fail('BAD_REQUEST', 'Yêu cầu phòng không hợp lệ.');
      const room = await lookup('member', request.roomId);
      if (!room) return fail('NOT_MEMBER', 'Bạn không còn thuộc phòng này.');
      const player = member(room, uid);
      const leftReceipt = request.type === 'command' && request.command.type === 'leave' &&
        room.receipts.some(entry => entry.id === request.actionId && entry.uid === uid && entry.command === JSON.stringify(request.command));
      if (!player) {
        if (leftReceipt) return { room: null, serverNow: now, accepted: true };
        return fail('NOT_MEMBER', 'Bạn không còn thuộc phòng này.');
      }
      const seat = player.seat;
      const revision = room.revision;
      if (request.type === 'command') {
        const { actionId, command } = request;
        const receipt = room.receipts.find(entry => entry.id === actionId && entry.uid === uid);
        if (receipt) {
          if (receipt.command !== JSON.stringify(command)) fail('ACTION_REUSED', 'Mã thao tác đã dùng cho lệnh khác.');
          return send(room, seat, true);
        }
      }
      if (expire(room, now)) {
        room.revision++;
        room.version++;
        if (!await this.store.commit(revision, room, now)) continue;
        if (request.type === 'snapshot') return send(room, seat);
        if (request.command.type !== 'leave') return { ...send(room, seat, false), error: 'VERSION_CONFLICT', message: 'Bàn vừa đổi trạng thái.' };
        continue;
      }
      if (request.type === 'snapshot') return send(room, seat);
      const { command, version, actionId } = request;
      const changesBoard = command.type !== 'chat';
      if (changesBoard && command.type !== 'leave' && command.type !== 'rematch' && version !== room.version) {
        return { ...send(room, seat, false), error: 'VERSION_CONFLICT', message: 'Bàn vừa cập nhật. Mời bạn thao tác lại.' };
      }
      this.applyCommand(room, seat, command, actionId, now);
      room.revision++;
      if (changesBoard) room.version++;
      room.receipts = [...room.receipts, { uid, id: actionId, command: JSON.stringify(command) }];
      if (await this.store.commit(revision, room, now)) {
        return command.type === 'leave' ? { room: null, serverNow: now, accepted: true } : send(room, seat, true);
      }
    }
    return fail('CONFLICT', 'Phòng đang đồng bộ. Hãy thử lại.');
  }

  async tick(now: number) {
    let settled = 0;
    for (const room of await this.store.due(now)) {
      const revision = room.revision;
      if (!expire(room, now)) continue;
      room.revision++;
      room.version++;
      if (await this.store.commit(revision, room, now)) settled++;
    }
    return { settled, serverNow: now };
  }

  private applyCommand(room: StoredRoom, seat: FolkSeat, command: FolkCommand, actionId: string, now: number) {
    if (command.type === 'leave') {
      room.players.find(player => player.seat === seat)!.left = true;
      if (room.phase === 'lobby') finish(room, 'cancelled', null, now);
      else if (room.phase !== 'finished') finish(room, 'forfeit', otherSeat(seat), now);
      room.activeUntil = 0;
      room.rematchUntil = 0;
      return;
    }
    if (command.type === 'chat') {
      const text = clean(command.text).replace(/\s+/gu, ' ');
      if (!text || text.length > 500) fail('BAD_CHAT', 'Tin nhắn cần từ 1 đến 500 ký tự.');
      if (room.players.length < 2 || room.players.some(player => player.left) ||
          (room.phase === 'finished' && now >= room.rematchUntil)) fail('CHAT_CLOSED', 'Chat trận đã đóng.');
      if (room.chat.some(message => message.seat === seat && now - message.at < 700)) fail('SLOW_CHAT', 'Hãy chờ một chút rồi gửi tin tiếp.');
      room.chat = [...room.chat.slice(-49), { id: `${seat}:${actionId}`, seat, text, at: now }];
      return;
    }
    if (command.type === 'rematch') {
      if (room.phase !== 'finished' || now >= room.rematchUntil || room.players.some(player => player.left)) {
        fail('NO_REMATCH', 'Đã hết thời gian đấu lại hoặc đối thủ đã rời phòng.');
      }
      if (!room.rematchVotes.includes(seat)) room.rematchVotes.push(seat);
      if (room.rematchVotes.length === 2) {
        room.first = otherSeat(room.first);
        room.round++;
        room.matchId = `${room.roomId}/${room.round}`;
        room.chat = [];
        startCountdown(room, now);
      }
      return;
    }
    if (room.phase !== 'playing' || room.state.turn !== seat) fail('NOT_YOUR_TURN', 'Chưa đến lượt của bạn.');
    if (now < room.readyAt) fail('PRESENTING', 'Đang rải quân. Đợi trình diễn kết thúc rồi chọn lượt mới.');
    const previousTurn = room.state.turnNumber;
    let presentationMs = 0;
    if (command.type === 'sow' && room.game === 'o-an-quan' && 'cells' in room.state) {
      const next = applySow(room.state, seat, command);
      room.state = next.state;
      presentationMs = next.duration + 1000;
    } else if (command.type !== 'sow' && room.game === 'nhay-lo-co' && 'houses' in room.state && room.nlc) {
      const next = applyNlcAction(room.state, room.nlc, seat, command, now);
      room.state = next.state;
      room.nlc = next.step;
    } else fail('INVALID_MOVE', 'Thao tác không thuộc game này.');
    if (room.state.finished) finish(room, 'normal', room.state.winner, now);
    else if (room.state.turnNumber !== previousTurn) {
      room.readyAt = now + presentationMs;
      room.deadlineAt = room.readyAt + TURN_MS;
      room.activeUntil = room.deadlineAt + REMATCH_MS;
    }
  }
}
