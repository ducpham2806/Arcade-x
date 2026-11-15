import {
  DEFAULT_EQUIPPED_SKINS,
  type EquippedFolkSkins,
  type FolkGameKind,
  type FolkRoomSnapshot,
  type FolkSeat,
} from './types';

// Loại bỏ 0/O, 1/I/L để bạn bè đọc mã phòng qua điện thoại hoặc tin nhắn không bị nhầm
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export const FOLK_TURN_MS = 25_000;
export const FOLK_COUNTDOWN_MS = 3_000;
export const FOLK_REMATCH_MS = 60_000;
export const FOLK_ABSENCE_MS = 90_000;
export const FOLK_LOBBY_EXPIRY_MS = 10 * 60_000;

export function normalizeRoomCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function generateRoomCode(rand: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  }
  return code;
}

export interface GameEngineAdapter<TState, TMove> {
  createInitialState: (seed: number) => TState;
  validateAndApplyMove: (
    state: TState,
    seat: FolkSeat,
    move: TMove
  ) => {
    ok: boolean;
    error?: string;
    nextState: TState;
    nextTurn: FolkSeat;
    winner: FolkSeat | 'DRAW' | null;
  };
}

export class FolkRoomServer<TState, TMove> {
  private rooms = new Map<string, FolkRoomSnapshot<TState>>();
  private codeToId = new Map<string, string>();
  private userActiveRoom = new Map<string, string>();
  private receipts = new Map<string, FolkRoomSnapshot<TState>>();
  private adapter: GameEngineAdapter<TState, TMove>;

  constructor(adapter: GameEngineAdapter<TState, TMove>) {
    this.adapter = adapter;
  }

  private clone(room: FolkRoomSnapshot<TState>): FolkRoomSnapshot<TState> {
    return JSON.parse(JSON.stringify(room)) as FolkRoomSnapshot<TState>;
  }

  private saveRoom(room: FolkRoomSnapshot<TState>): FolkRoomSnapshot<TState> {
    this.rooms.set(room.roomId, room);
    this.codeToId.set(room.code, room.roomId);
    for (const p of room.players) {
      if (room.phase !== 'finished') {
        this.userActiveRoom.set(p.userId, room.roomId);
      } else {
        this.userActiveRoom.delete(p.userId);
      }
    }
    return this.clone(room);
  }

  createRoom(params: {
    userId: string;
    name: string;
    gameKind: FolkGameKind;
    isPublic: boolean;
    skins?: EquippedFolkSkins;
    now?: number;
  }): FolkRoomSnapshot<TState> {
    const now = params.now ?? Date.now();
    const existingId = this.userActiveRoom.get(params.userId);
    if (existingId) {
      const existing = this.rooms.get(existingId);
      if (existing && existing.phase !== 'finished') {
        return this.clone(existing);
      }
    }

    let code = generateRoomCode();
    while (this.codeToId.has(code)) {
      code = generateRoomCode();
    }
    const roomId = `fd_${code}_${now}`;
    const room: FolkRoomSnapshot<TState> = {
      roomId,
      code,
      gameKind: params.gameKind,
      isPublic: params.isPublic,
      version: 1,
      phase: 'lobby',
      hostSeat: 'P1',
      players: [
        {
          seat: 'P1',
          userId: params.userId,
          name: params.name,
          ready: true,
          connected: true,
          lastSeenAt: now,
          skins: params.skins ?? { ...DEFAULT_EQUIPPED_SKINS },
        },
      ],
      turn: 'P1',
      turnNumber: 1,
      deadlineAt: now + FOLK_LOBBY_EXPIRY_MS,
      rematchDeadlineAt: null,
      rematchVotes: [],
      winner: null,
      finishReason: null,
      lastEmote: null,
      state: this.adapter.createInitialState(now),
      createdAt: now,
      updatedAt: now,
    };
    return this.saveRoom(room);
  }

