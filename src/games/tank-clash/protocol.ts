/** Tank Clash wire protocol (P3: 1v1 and 2v2 rooms, spectators), shared by the room host (server) and the browser client.
 * Plain TypeScript with no runtime dependencies so Node can load it with type stripping.
 * Clients send intents only (movement, aim, fire, shield). The server owns positions, HP, rounds and results.
 */
import { CONFIG, validInput } from './engine.ts';
import type { Input, State, Wall, GameEvent } from './engine.ts';

/** P3 changed the wire (format, teams, spectators, surrender), so the version moved on from p2.v1. */
export const PROTOCOL = 'tank-clash.p3.v1';
/** Tuning for P2 networking. All values are [PLACEHOLDER] until measured on real networks. */
export const NET = Object.freeze({
  snapshotEvery: 3,          // server ticks between snapshots: 60 Hz / 3 = 20 Hz
  inputBatchMax: 4,          // inputs per client message
  inputQueueMax: 30,         // ~0.5 s of buffered inputs per seat before the oldest are merged away
  inputCreditMax: 30,        // banked ticks a starved seat may catch up later (2 inputs per tick at most)
  staleInputMs: 250,         // no input for this long → seat drives neutral
  seatHoldMs: 20_000,        // reconnect window (PLAN §3.4)
  countdownMs: 3_000,
  emptyRoomMs: 60_000,       // no connected player → room closes
  lobbyIdleMs: 10 * 60_000,  // lobby without a match → room closes
  messagesPerSecond: 120,
  interpolationMs: 100,
  maxPayload: 2048,
  spectatorsMax: 4,          // per room (P3-SPEC §5.3)
  queueCountdownMs: 5_000,   // matched 2v2: start without ready (P3-SPEC §6.2)
  queueDropMs: 10_000,       // offline this long while queued → leaves the queue
  queueRematchMs: 20_000,    // matched room: window to agree on a rematch, then it dissolves (§5.4)
  queueHintMs: 60_000,       // client: offer "keep waiting / practise with bots" after this wait (§6.3)
});
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
export const ROOM_CODE_LENGTH = 6;
/** Every seat id, in the fixed host-transfer order (P3-SPEC §5.3). Tank id = seat id. */
export const SEATS = ['a', 'a2', 'b', 'b2'] as const;
export type SeatId = typeof SEATS[number];
export type Format = '1v1' | '2v2';
export const FORMATS: readonly Format[] = ['1v1', '2v2'];
/** Seats a room of this format has (host-transfer order). */
export const SEATS_OF: Record<Format, readonly SeatId[]> = { '1v1': ['a', 'b'], '2v2': ['a', 'a2', 'b', 'b2'] };
/** Order newcomers are seated in: alternate teams so a filling room stays balanced. */
export const JOIN_ORDER: Record<Format, readonly SeatId[]> = { '1v1': ['a', 'b'], '2v2': ['a', 'b', 'a2', 'b2'] };
/** Team 0 = a, a2 (left); team 1 = b, b2 (right). */
export const teamOf = (seat: string) => seat.startsWith('b') ? 1 : 0;

export type ErrorCode = 'PROTOCOL_MISMATCH' | 'BAD_MESSAGE' | 'AUTH_REQUIRED' | 'AUTH_FAILED' | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL' | 'ROOM_IN_PROGRESS' | 'ROOM_CLOSED' | 'RESUME_INVALID' | 'ALREADY_IN_ROOM' | 'NOT_IN_ROOM' | 'RATE_LIMITED'
  | 'TEAM_FULL' | 'NOT_HOST' | 'WRONG_PHASE' | 'SURRENDER_LOCKED' | 'QUEUE_INVALID' | 'ROOM_QUEUED';
export const ERROR_TEXT: Record<ErrorCode, string> = {
  PROTOCOL_MISMATCH: 'Phiên bản game khác máy chủ. Hãy tải lại trang.',
  BAD_MESSAGE: 'Gói tin không hợp lệ.',
  AUTH_REQUIRED: 'Cần đăng nhập để chơi online.',
  AUTH_FAILED: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  ROOM_NOT_FOUND: 'Không tìm thấy phòng với mã này.',
  ROOM_FULL: 'Phòng đã đủ người.',
  ROOM_IN_PROGRESS: 'Phòng đang trong trận, không vào thêm được.',
  ROOM_CLOSED: 'Phòng đã đóng hoặc hết hạn.',
  RESUME_INVALID: 'Không thể quay lại ghế cũ (hết thời gian giữ ghế).',
  ALREADY_IN_ROOM: 'Kết nối này đã ở trong một phòng.',
  NOT_IN_ROOM: 'Chưa vào phòng.',
  RATE_LIMITED: 'Gửi quá nhiều gói tin.',
  TEAM_FULL: 'Đội đó đã đủ người.',
  NOT_HOST: 'Chỉ chủ phòng làm được việc này.',
  WRONG_PHASE: 'Không làm được việc này lúc này.',
  SURRENDER_LOCKED: 'Chỉ đầu hàng được khi đội chỉ còn mình anh.',
  QUEUE_INVALID: 'Chỉ tìm trận được từ phòng 2v2 khi cả tổ (tối đa 2 người) cùng một đội và đều đang kết nối.',
  ROOM_QUEUED: 'Phòng này đang tìm trận, chưa vào được.',
};

