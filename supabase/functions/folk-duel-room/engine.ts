import { buildOaqFrames } from '../../../src/games/o-an-quan/turnAnimation.ts';
import { applyOaqMove, createInitialOaqState, recordOaqTurn } from '../../../src/games/o-an-quan/rules.ts';
import { applyNlcTurnResult, buildHopSequence, createInitialNlcState, getNlcTargetBox, type NlcMove } from '../../../src/games/nhay-lo-co/rules.ts';
import { folkPowerAt, type FolkCommand, type FolkStates, type NlcAction, type NlcOnlineStep } from '../../../src/games/folk-duel/online-protocol.ts';
import type { FolkGameKind, FolkSeat } from '../../../src/games/folk-duel/types.ts';

export function initialFolkState(game: FolkGameKind, turn: FolkSeat) {
  const state = game === 'o-an-quan' ? createInitialOaqState() : createInitialNlcState();
  state.turn = turn;
  if ('lastSummary' in state) state.lastSummary = `Đến lượt Người ${turn === 'P1' ? 1 : 2} thảy Chàm vào Ô 1!`;
  return state;
}

export function firstNlcStep(since: number, message: string): NlcOnlineStep {
  return { phase: 'THROW', since, hopIndex: 0, perfect: false, pickedUp: false, message };
}

export class FolkRoomError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

export function applySow(state: FolkStates['o-an-quan'], seat: FolkSeat, command: Extract<FolkCommand, { type: 'sow' }>) {
  const { move } = command;
  if (!Number.isInteger(move?.cellIndex) || (move.direction !== 'CW' && move.direction !== 'CCW')) {
    throw new FolkRoomError('INVALID_MOVE', 'Chọn ô và hướng rải hợp lệ.');
  }
  const result = applyOaqMove(state, seat, move);
  if (!result.ok) throw new FolkRoomError('INVALID_MOVE', result.error ?? 'Nước đi không hợp lệ.');
  return {
    state: recordOaqTurn(state, move, result.nextState, result.steps),
    duration: Math.ceil(buildOaqFrames(state, result.steps).reduce((total, frame) => total + frame.duration, 0)),
  };
}

const METER_START_MS = 900;
const MIN_HOP_MS = 110;

export function applyNlcAction(state: FolkStates['nhay-lo-co'], step: NlcOnlineStep, seat: FolkSeat, action: NlcAction, now: number) {
  const target = getNlcTargetBox(state, seat);
  const sequence = buildHopSequence(target, state.houses, seat);
  const finish = (result: Omit<NlcMove, 'kind'>) => {
    const accepted = applyNlcTurnResult(state, seat, { kind: 'TURN_RESULT', ...result });
    if (!accepted.ok) throw new FolkRoomError('INVALID_MOVE', accepted.error ?? 'Lượt đi không hợp lệ.');
    return { state: accepted.nextState, step: firstNlcStep(now + METER_START_MS, accepted.nextState.lastSummary) };
  };
  const complete = () => finish({ throwSuccess: true, throwPerfect: step.perfect, hopCompleted: true, scoreGained: step.perfect ? 25 : 15 });
  const foul = (throwSuccess: boolean, missedPickup = false) => finish({
    throwSuccess, throwPerfect: step.perfect, hopCompleted: false, scoreGained: 0, missedPickup,
  });

  if (action.type === 'hop' && step.phase === 'HOP') {
    if (action.feet !== 'SINGLE' && action.feet !== 'DOUBLE') throw new FolkRoomError('INVALID_MOVE', 'Chọn một hoặc hai chân.');
    if (now - step.since < MIN_HOP_MS) throw new FolkRoomError('TOO_EARLY', 'Chờ chạm đất rồi nhảy bước tiếp.');
    const expected = sequence[step.hopIndex];
    if (!expected || action.feet !== expected.expectedHop) return foul(true);
    const hopIndex = step.hopIndex + 1;
    if (expected.pickChamHere) return {
      state, step: { ...step, hopIndex, phase: 'PICKUP' as const, since: now + METER_START_MS, message: `Canh nhịp nhặt Chàm ở ô ${target}.` },
    };
    if (hopIndex === sequence.length && step.pickedUp) return complete();
    return { state, step: { ...step, hopIndex, since: now } };
  }

  if ((action.type === 'throw' && step.phase === 'THROW') || (action.type === 'pickup' && step.phase === 'PICKUP')) {
    if (now < step.since) throw new FolkRoomError('TOO_EARLY', 'Đợi vạch canh lực bắt đầu.');
    const power = folkPowerAt(step.since, now);
    const inGreen = power >= 25 && power <= 75;
    if (action.type === 'throw') {
      if (!inGreen) return foul(false);
      const perfect = power >= 42 && power <= 58;
      return { state, step: { ...step, phase: 'HOP' as const, since: now, perfect, message: `Chàm đã vào ô ${target}.` } };
    }
    if (!inGreen) return foul(true, true);
    if (step.hopIndex === sequence.length) return complete();
    return { state, step: { ...step, phase: 'HOP' as const, pickedUp: true, since: now, message: 'Đã nhặt Chàm. Nhảy về vạch xuất phát.' } };
  }

  throw new FolkRoomError('BAD_PHASE', 'Thao tác chưa đúng bước trong lượt này.');
}
