/** Tank Clash P2 wire protocol, shared by the room host (server) and the browser client.
 * Plain TypeScript with no runtime dependencies so Node can load it with type stripping.
 * Clients send intents only (movement, aim, fire, shield). The server owns positions, HP, rounds and results.
 */
import { CONFIG, validInput } from './engine.ts';
import type { Input, State, Wall, GameEvent } from './engine.ts';

export const PROTOCOL = 'tank-clash.p2.v2';
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
  maxPayload: 8192, // allows current Supabase JWTs; still bounded
  clientStaleMs: 5000,
  connectTimeoutMs: 8000,
  maxPendingInputs: 240,
  maxRooms: 64,
  maxConnections: 160,
});
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
export const ROOM_CODE_LENGTH = 6;
export const SEATS = ['a', 'b'] as const;
export type SeatId = typeof SEATS[number];

export type ErrorCode = 'PROTOCOL_MISMATCH' | 'BAD_MESSAGE' | 'AUTH_REQUIRED' | 'AUTH_FAILED' | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL' | 'ROOM_IN_PROGRESS' | 'ROOM_CLOSED' | 'RESUME_INVALID' | 'ALREADY_IN_ROOM' | 'NOT_IN_ROOM' | 'RATE_LIMITED' | 'BAD_PHASE' | 'CONNECTION_TIMEOUT' | 'SERVER_RESTART' | 'SERVER_FULL';
export const ERROR_TEXT: Record<ErrorCode, string> = {
  BAD_PHASE: 'Thao tác không còn hợp lệ với trận hiện tại.',
  CONNECTION_TIMEOUT: 'Mất phản hồi từ máy chủ. Hãy kết nối lại.',
  SERVER_RESTART: 'Máy chủ đang bảo trì. Trận đang chơi đã được hủy.',
  SERVER_FULL: 'Máy chủ thử đang đầy, hãy thử lại sau.',
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
};

export type Phase = 'lobby' | 'countdown' | 'playing' | 'finished' | 'closed';
export type SeatView = { id: SeatId; name: string; ready: boolean; connected: boolean; host: boolean; holdMs: number | null };
export type MatchResult = { matchId: string; code: string; winner: number | null; scores: number[];
  reason: 'score' | 'forfeit' | 'cancelled'; rounds: number; players: { seat: SeatId; userId: string; team: number }[]; endedAt: number };
export type RoomView = { code: string; phase: Phase; seats: SeatView[]; countdownMs: number | null; matchId: string | null; result: MatchResult | null };
export type TankSnap = { id: string; x: number; y: number; angle: number; aim: number; hp: number; cooldown: number; shield: number; shieldCooldown: number };
export type BulletSnap = { id: number; team: number; x: number; y: number; vx: number; vy: number; bounces: number };
export type Snapshot = { epoch: string; tick: number; ack: number; status: State['status']; round: number; scores: number[]; remaining: number;
  winner: number | null; roundWinner: number | null; tanks: TankSnap[]; bullets: BulletSnap[]; events: GameEvent[]; walls?: Wall[] };

export type ClientMessage =
  | { type: 'create'; protocol: string; name?: string; token?: string }
  | { type: 'join'; protocol: string; code: string; name?: string; token?: string }
  | { type: 'resume'; protocol: string; code: string; resumeToken: string; token?: string }
  | { type: 'ready'; ready: boolean; opId: string; context: string | null }
  | { type: 'leave'; opId: string }
  | { type: 'input'; epoch: string; seq: number; inputs: Input[] }
  | { type: 'ping'; at: number };