  joinByCode(params: {
    userId: string;
    name: string;
    code: string;
    skins?: EquippedFolkSkins;
    now?: number;
  }): { ok: boolean; error?: string; room?: FolkRoomSnapshot<TState> } {
    const now = params.now ?? Date.now();
    const code = normalizeRoomCode(params.code);
    const roomId = this.codeToId.get(code);
    if (!roomId) {
      return { ok: false, error: 'Không tìm thấy phòng với mã này.' };
    }
    const room = this.rooms.get(roomId);
    if (!room) {
      return { ok: false, error: 'Phòng không tồn tại hoặc đã đóng.' };
    }
    const existing = room.players.find((p) => p.userId === params.userId);
    if (existing) {
      existing.connected = true;
      existing.lastSeenAt = now;
      return { ok: true, room: this.saveRoom(room) };
    }
    if (room.phase !== 'lobby' || room.players.length >= 2) {
      return { ok: false, error: 'Phòng đã đủ 2 người hoặc đang đấu.' };
    }

    room.players.push({
      seat: 'P2',
      userId: params.userId,
      name: params.name,
      ready: true,
      connected: true,
      lastSeenAt: now,
      skins: params.skins ?? { ...DEFAULT_EQUIPPED_SKINS },
    });
    room.version += 1;
    room.phase = 'countdown';
    room.deadlineAt = now + FOLK_COUNTDOWN_MS;
    room.updatedAt = now;
    return { ok: true, room: this.saveRoom(room) };
  }

  matchmake(params: {
    userId: string;
    name: string;
    gameKind: FolkGameKind;
    skins?: EquippedFolkSkins;
    now?: number;
  }): FolkRoomSnapshot<TState> {
    const now = params.now ?? Date.now();
    // Nếu đang ở trong 1 phòng mở thì trả về phòng đó
    const existingId = this.userActiveRoom.get(params.userId);
    if (existingId) {
      const existing = this.rooms.get(existingId);
      if (existing && existing.phase !== 'finished') {
        return this.clone(existing);
      }
    }

    // Tìm phòng công khai cũ nhất cùng gameKind có 1 người còn hoạt động trong 90s
    const candidate = [...this.rooms.values()]
      .filter(
        (r) =>
          r.isPublic &&
          r.gameKind === params.gameKind &&
          r.phase === 'lobby' &&
          r.players.length === 1 &&
          r.players[0].userId !== params.userId &&
          now - r.players[0].lastSeenAt <= FOLK_ABSENCE_MS
      )
      .sort((a, b) => a.createdAt - b.createdAt)[0];

    if (candidate) {
      const res = this.joinByCode({
        userId: params.userId,
        name: params.name,
        code: candidate.code,
        skins: params.skins,
        now,
      });
      if (res.ok && res.room) return res.room;
    }

    return this.createRoom({
      userId: params.userId,
      name: params.name,
      gameKind: params.gameKind,
      isPublic: true,
      skins: params.skins,
      now,
    });
  }

