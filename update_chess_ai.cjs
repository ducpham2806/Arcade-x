const fs = require('fs');
let code = fs.readFileSync('src/games/chess/aiBot.ts', 'utf-8');

// The file has a function called minimax(chess, depth, alpha, beta, isMaximizingPlayer)
// We will replace it with the SimpleAI usage.

code = code.replace(
  "import { Chess, Square } from 'chess.js';",
  "import { Chess, Square, Move } from 'chess.js';\nimport { SimpleAI, MinimaxGameRule } from '../../services/SimpleAI';"
);

const newGetBestChessMove = `export function getBestChessMove(
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
}`;

// We will find and replace the whole bottom part, stripping out the old minimax function and the old getBestChessMove.
const splitStr = 'function minimax(';
if (code.includes(splitStr)) {
  const firstPart = code.split(splitStr)[0];
  fs.writeFileSync('src/games/chess/aiBot.ts', firstPart + newGetBestChessMove + '\n');
}