export type ServerMessage =
  | { type: 'joined'; code: string; seat: SeatId; resumeToken: string; nextSeq: number; serverTime: number; room: RoomView; walls?: Wall[]; snapshot?: Snapshot }
  | { type: 'room'; room: RoomView }
  | { type: 'start'; matchId: string; walls: Wall[]; snapshot: Snapshot }
  | { type: 'snapshot'; snapshot: Snapshot }
  | { type: 'result'; result: MatchResult; room: RoomView }
  | { type: 'pong'; at: number; serverTime: number; tick: number }
  | { type: 'error'; code: ErrorCode; message: string; fatal: boolean }
  | { type: 'left' }
  | { type: 'ack'; opId: string; error?: ErrorCode }
  | { type: 'shutdown' };

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
/** Strict structural validation. Unknown message types and extra input fields are rejected. */
export function parseClientMessage(raw: unknown): ClientMessage | null {
  let m: Record<string, unknown>;
  try { m = typeof raw === 'string' ? JSON.parse(raw) : raw as Record<string, unknown>; } catch { return null; }
  if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
  const str = (v: unknown, max: number) => v === undefined || (typeof v === 'string' && v.length <= max);
  const keys: Record<string, string[]> = { create: ['type','protocol','name','token'], join: ['type','protocol','code','name','token'],
    resume: ['type','protocol','code','resumeToken','token'], ready: ['type','ready','opId','context'], leave: ['type','opId'],
    input: ['type','epoch','seq','inputs'], ping: ['type','at'] };
  if (typeof m.type !== 'string' || !Object.hasOwn(keys, m.type) || Object.keys(m).some(k => !keys[m.type as string].includes(k))) return null;
  const op = () => typeof m.opId === 'string' && /^[a-f0-9]{32}$/.test(m.opId);
  switch (m.type) {
    case 'create': return typeof m.protocol === 'string' && str(m.name, 64) && str(m.token, 4096) ? m as ClientMessage : null;
    case 'join': return typeof m.protocol === 'string' && typeof m.code === 'string' && m.code.length <= 16 && str(m.name, 64) && str(m.token, 4096) ? m as ClientMessage : null;
    case 'resume': return typeof m.protocol === 'string' && typeof m.code === 'string' && m.code.length <= 16 && typeof m.resumeToken === 'string' && m.resumeToken.length <= 128 && str(m.token, 4096) ? m as ClientMessage : null;
    case 'ready': return op() && (m.context === null || typeof m.context === 'string' && m.context.length <= 100) && typeof m.ready === 'boolean' ? m as ClientMessage : null;
    case 'leave': return op() ? m as ClientMessage : null;
    case 'ping': return Number.isFinite(m.at) ? m as ClientMessage : null;
    case 'input': return typeof m.epoch === 'string' && m.epoch.length > 0 && m.epoch.length <= 120 && Number.isSafeInteger(m.seq) && (m.seq as number) >= 0 && (m.seq as number) <= Number.MAX_SAFE_INTEGER - NET.inputBatchMax && Array.isArray(m.inputs) && m.inputs.length >= 1
      && m.inputs.length <= NET.inputBatchMax && m.inputs.every(exactInput) ? m as ClientMessage : null;
    default: return null;
  }
}
export function encodeSnapshot(s: State, ack: number, events: GameEvent[], walls?: Wall[], epoch = ''): Snapshot {
  return { epoch, tick: s.tick, ack, status: s.status, round: s.round, scores: [...s.scores], remaining: q(s.remaining), winner: s.winner, roundWinner: s.roundWinner,
    tanks: s.tanks.map(t => ({ id: t.id, x: q(t.x, 100), y: q(t.y, 100), angle: q(t.angle, 1000), aim: q(t.aim, 1000), hp: t.hp,
      cooldown: q(t.cooldown, 100), shield: q(t.shield, 100), shieldCooldown: q(t.shieldCooldown) })),
    bullets: s.bullets.map(b => ({ id: b.id, team: b.team, x: q(b.x), y: q(b.y), vx: q(b.vx), vy: q(b.vy), bounces: b.bounces })),
    events: events.map(e => ({ ...e, x: q(e.x), y: q(e.y), time: q(e.time, 1000) })), ...(walls ? { walls } : {}) };
}
export const SNAPSHOT_INTERVAL_MS = 1000 / CONFIG.hz * NET.snapshotEvery;