export type Phase = 'lobby' | 'countdown' | 'playing' | 'finished' | 'closed';
export type SeatView = { id: SeatId; team: number; name: string; ready: boolean; connected: boolean; host: boolean; holdMs: number | null;
  /** Left or ran out of seat hold during the current/last match: out for the rest of it. */ forfeited: boolean };
export type MatchResult = { matchId: string; code: string; format: Format; winner: number | null; scores: number[];
  reason: 'score' | 'forfeit' | 'surrender' | 'cancelled'; rounds: number;
  players: { seat: SeatId; userId: string; name: string; team: number; forfeited: boolean }[]; endedAt: number };
/** Queue status: how long this entry has waited and how many players it brings (1 or 2). */
export type QueueView = { waitedMs: number; size: number };
/** `private`: made with a code. `queue`: made by the 2v2 matchmaker (no joining by code, rematch window). */
export type RoomKind = 'private' | 'queue';
export type RoomView = { code: string; kind: RoomKind; format: Format; phase: Phase;
  /** Party room searching for a match. */ queue: QueueView | null; /** Matched room after a result: time left to agree on a rematch. */ rematchMs: number | null; seats: SeatView[]; spectators: number; countdownMs: number | null; matchId: string | null; result: MatchResult | null };
/** Timers are omitted while zero (the client defaults them to 0): keeps 2v2 snapshots under the bandwidth ceiling. */
export type TankSnap = { id: string; x: number; y: number; angle: number; aim: number; hp: number; cooldown?: number; shield?: number; shieldCooldown?: number };
export type BulletSnap = { id: number; team: number; x: number; y: number; vx: number; vy: number; bounces: number };
export type Snapshot = { tick: number; ack: number; status: State['status']; round: number; scores: number[]; remaining: number;
  winner: number | null; roundWinner: number | null; tanks: TankSnap[]; bullets: BulletSnap[]; events: GameEvent[]; walls?: Wall[] };

export type ClientMessage =
  | { type: 'create'; protocol: string; format?: Format; name?: string; token?: string }
  | { type: 'join'; protocol: string; code: string; as?: 'player' | 'spectator'; name?: string; token?: string }
  | { type: 'resume'; protocol: string; code: string; resumeToken: string; token?: string }
  | { type: 'ready'; ready: boolean }
  | { type: 'leave' }
  /** Switch yourself to the other team (lobby only). */
  | { type: 'team'; team: number }
  /** Host only, lobby only: move the player in `seat` to `team`. Clears everyone's ready. */
  | { type: 'move'; seat: SeatId; team: number }
  /** Only when nobody else on your team is still playing (P3-SPEC §3.4). */
  | { type: 'surrender' }
  /** Search for a 2v2 match. From a party room (host): no other field is needed. Solo (not in a room): protocol, name, token. */
  | { type: 'queue'; protocol?: string; name?: string; token?: string }
  /** Leave the queue (any party member cancels for the whole party). */
  | { type: 'unqueue' }
  | { type: 'input'; seq: number; inputs: Input[] }
  | { type: 'ping'; at: number };
export type ServerMessage =
  | { type: 'joined'; code: string; role: 'player' | 'spectator'; seat: SeatId | null; resumeToken: string; nextSeq: number; serverTime: number; room: RoomView; walls?: Wall[]; snapshot?: Snapshot }
  | { type: 'room'; room: RoomView }
  /** Your seat id changed (team switch or host move); the resume token stays the same. */
  | { type: 'seat'; seat: SeatId }
  /** Solo queue status. null = not queued. `returned`: a matched countdown was cancelled, you are back at your old place. */
  | { type: 'queue'; queue: QueueView | null; reason?: 'unqueued' | 'returned' | 'dropped' }
  | { type: 'start'; matchId: string; walls: Wall[]; snapshot: Snapshot }
  | { type: 'snapshot'; snapshot: Snapshot }
  | { type: 'result'; result: MatchResult; room: RoomView }
  | { type: 'pong'; at: number; serverTime: number; tick: number }
  | { type: 'error'; code: ErrorCode; message: string; fatal: boolean }
  | { type: 'left' };

