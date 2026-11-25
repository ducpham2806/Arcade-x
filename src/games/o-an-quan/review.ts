import { applyOaqMove, createInitialOaqState, getOaqTray, type OaqState, type OaqTurn } from './rules';

export function replayOaqPositions(turns: readonly OaqTurn[], finalState: OaqState): OaqState[] {
  const positions = [createInitialOaqState()];
  for (const turn of turns) {
    const before = positions[positions.length - 1];
    if (before.turnNumber !== turn.turn || before.turn !== turn.seat) return [];
    const result = applyOaqMove(before, turn.seat, turn.move);
    if (!result.ok) return [];
    positions.push(result.nextState);
  }

  const last = positions[positions.length - 1];
  const sameBoard = last.cells.every((count, index) => count === finalState.cells[index])
    && last.quanAlive.every((alive, index) => alive === finalState.quanAlive[index])
    && last.turnNumber === finalState.turnNumber && last.turn === finalState.turn;
  const sameScore = (['P1', 'P2'] as const).every(seat => last.scores[seat] === finalState.scores[seat]
    && getOaqTray(last, seat).quan === getOaqTray(finalState, seat).quan);
  return sameBoard && sameScore ? positions : [];
}
