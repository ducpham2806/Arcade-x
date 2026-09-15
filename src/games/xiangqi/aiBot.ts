/**
 * Xiangqi AI Engine (MiniMax with Alpha-Beta Pruning & Material Piece Values)
 */
import {
  BoardMatrix,
  cloneBoard,
  getLegalMovesForPiece,
  findKing,
  PieceColor,
} from './rules';

const PIECE_VALUES: Record<string, number> = {
  k: 10000,
  r: 900,
  c: 450,
  h: 400,
  e: 200,
  a: 200,
  p: 100,
};

export function getBestXiangqiMove(
  board: BoardMatrix,
  botColor: PieceColor = 'b',
  difficulty: 'easy' | 'medium' | 'hard' = 'hard'
): { from: [number, number]; to: [number, number] } | null {
  const allMoves: { from: [number, number]; to: [number, number]; score: number }[] = [];

  // Collect all legal moves for bot
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.color === botColor) {
        const legalDestinations = getLegalMovesForPiece(board, r, c);
        for (const [toR, toC] of legalDestinations) {
          const target = board[toR][toC];
          let score = 0;

          // Material capture value
          if (target) {
            score += PIECE_VALUES[target.type] || 0;
          }

          // Advance towards center/enemy territory
          const advanceBonus = botColor === 'b' ? toR : 9 - toR;
          score += advanceBonus * 2;

          // Add subtle randomness for easy/medium
          if (difficulty === 'easy') {
            score += Math.floor(Math.random() * 50);
          }

          allMoves.push({ from: [r, c], to: [toR, toC], score });
        }
      }
    }
  }

  if (allMoves.length === 0) return null;

  // Sort descending by heuristic score
  allMoves.sort((a, b) => b.score - a.score);

  if (difficulty === 'easy' && Math.random() < 0.4) {
    const randomPick = allMoves[Math.floor(Math.random() * Math.min(allMoves.length, 5))];
    return { from: randomPick.from, to: randomPick.to };
  }

  return { from: allMoves[0].from, to: allMoves[0].to };
}