  getRoom(roomId: string, now = Date.now()): FolkRoomSnapshot<TState> | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    this.tickRoom(room, now);
    return this.clone(room);
  }

  submitMove(params: {
    roomId: string;
    userId: string;
    expectedVersion: number;
    requestId: string;
    move: TMove;
    now?: number;
  }): { ok: boolean; error?: string; room?: FolkRoomSnapshot<TState> } {
    const now = params.now ?? Date.now();
    const receiptKey = `${params.roomId}:${params.requestId}`;
    const cached = this.receipts.get(receiptKey);
    if (cached) {
      return { ok: true, room: this.clone(cached) };
    }

    const room = this.rooms.get(params.roomId);
    if (!room) return { ok: false, error: 'Phòng không tồn tại.' };
    this.tickRoom(room, now);

    if (room.version !== params.expectedVersion) {
      return { ok: false, error: 'VERSION_CONFLICT', room: this.clone(room) };
    }
    if (room.phase !== 'playing') {
      return { ok: false, error: 'Trận đấu chưa bắt đầu hoặc đã kết thúc.', room: this.clone(room) };
    }
    const player = room.players.find((p) => p.userId === params.userId);
    if (!player) return { ok: false, error: 'Bạn không thuộc phòng này.' };
    if (player.seat !== room.turn) {
      return { ok: false, error: 'Chưa đến lượt của bạn.', room: this.clone(room) };
    }

    const outcome = this.adapter.validateAndApplyMove(room.state, player.seat, params.move);
    if (!outcome.ok) {
      return { ok: false, error: outcome.error || 'Nước đi không hợp lệ.', room: this.clone(room) };
    }

    player.lastSeenAt = now;
    room.state = outcome.nextState;
    room.version += 1;
    room.updatedAt = now;

    if (outcome.winner) {
      room.phase = 'finished';
      room.winner = outcome.winner;
      room.finishReason = 'normal';
      room.rematchDeadlineAt = now + FOLK_REMATCH_MS;
    } else {
      room.turn = outcome.nextTurn;
      room.turnNumber += 1;
      room.deadlineAt = now + FOLK_TURN_MS;
    }

    const snap = this.saveRoom(room);
    this.receipts.set(receiptKey, snap);
    return { ok: true, room: snap };
  }

  sendEmote(roomId: string, userId: string, emoteId: string, now = Date.now()): FolkRoomSnapshot<TState> | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const player = room.players.find((p) => p.userId === userId);
    if (!player) return null;
    player.lastSeenAt = now;
    room.lastEmote = { seat: player.seat, emoteId, at: now };
    room.version += 1;
    room.updatedAt = now;
    return this.saveRoom(room);
  }

  voteRematch(roomId: string, userId: string, now = Date.now()): FolkRoomSnapshot<TState> | null {
    const room = this.rooms.get(roomId);
    if (!room || room.phase !== 'finished') return null;
    const player = room.players.find((p) => p.userId === userId);
    if (!player) return null;
    if (!room.rematchVotes.includes(player.seat)) {
      room.rematchVotes.push(player.seat);
    }
    if (room.rematchVotes.length === 2) {
      room.phase = 'countdown';
      room.state = this.adapter.createInitialState(now);
      room.turn = room.hostSeat === 'P1' ? 'P2' : 'P1';
      room.hostSeat = room.turn;
      room.turnNumber = 1;
      room.winner = null;
      room.finishReason = null;
      room.rematchVotes = [];
      room.rematchDeadlineAt = null;
      room.deadlineAt = now + FOLK_COUNTDOWN_MS;
    }
    room.version += 1;
    room.updatedAt = now;
    return this.saveRoom(room);
  }

  leaveRoom(roomId: string, userId: string, now = Date.now()): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const player = room.players.find((p) => p.userId === userId);
    if (!player) return false;
    this.userActiveRoom.delete(userId);

    if (room.phase === 'lobby') {
      room.players = room.players.filter((p) => p.userId !== userId);
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
        this.codeToId.delete(room.code);
      } else {
        room.version += 1;
        this.saveRoom(room);
      }
      return true;
    }

    if (room.phase === 'countdown' || room.phase === 'playing') {
      room.phase = 'finished';
      room.winner = player.seat === 'P1' ? 'P2' : 'P1';
      room.finishReason = 'forfeit';
      room.version += 1;
      room.updatedAt = now;
      this.saveRoom(room);
    }
    return true;
  }

  private tickRoom(room: FolkRoomSnapshot<TState>, now: number): void {
    if (room.phase === 'countdown' && now >= room.deadlineAt) {
      room.phase = 'playing';
      room.deadlineAt = now + FOLK_TURN_MS;
      room.version += 1;
      room.updatedAt = now;
      this.saveRoom(room);
    } else if (room.phase === 'playing' && now >= room.deadlineAt) {
      // Hết giờ lượt: xử thua người hết giờ để trận luôn phân định
      room.phase = 'finished';
      room.winner = room.turn === 'P1' ? 'P2' : 'P1';
      room.finishReason = 'timeout';
      room.rematchDeadlineAt = now + FOLK_REMATCH_MS;
      room.version += 1;
      room.updatedAt = now;
      this.saveRoom(room);
    }
  }
}
