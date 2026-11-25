import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js';

export type CitadelCaptures = Record<Color, PieceSymbol[]>;

export function acceptedCitadelMove(before: string, after: string): Move | undefined {
  if (before === after) return;
  return new Chess(before).moves({ verbose: true }).find(move => move.after === after);
}

export function citadelVictimSquare(move: Move): Square {
  return move.isEnPassant() ? `${move.to[0]}${move.from[1]}` as Square : move.to;
}

export function citadelRookMove(move: Move): { from: Square; to: Square } | undefined {
  if (!move.isKingsideCastle() && !move.isQueensideCastle()) return;
  const rank = move.from[1];
  return move.isKingsideCastle()
    ? { from: `h${rank}` as Square, to: `f${rank}` as Square }
    : { from: `a${rank}` as Square, to: `d${rank}` as Square };
}

function replayCitadelMoves(history: readonly string[], finalFen: string, initialFen?: string) {
  try {
    const engine = new Chess(initialFen);
    const initial = engine.fen();
    const moves = history.map(move => engine.move(move));
    return engine.fen() === finalFen ? { initial, moves } : null;
  } catch {
    return null;
  }
}

export function replayCitadelCaptures(history: readonly string[], fen: string, initialFen?: string): CitadelCaptures | null {
  const replay = replayCitadelMoves(history, fen, initialFen);
  if (!replay) return null;
  const captured: CitadelCaptures = { w: [], b: [] };
  for (const move of replay.moves) {
    if (move.captured) captured[move.color].push(move.captured);
  }
  return captured;
}

export function replayCitadelPositions(history: readonly string[], finalFen: string, initialFen?: string): string[] {
  const replay = replayCitadelMoves(history, finalFen, initialFen);
  return replay ? [replay.initial, ...replay.moves.map(move => move.after)] : [];
}
