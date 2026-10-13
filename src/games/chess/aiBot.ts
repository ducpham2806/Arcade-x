import { Chess, Square, Move } from 'chess.js';
import { SimpleAI, MinimaxGameRule } from '../../services/SimpleAI';

// Piece value weights (Centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (from White's perspective; mirrored for Black)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_MID_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let totalScore = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const baseVal = PIECE_VALUES[piece.type] || 0;
      let posVal = 0;

      const rowIdx = isWhite ? r : 7 - r;
      const colIdx = isWhite ? c : 7 - c;

      switch (piece.type) {
        case 'p':
          posVal = PAWN_PST[rowIdx][colIdx];
          break;
        case 'n':
          posVal = KNIGHT_PST[rowIdx][colIdx];
          break;
        case 'b':
          posVal = BISHOP_PST[rowIdx][colIdx];
          break;
        case 'r':
          posVal = ROOK_PST[rowIdx][colIdx];
          break;
        case 'q':
          posVal = QUEEN_PST[rowIdx][colIdx];
          break;
        case 'k':
          posVal = KING_MID_PST[rowIdx][colIdx];
          break;
      }

      const pieceTotal = baseVal + posVal;
      totalScore += isWhite ? pieceTotal : -pieceTotal;
    }
  }

  return totalScore;
}

export function getBestChessMove(
  fen: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { from: Square; to: Square; promotion?: string } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const isWhite = chess.turn() === 'w';

  if (difficulty === 'easy') {
    if (Math.random() < 0.4) {
      const captures = moves.filter((m) => m.captured);
      if (captures.length > 0) {
        const picked = captures[Math.floor(Math.random() * captures.length)];
        return { from: picked.from, to: picked.to, promotion: picked.promotion };
      }
    }
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return { from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion };
  }

  const searchDepth = difficulty === 'hard' ? 3 : 2;

  const rules: MinimaxGameRule<Chess, Move> = {
    getPossibleMoves: (state) => {
      // Sort captures first for better alpha-beta pruning
      const possible = state.moves({ verbose: true });
      return possible.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));
    },
    applyMove: (state, move, isAiTurn) => {
      // Clone state
      const newState = new Chess(state.fen());
      newState.move(move);
      return newState;
    },
    evaluateState: (state) => evaluateBoard(state),
    isGameOver: (state) => state.isGameOver()
  };

  const bestMove = SimpleAI.getBestMove(chess, rules, searchDepth, isWhite);
  
  if (!bestMove) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return { from: randomMove.from, to: randomMove.to, promotion: randomMove.promotion };
  }

  return { from: bestMove.from as Square, to: bestMove.to as Square, promotion: bestMove.promotion || 'q' };
}

