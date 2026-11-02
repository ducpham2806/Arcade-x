// Word-chain match rules: one source of truth for practice with bots, the room server and tests.
// Pure functions over plain JSON state; time is always passed in (server time online). Every
// deadline is processed at its own timestamp, so the result does not depend on when a tick runs.
import {clean,syllableKey,syllables,wordKey} from './normalize';

export const READY_MS = 30_000, COUNTDOWN_MS = 3_000, MIN_SUBMIT_GAP_MS = 700;
export const MIN_PLAYERS = 2, MAX_PLAYERS = 4;
export const SEATS = ['P1', 'P2', 'P3', 'P4'] as const;
export type Seat = typeof SEATS[number];
/** Answer time shrinks so long duels end: rounds 1–3 30 s, 4–6 20 s, then 15 s. */
export const turnMs = (round: number) => round <= 3 ? 30_000 : round <= 6 ? 20_000 : 15_000;

export type OutReason = 'timeout' | 'forfeit' | 'absent' | 'unready';
export type Player = {seat: Seat; name: string; ready: boolean; out?: {reason: OutReason; at: number; place: number}};
export type Phase = 'ready' | 'countdown' | 'turn' | 'finished';
export type ChainWord = {seat: Seat | 'SYS'; word: string; key: string; at: number};
export type Match = {
  rulesVersion: 1; phase: Phase; players: Player[]; seed: number;
  /** Turn order fixed at the countdown (seats that did not ready up are not in it). */
  order: Seat[]; turn: Seat | null; turnNumber: number; round: number; deadline: number;
  words: ChainWord[]; lastSubmit: Partial<Record<Seat, number>>;
  winner: Seat | null; reason: 'last-standing' | 'not-enough-ready' | null;
};
export type Dictionary = {has: (key: string) => boolean; display: (key: string) => string | undefined; openers: readonly string[]};
export type Rejection = 'format' | 'chain' | 'unknown' | 'used' | 'too-fast';
// Both variants list every field so callers can read them without strict narrowing.
export type Check = {ok: true; key: string; word: string; reason?: undefined; need?: undefined} | {ok: false; reason: Rejection; need: string; key?: undefined; word?: undefined};

export class RuleError extends Error {
  constructor(public code: 'NOT_PLAYING' | 'NOT_YOUR_TURN' | 'UNKNOWN_SEAT' | 'BAD_PLAYERS', message: string) {super(message); this.name = 'RuleError';}
}

function rng(seed: number) {let x = seed >>> 0; return () => {x += 0x6D2B79F5; let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296;};}
const copy = (m: Match): Match => JSON.parse(JSON.stringify(m));
const player = (m: Match, seat: Seat) => {const p = m.players.find(x => x.seat === seat); if (!p) throw new RuleError('UNKNOWN_SEAT', 'Ghế không có trong trận.'); return p;};
export const aliveSeats = (m: Match) => m.order.filter(s => !player(m, s).out);
/** The syllable the next word must start with. */
export const need = (m: Match) => m.words.at(-1)?.word.split(' ')[1] ?? '';

export function createMatch(players: {seat: Seat; name: string}[], now: number, seed: number): Match {
  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS || new Set(players.map(p => p.seat)).size !== players.length) throw new RuleError('BAD_PLAYERS', 'Cần 2–4 người chơi.');
  return {rulesVersion: 1, phase: 'ready', players: players.map(p => ({seat: p.seat, name: p.name, ready: false})), seed: seed >>> 0,
    order: [], turn: null, turnNumber: 0, round: 0, deadline: now + READY_MS, words: [], lastSubmit: {}, winner: null, reason: null};
}

function startCountdown(m: Match, at: number, dict: Dictionary) {
  const random = rng(m.seed);
  for (const p of m.players) if (!p.ready && !p.out) p.out = {reason: 'unready', at, place: 0};
  const seats = m.players.filter(p => !p.out).map(p => p.seat);
  for (let i = seats.length - 1; i > 0; i--) {const j = Math.floor(random() * (i + 1)); [seats[i], seats[j]] = [seats[j], seats[i]];}
  const opener = dict.openers[Math.floor(random() * dict.openers.length)];
  m.order = seats; m.phase = 'countdown'; m.deadline = at + COUNTDOWN_MS;
  m.words = [{seat: 'SYS', word: opener, key: wordKey(opener)!, at}];
}
function finishIfDecided(m: Match) {
  const alive = aliveSeats(m);
  if (m.phase === 'ready' || alive.length > 1) return false;
  m.phase = 'finished'; m.turn = null; m.winner = alive[0] ?? null; m.reason = 'last-standing';
  return true;
}
function eliminate(m: Match, seat: Seat, reason: OutReason, at: number) {
  const p = player(m, seat); if (p.out) return;
  p.out = {reason, at, place: aliveSeats(m).length};
}
/** Hand the turn to the next seat still in, after `from` in the turn order. */
function nextTurn(m: Match, from: Seat, at: number) {
  if (finishIfDecided(m)) return;
  const i = m.order.indexOf(from);
  for (let k = 1; k <= m.order.length; k++) {
    const j = (i + k) % m.order.length;
    if (!player(m, m.order[j]).out) {if (j <= i) m.round++; m.turn = m.order[j]; break;}
  }
  m.turnNumber++; m.deadline = at + turnMs(m.round);
}

