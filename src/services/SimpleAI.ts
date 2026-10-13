export interface MinimaxGameRule<State, Move> {
  getPossibleMoves: (state: State) => Move[];
  applyMove: (state: State, move: Move, isMaximizingPlayer: boolean) => State;
  evaluateState: (state: State) => number;
  isGameOver: (state: State) => boolean;
}

export class SimpleAI {
  static getBestMove<State, Move>(
    currentState: State,
    rules: MinimaxGameRule<State, Move>,
    depth: number,
    isMaximizingPlayer: boolean
  ): Move | null {
    let bestMove: Move | null = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;
    
    const possibleMoves = rules.getPossibleMoves(currentState);
    if (possibleMoves.length === 0 || rules.isGameOver(currentState)) {
      return null;
    }
    
    for (const move of possibleMoves) {
      const nextState = rules.applyMove(currentState, move, isMaximizingPlayer);
      const value = this.minimax(nextState, rules, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);
      
      if (isMaximizingPlayer) {
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
      } else {
        if (value < bestValue) {
          bestValue = value;
          bestMove = move;
        }
      }
    }
    
    return bestMove || possibleMoves[0];
  }

  private static minimax<State, Move>(
    state: State,
    rules: MinimaxGameRule<State, Move>,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizingPlayer: boolean
  ): number {
    if (depth === 0 || rules.isGameOver(state)) {
      return rules.evaluateState(state);
    }

    const possibleMoves = rules.getPossibleMoves(state);
    if (possibleMoves.length === 0) {
      return rules.evaluateState(state);
    }
    
    if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of possibleMoves) {
        const nextState = rules.applyMove(state, move, isMaximizingPlayer);
        const ev = this.minimax(nextState, rules, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of possibleMoves) {
        const nextState = rules.applyMove(state, move, isMaximizingPlayer);
        const ev = this.minimax(nextState, rules, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }
}

