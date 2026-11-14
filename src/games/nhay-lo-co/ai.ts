import type { FolkSeat } from '../folk-duel/types';
import type { NlcMove, NlcState } from './rules';

export type NlcBotLevel = 'easy' | 'hard';

export function simulateNlcBotTurn(
  _state: NlcState,
  _botSeat: FolkSeat,
  level: NlcBotLevel,
  rand: () => number = Math.random
): NlcMove {
  const throwRate = level === 'easy' ? 0.72 : 0.92;
  const perfectRate = level === 'easy' ? 0.2 : 0.55;
  const hopRate = level === 'easy' ? 0.75 : 0.93;

  const throwSuccess = rand() < throwRate;
  if (!throwSuccess) {
    return { throwSuccess: false, throwPerfect: false, hopCompleted: false, scoreGained: 0, kind: 'TURN_RESULT' };
  }
  const throwPerfect = rand() < perfectRate;
  const hopCompleted = rand() < hopRate;
  return {
    kind: 'TURN_RESULT',
    throwSuccess: true,
    throwPerfect,
    hopCompleted,
    scoreGained: hopCompleted ? (throwPerfect ? 25 : 15) : 0,
  };
}