const q = (n: number, p = 10) => Math.round(n * p) / p;
export function quantizeInput(input: Input): Input {
  return { x: q(input.x, 100), y: q(input.y, 100), aim: q(input.aim, 1000), fire: !!input.fire, shield: !!input.shield };
}
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase().replace(/[\s-]/g, '');
  return code.length === ROOM_CODE_LENGTH && [...code].every(c => ROOM_CODE_ALPHABET.includes(c)) ? code : null;
}
export function cleanName(raw: unknown): string {
  const name = typeof raw === 'string' ? raw.normalize('NFC').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 20) : '';
  return name || 'Người chơi';
}
const INPUT_KEYS = ['x', 'y', 'aim', 'fire', 'shield'];
function exactInput(v: unknown): v is Input {
  return validInput(v) && Object.keys(v as object).every(k => INPUT_KEYS.includes(k));
}
const MESSAGE_KEYS: Record<string, string[]> = {
  create: ['protocol', 'format', 'name', 'token'], join: ['protocol', 'code', 'as', 'name', 'token'], resume: ['protocol', 'code', 'resumeToken', 'token'],
  ready: ['ready'], leave: [], team: ['team'], move: ['seat', 'team'], surrender: [], input: ['seq', 'inputs'], ping: ['at'],
  queue: ['protocol', 'name', 'token'], unqueue: [],
};
const isTeam = (v: unknown) => v === 0 || v === 1;
/** Strict structural validation. Unknown message types, unknown fields and extra input fields are rejected. */
export function parseClientMessage(raw: unknown): ClientMessage | null {
  let m: Record<string, unknown>;
  try { m = typeof raw === 'string' ? JSON.parse(raw) : raw as Record<string, unknown>; } catch { return null; }
  if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
  const keys = MESSAGE_KEYS[m.type as string];
  if (!keys || Object.keys(m).some(k => k !== 'type' && !keys.includes(k))) return null;
  const str = (v: unknown, max: number) => v === undefined || (typeof v === 'string' && v.length <= max);
  switch (m.type) {
    case 'create': return typeof m.protocol === 'string' && (m.format === undefined || FORMATS.includes(m.format as Format)) && str(m.name, 64) && str(m.token, 4096) ? m as ClientMessage : null;
    case 'join': return typeof m.protocol === 'string' && typeof m.code === 'string' && m.code.length <= 16 && (m.as === undefined || m.as === 'player' || m.as === 'spectator')
      && str(m.name, 64) && str(m.token, 4096) ? m as ClientMessage : null;
    case 'resume': return typeof m.protocol === 'string' && typeof m.code === 'string' && m.code.length <= 16 && typeof m.resumeToken === 'string' && m.resumeToken.length <= 128 && str(m.token, 4096) ? m as ClientMessage : null;
    case 'ready': return typeof m.ready === 'boolean' ? m as ClientMessage : null;
    case 'leave': case 'surrender': case 'unqueue': return m as ClientMessage;
    case 'queue': return str(m.protocol, 64) && str(m.name, 64) && str(m.token, 4096) ? m as ClientMessage : null;
    case 'team': return isTeam(m.team) ? m as ClientMessage : null;
    case 'move': return SEATS.includes(m.seat as SeatId) && isTeam(m.team) ? m as ClientMessage : null;
    case 'ping': return Number.isFinite(m.at) ? m as ClientMessage : null;
    case 'input': return Number.isSafeInteger(m.seq) && (m.seq as number) >= 0 && Array.isArray(m.inputs) && m.inputs.length >= 1
      && m.inputs.length <= NET.inputBatchMax && m.inputs.every(exactInput) ? m as ClientMessage : null;
    default: return null;
  }
}
export function encodeSnapshot(s: State, ack: number, events: GameEvent[], walls?: Wall[]): Snapshot {
  return { tick: s.tick, ack, status: s.status, round: s.round, scores: [...s.scores], remaining: q(s.remaining), winner: s.winner, roundWinner: s.roundWinner,
    tanks: s.tanks.map(t => { const snap: TankSnap = { id: t.id, x: q(t.x, 100), y: q(t.y, 100), angle: q(t.angle, 1000), aim: q(t.aim, 1000), hp: t.hp };
      const cooldown = q(t.cooldown, 100), shield = q(t.shield, 100), shieldCooldown = q(t.shieldCooldown);
      if (cooldown) snap.cooldown = cooldown; if (shield) snap.shield = shield; if (shieldCooldown) snap.shieldCooldown = shieldCooldown;
      return snap; }),
    bullets: s.bullets.map(b => ({ id: b.id, team: b.team, x: q(b.x), y: q(b.y), vx: q(b.vx), vy: q(b.vy), bounces: b.bounces })),
    events: events.map(e => ({ ...e, x: q(e.x), y: q(e.y), time: q(e.time, 1000) })), ...(walls ? { walls } : {}) };
}
export const SNAPSHOT_INTERVAL_MS = 1000 / CONFIG.hz * NET.snapshotEvery;
