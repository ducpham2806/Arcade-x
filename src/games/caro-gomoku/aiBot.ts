const BOARD_SIZE = 15;
import { SimpleAI, MinimaxGameRule } from '../../services/SimpleAI';

function getCandidateCells(boardState: Record<string, string>, radius: number): { x: number; y: number }[] {
  const set = new Set<string>();
  const occupied = Object.keys(boardState);
  if (occupied.length === 0) {
    return [{ x: Math.floor(BOARD_SIZE / 2), y: Math.floor(BOARD_SIZE / 2) }];
  }

  for (const key of occupied) {
    const [sx, sy] = key.split('_').map(Number);
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = sx + dx;
        const ny = sy + dy;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          if (!boardState[`${nx}_${ny}`]) {
            set.add(`${nx}_${ny}`);
          }
        }
      }
    }
  }

  return Array.from(set).map((k) => {
    const [x, y] = k.split('_').map(Number);
    return { x, y };
  });
}

function evaluatePosition(
  boardState: Record<string, string>,
  x: number,
  y: number,
  symbol: string
): number {
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
  ];
  let totalScore = 0;

  for (const { dx, dy } of directions) {
    let count = 1;
    let openEnds = 0;

    let step = 1;
    while (true) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
      const cell = boardState[`${nx}_${ny}`];
      if (cell === symbol) {
        count++;
        step++;
      } else if (!cell) {
        openEnds++;
        break;
      } else {
        break;
      }
    }

    step = 1;
    while (true) {
      const nx = x - dx * step;
      const ny = y - dy * step;
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;
      const cell = boardState[`${nx}_${ny}`];
      if (cell === symbol) {
        count++;
        step++;
      } else if (!cell) {
        openEnds++;
        break;
      } else {
        break;
      }
    }

    if (count >= 5) totalScore += 100000;
    else if (count === 4) {
      if (openEnds === 2) totalScore += 10000;
      else if (openEnds === 1) totalScore += 2500;
    } else if (count === 3) {
      if (openEnds === 2) totalScore += 1500;
      else if (openEnds === 1) totalScore += 300;
    } else if (count === 2) {
      if (openEnds === 2) totalScore += 100;
      else if (openEnds === 1) totalScore += 20;
    }
  }
  return totalScore;
}

export function caroWinner(state: Record<string,string>): string | null {
 for(const key of Object.keys(state)) {
  const [x,y]=key.split('_').map(Number), symbol=state[key];
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
   if([1,2,3,4].every(n=>state[`${x+dx*n}_${y+dy*n}`]===symbol)) return symbol;
  }
 }
 return null;
}

export function getBestBotMove(
  boardState: Record<string, string>,
  botSymbol: 'X' | 'O',
  difficulty: 'easy' | 'medium' | 'hard' = 'hard'
): { x: number; y: number } {
  const humanSymbol = botSymbol === 'X' ? 'O' : 'X';
  const occupiedCount = Object.keys(boardState).length;

  const center = Math.floor(BOARD_SIZE / 2);
  if (occupiedCount === 0 || (!boardState[`${center}_${center}`] && occupiedCount < 2)) {
    return { x: center, y: center };
  }

  const candidates = getCandidateCells(boardState, 1);
  // A finished winning line is terminal, even if the opponent threatens a win.
  for(const symbol of [botSymbol, humanSymbol]) {
   const win=candidates.find(m=>caroWinner({...boardState,[`${m.x}_${m.y}`]:symbol})===symbol);
   if(win)return win;
  }
  if (difficulty === 'easy' && Math.random() < 0.4) {
    const cells = getCandidateCells(boardState, 1);
    if (cells.length > 0) return cells[Math.floor(Math.random() * cells.length)];
  }

  // Optimize for fast response using Minimax with depth 1 or 2 based on difficulty
  // For 'hard' difficulty, we use depth 2, otherwise depth 1
  const depth = difficulty === 'hard' ? 3 : 1;
  const radius = difficulty === 'hard' ? 1 : 1;

  const rules: MinimaxGameRule<Record<string, string>, { x: number; y: number }> = {
    getPossibleMoves: (state) => {
      // Sort moves by heuristic to improve alpha-beta pruning
      const candidates = getCandidateCells(state, radius);
      if (depth > 1) {
        // Fast pre-sort: just evaluate attack + defense for current player
        candidates.sort((a, b) => {
          const sA = evaluatePosition(state, a.x, a.y, botSymbol) + evaluatePosition(state, a.x, a.y, humanSymbol);
          const sB = evaluatePosition(state, b.x, b.y, botSymbol) + evaluatePosition(state, b.x, b.y, humanSymbol);
          return sB - sA;
        });
        // Take top 10 to keep branch factor small for Gomoku depth 2
        return candidates.slice(0, 12);
      }
      return candidates;
    },
    applyMove: (state, move, isAiTurn) => {
      const sym = isAiTurn ? botSymbol : humanSymbol;
      return { ...state, [`${move.x}_${move.y}`]: sym };
    },
    evaluateState: (state) => {
      // Global evaluation
      const winner=caroWinner(state);
      if(winner) return winner===botSymbol ? 100000000 : -100000000;
      let aiScore = 0;
      let humanScore = 0;
      const occupied = Object.keys(state);
      for (const key of occupied) {
        const [x, y] = key.split('_').map(Number);
        const sym = state[key];
        if (sym === botSymbol) {
          aiScore += evaluatePosition(state, x, y, botSymbol) / 5; 
        } else {
          humanScore += evaluatePosition(state, x, y, humanSymbol) / 5;
        }
      }
      return aiScore - humanScore * 1.1; // Slightly defensive
    },
    isGameOver: (state) => {
      return !!caroWinner(state) || Object.keys(state).length >= BOARD_SIZE * BOARD_SIZE;
    }
  };

  const bestMove = SimpleAI.getBestMove(boardState, rules, depth, true);
  return bestMove || { x: center, y: center };
}

