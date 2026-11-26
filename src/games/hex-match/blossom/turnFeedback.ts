import { key } from './engine';
import type { Goal, Level, Run } from './types';

export function goalProgress(goal: Goal, level: Level, run?: Run) {
  switch (goal.kind) {
    case 'score': return run?.score ?? 0;
    case 'combo': return run?.maxCombo ?? 0;
    case 'boss': return level.bossHP - (run?.bossHP ?? level.bossHP);
    default: return run?.progress[key(goal)] ?? 0;
  }
}

export function describeTurn(before: Run, after: Run) {
  const goals = after.level.goals.map(goal => {
    const previous = goalProgress(goal, before.level, before);
    const current = goalProgress(goal, after.level, after);
    return {
      gain: Math.max(0, Math.min(goal.target, current) - Math.min(goal.target, previous)),
      completed: previous < goal.target && current >= goal.target,
    };
  });
  return {
    runId: after.id,
    move: after.log.length,
    scoreGain: (after.completion?.score ?? after.score) - before.score,
    goals,
    spawnedSpecials: after.board.flatMap((tile, cell) =>
      tile.special && tile.id >= before.nextId ? [cell] : [],
    ),
  };
}

export type TurnFeedback = ReturnType<typeof describeTurn>;
