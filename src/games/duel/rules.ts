/**
 * Authoritative duel referee for Chess, Xiangqi and Caro. Pure and deterministic, so the same
 * rules run in the browser and in the `duel-room` Edge Function (see duel/server.ts).
 *
 * Coordinates are always strings, one format per game (this replaces the legacy
 * `[number, number] | string` move shape):
 *   chess   algebraic square, e.g. "e2"
 *   xiangqi "row,col" with row 0-9 (black baseline 0) and col 0-8
 *   caro    "x,y" with 0-14 on both axes
 */
import { Chess } from 'chess.js';
import { INITIAL_XIANGQI_BOARD, cloneBoard, getLegalMovesForPiece, hasLegalMoves, type BoardMatrix, type PieceColor } from '../xiangqi/rules';
import { BOARD_SIZE, checkCaroWin } from '../caro-gomoku/rules';

export type DuelGame = 'chess' | 'xiangqi' | 'caro';
export type Seat = 'host' | 'guest';
export type EndReason = 'checkmate' | 'stalemate' | 'draw_rule' | 'five_in_a_row' | 'board_full' | 'timeout' | 'resign' | 'draw_agreement' | 'disconnect';
export type DuelMoveInput = { from?: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' };
export type DuelMoveRecord = { by: Seat; from?: string; to: string; notation: string; piece?: string; captured?: string; at: number };
export type DuelState = {
  version: 1;
  game: DuelGame;
  /** Seat that moves first (white / red / X). */
  first: Seat;
  turn: Seat;
  /** chess: FEN; xiangqi: 10x9 board; caro: "x_y" -> "X" | "O". */
  board: string | BoardMatrix | Record<string, string>;
  moves: DuelMoveRecord[];
  status: 'active' | 'ended';
  winner: Seat | 'draw' | null;
  endReason: EndReason | null;
  winningLine: string[] | null;
  drawOffer: Seat | null;
  turnMs: number;
  deadline: number;
};

export class RuleError extends Error {
  constructor(message: string) { super(message); this.name = 'RuleError'; }
}

export const other = (seat: Seat): Seat => (seat === 'host' ? 'guest' : 'host');
const isFirst = (s: DuelState, seat: Seat) => s.first === seat;
const end = (s: DuelState, winner: Seat | 'draw', reason: EndReason, line: string[] | null = null): DuelState =>
  ({ ...s, status: 'ended', winner, endReason: reason, winningLine: line, drawOffer: null });

export function createDuel(game: DuelGame, now: number, options: { first?: Seat; turnMs?: number } = {}): DuelState {
  const turnMs = options.turnMs ?? (game === 'caro' ? 30_000 : 60_000);
  if (!Number.isInteger(turnMs) || turnMs < 5_000 || turnMs > 600_000) throw new RuleError('Invalid turn duration');
  const first = options.first ?? 'host';
  const board = game === 'chess' ? new Chess().fen() : game === 'xiangqi' ? cloneBoard(INITIAL_XIANGQI_BOARD) : {};
  return { version: 1, game, first, turn: first, board, moves: [], status: 'active', winner: null, endReason: null, winningLine: null, drawOffer: null, turnMs, deadline: now + turnMs };
}

const parsePair = (value: unknown, maxA: number, maxB: number): [number, number] => {
  if (typeof value !== 'string' || !/^\d{1,2},\d{1,2}$/.test(value)) throw new RuleError('Invalid coordinate');
  const [a, b] = value.split(',').map(Number);
  if (a > maxA || b > maxB) throw new RuleError('Coordinate off board');
  return [a, b];
};

export function applyMove(s: DuelState, seat: Seat, input: DuelMoveInput, now: number): DuelState {
  if (s.status !== 'active') throw new RuleError('Game is over');
  if (now > s.deadline) throw new RuleError('Turn time expired');
  if (s.turn !== seat) throw new RuleError('Not your turn');
  if (!input || typeof input !== 'object' || typeof input.to !== 'string') throw new RuleError('Invalid move');
  const next = { ...s, turn: other(seat), deadline: now + s.turnMs, drawOffer: null };

  if (s.game === 'chess') {
    const chess = new Chess(s.board as string);
    if ((chess.turn() === 'w') !== isFirst(s, seat)) throw new RuleError('Not your pieces');
    if (input.promotion !== undefined && !['q', 'r', 'b', 'n'].includes(input.promotion)) throw new RuleError('Invalid promotion');
    let move;
    try { move = chess.move({ from: input.from ?? '', to: input.to, promotion: input.promotion ?? 'q' }); } catch { throw new RuleError('Illegal move'); }
    const record: DuelMoveRecord = { by: seat, from: move.from, to: move.to, notation: move.san, piece: move.piece, captured: move.captured, at: now };
    const after = { ...next, board: chess.fen(), moves: [...s.moves, record] };
    if (chess.isCheckmate()) return end(after, seat, 'checkmate');
    if (chess.isStalemate()) return end(after, 'draw', 'stalemate');
    if (chess.isDraw()) return end(after, 'draw', 'draw_rule');
    return after;
  }

  if (s.game === 'xiangqi') {
    const board = s.board as BoardMatrix;
    const [fr, fc] = parsePair(input.from, 9, 8), [tr, tc] = parsePair(input.to, 9, 8);
    const piece = board[fr][fc];
    const color: PieceColor = isFirst(s, seat) ? 'r' : 'b';
    if (!piece || piece.color !== color) throw new RuleError('Not your piece');
    if (!getLegalMovesForPiece(board, fr, fc).some(([r, c]) => r === tr && c === tc)) throw new RuleError('Illegal move');
    const captured = board[tr][tc];
    const nextBoard = cloneBoard(board);
    nextBoard[tr][tc] = nextBoard[fr][fc];
    nextBoard[fr][fc] = null;
    const record: DuelMoveRecord = { by: seat, from: input.from, to: input.to, notation: `${piece.type}${input.from}-${input.to}`, piece: piece.type, captured: captured?.type, at: now };
    const after = { ...next, board: nextBoard, moves: [...s.moves, record] };
    // In Xiangqi a side with no legal move loses, whether in check (mate) or not (stalemate).
    if (!hasLegalMoves(nextBoard, color === 'r' ? 'b' : 'r')) return end(after, seat, 'checkmate');
    return after;
  }

  const board = s.board as Record<string, string>;
  const [x, y] = parsePair(input.to, BOARD_SIZE - 1, BOARD_SIZE - 1);
  if (board[`${x}_${y}`]) throw new RuleError('Cell is occupied');
  const symbol = isFirst(s, seat) ? 'X' : 'O';
  const nextBoard = { ...board, [`${x}_${y}`]: symbol };
  const record: DuelMoveRecord = { by: seat, to: input.to, notation: `${symbol}${input.to}`, piece: symbol, at: now };
  const after = { ...next, board: nextBoard, moves: [...s.moves, record] };
  const win = checkCaroWin(nextBoard, x, y, symbol, BOARD_SIZE);
  if (win.isWin) return end(after, seat, 'five_in_a_row', win.winningLine!.map(p => `${p.x},${p.y}`));
  if (Object.keys(nextBoard).length >= BOARD_SIZE * BOARD_SIZE) return end(after, 'draw', 'board_full');
  return after;
}

export function resign(s: DuelState, seat: Seat): DuelState {
  if (s.status !== 'active') throw new RuleError('Game is over');
  return end(s, other(seat), 'resign');
}

export function offerDraw(s: DuelState, seat: Seat): DuelState {
  if (s.status !== 'active') throw new RuleError('Game is over');
  if (s.drawOffer) throw new RuleError('A draw offer is already open');
  return { ...s, drawOffer: seat };
}

export function respondDraw(s: DuelState, seat: Seat, accept: boolean): DuelState {
  if (s.status !== 'active' || !s.drawOffer) throw new RuleError('No draw offer');
  if (s.drawOffer === seat) throw new RuleError('Cannot answer your own offer');
  return accept ? end(s, 'draw', 'draw_agreement') : { ...s, drawOffer: null };
}

/** Seat that has been away too long loses (used by the room server's reconnect grace). */
export function forfeitAbsent(s: DuelState, absent: Seat): DuelState {
  return s.status === 'active' ? end(s, other(absent), 'disconnect') : s;
}

/** Settles an expired turn: the player to move loses on time. */
export function advanceTime(s: DuelState, now: number): DuelState {
  return s.status === 'active' && now > s.deadline ? end(s, other(s.turn), 'timeout') : s;
}
