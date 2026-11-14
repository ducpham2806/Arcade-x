import type { FolkSeat } from '../folk-duel/types';
import {
  applyOaqMove,
  getValidOaqMoves,
  type OaqMove,
  type OaqState,
} from './rules';

export type OaqBotLevel = 'easy' | 'hard';

function evaluateState(state: OaqState, botSeat: FolkSeat): number {
  const oppSeat: FolkSeat = botSeat === 'P1' ? 'P2' : 'P1';
  const scoreDiff = state.scores[botSeat] - state.scores[oppSeat];
  const debtDiff = state.debt[oppSeat] - state.debt[botSeat];
  return scoreDiff * 3 + debtDiff * 2;
}

function minimax(
  state: OaqState,
  depth: number,
  maximizing: boolean,
  botSeat: FolkSeat,
  alpha: number,
  beta: number
): number {
  if (depth === 0 || state.finished) {
    return evaluateState(state, botSeat);
  }
  const currentSeat: FolkSeat = maximizing ? botSeat : botSeat === 'P1' ? 'P2' : 'P1';
  const moves = getValidOaqMoves(state, currentSeat);
  if (moves.length === 0) return evaluateState(state, botSeat);

  if (maximizing) {
    let best = -Infinity;
    for (const mv of moves) {
      const res = applyOaqMove(state, currentSeat, mv);
      if (!res.ok) continue;
      const val = minimax(res.nextState, depth - 1, false, botSeat, alpha, beta);
      best = Math.max(best, val);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const mv of moves) {
      const res = applyOaqMove(state, currentSeat, mv);
      if (!res.ok) continue;
      const val = minimax(res.nextState, depth - 1, true, botSeat, alpha, beta);
      best = Math.min(best, val);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function chooseOaqBotMove(
  state: OaqState,
  botSeat: FolkSeat,
  level: OaqBotLevel,
  rand: () => number = Math.random
): OaqMove | null {
  const moves = getValidOaqMoves(state, botSeat);
  if (moves.length === 0) return null;

  if (level === 'easy') {
    // Tí Sún: 40% đi ngẫu nhiên, 60% chọn nước ăn được nhiều nhất trong 1 bước
    if (rand() < 0.4) {
      return moves[Math.floor(rand() * moves.length)];
    }
    let best = moves[0];
    let bestGain = -1;
    for (const mv of moves) {
      const res = applyOaqMove(state, botSeat, mv);
      if (res.ok && res.nextState.lastCapturedPoints > bestGain) {
        bestGain = res.nextState.lastCapturedPoints;
        best = mv;
      }
    }
    return best;
  }

  // Bờm (Khó): Minimax depth 3
  let bestMove = moves[0];
  let bestScore = -Infinity;
  for (const mv of moves) {
    const res = applyOaqMove(state, botSeat, mv);
    if (!res.ok) continue;
    const score = minimax(res.nextState, 2, false, botSeat, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = mv;
    }
  }
  return bestMove;
}