/** Apply every deadline that has passed by `now`, each at its own time. */
export function advanceTime(state: Match, now: number, dict: Dictionary): Match {
  if (state.phase === 'finished' || now < state.deadline) return state;
  const m = copy(state);
  while (m.phase !== 'finished' && now >= m.deadline) {
    const at = m.deadline;
    if (m.phase === 'ready') {
      if (m.players.filter(p => p.ready && !p.out).length >= MIN_PLAYERS) startCountdown(m, at, dict);
      else {for (const p of m.players) if (!p.ready && !p.out) p.out = {reason: 'unready', at, place: 0}; m.phase = 'finished'; m.reason = 'not-enough-ready';}
    } else if (m.phase === 'countdown') {
      m.phase = 'turn'; m.round = 1; m.turnNumber = 1; m.turn = aliveSeats(m)[0]; m.deadline = at + turnMs(1);
      finishIfDecided(m);
    } else {
      const seat = m.turn!; eliminate(m, seat, 'timeout', at); nextTurn(m, seat, at);
    }
  }
  return m;
}

export function setReady(state: Match, seat: Seat, ready: boolean, now: number, dict: Dictionary): Match {
  const m = copy(advanceTime(state, now, dict));
  if (m.phase !== 'ready') throw new RuleError('NOT_PLAYING', 'Trận đã bắt đầu.');
  const p = player(m, seat); if (p.out) throw new RuleError('NOT_PLAYING', 'Bạn đã rời phòng.');
  p.ready = ready;
  const inRoom = m.players.filter(x => !x.out);
  if (inRoom.length >= MIN_PLAYERS && inRoom.every(x => x.ready)) startCountdown(m, now, dict);
  return m;
}

/** Validate a typed word against the current chain without changing anything (also used live
 * while typing). */
export function checkWord(m: Match, raw: string, dict: Dictionary): Check {
  const prev = need(m), parts = syllables(raw), key = wordKey(raw);
  if (parts.length !== 2 || !key) return {ok: false, reason: 'format', need: prev};
  if (key.split(' ')[0] !== syllableKey(prev)) return {ok: false, reason: 'chain', need: prev};
  if (!dict.has(key)) return {ok: false, reason: 'unknown', need: prev};
  if (m.words.some(w => w.key === key)) return {ok: false, reason: 'used', need: prev};
  return {ok: true, key, word: dict.display(key) ?? clean(raw)};
}

export function submitWord(state: Match, seat: Seat, raw: string, now: number, dict: Dictionary): {match: Match; result: Check} {
  const m = copy(advanceTime(state, now, dict));
  if (m.phase !== 'turn') throw new RuleError('NOT_PLAYING', 'Chưa đến lúc trả lời.');
  if (m.turn !== seat) throw new RuleError('NOT_YOUR_TURN', 'Chưa đến lượt của bạn.');
  const last = m.lastSubmit[seat];
  if (last !== undefined && now - last < MIN_SUBMIT_GAP_MS) return {match: m, result: {ok: false, reason: 'too-fast', need: need(m)}};
  m.lastSubmit[seat] = now;
  const result = checkWord(m, raw, dict);
  if (result.ok) {m.words.push({seat, word: result.word, key: result.key, at: now}); nextTurn(m, seat, now);}
  return {match: m, result};
}

/** Leave the match: giving up, or absent too long (the server decides when). */
export function forfeit(state: Match, seat: Seat, reason: 'forfeit' | 'absent', now: number, dict: Dictionary): Match {
  const m = copy(advanceTime(state, now, dict));
  const p = player(m, seat); if (p.out || m.phase === 'finished') return m;
  if (m.phase === 'ready') {
    p.out = {reason, at: now, place: 0};
    const inRoom = m.players.filter(x => !x.out);
    if (inRoom.length >= MIN_PLAYERS && inRoom.every(x => x.ready)) startCountdown(m, now, dict);
    return m;
  }
  eliminate(m, seat, reason, now);
  if (m.phase === 'turn' && m.turn === seat) nextTurn(m, seat, now); else finishIfDecided(m);
  return m;
}

/** Final standings: winner first, then by elimination (players who never readied are left out). */
export function standings(m: Match): {seat: Seat; name: string; place: number; words: number}[] {
  return m.players.filter(p => p.seat === m.winner || (p.out && p.out.place > 0)).map(p => ({seat: p.seat, name: p.name, place: p.seat === m.winner ? 1 : p.out!.place, words: m.words.filter(w => w.seat === p.seat).length}))
    .sort((a, b) => a.place - b.place);
}

export const REJECTION_TEXT: Record<Rejection, (need: string) => string> = {
  format: () => 'Cần đúng một từ 2 âm tiết, ví dụ "mèo con".',
  chain: n => `Từ phải bắt đầu bằng "${n}".`,
  unknown: () => 'Từ này không có trong từ điển.',
  used: () => 'Từ này đã có người dùng trong trận.',
  'too-fast': () => 'Chậm lại một chút rồi gửi lại.',
};
