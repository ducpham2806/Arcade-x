import { cloneOaqState, ensureSideHasStones, getOaqTray, getQuanSlot, type OaqState, type OaqStepEvent } from './rules.ts';

export type AnimatedOaqStep = Omit<OaqStepEvent, 'type'> & { type: Exclude<OaqStepEvent['type'], 'stop'> };

export interface OaqFrame {
  step: AnimatedOaqStep;
  before: OaqState;
  after: OaqState;
  fromCell: number | null;
  stonesInHand: number;
  duration: number;
  combo: number;
}

export function buildOaqFrames(initial: OaqState, steps: readonly OaqStepEvent[]): OaqFrame[] {
  const frames: OaqFrame[] = [];
  const drops = steps.filter(step => step.type === 'drop').length;
  const dropDuration = Math.max(65, Math.min(145, 4300 / Math.max(1, drops)));
  let before = initial;
  let stonesInHand = 0;
  let fromCell: number | null = null;
  let combo = 0;

  for (const step of steps) {
    if (step.type === 'stop') continue;
    const after = step.type === 'resow' ? ensureSideHasStones(before, step.seat) : cloneOaqState(before);
    switch (step.type) {
      case 'pickup':
        after.cells[step.cellIndex] = 0;
        break;
      case 'drop':
        after.cells[step.cellIndex] = step.count;
        break;
      case 'capture':
      case 'sweep': {
        after.cells[step.cellIndex] = 0;
        const slot = getQuanSlot(step.cellIndex);
        if (step.isQuan && slot !== null) {
          after.quanAlive[slot] = false;
          after.trayQuan ??= { P1: getOaqTray(before, 'P1').quan, P2: getOaqTray(before, 'P2').quan };
          after.trayQuan[step.seat] += 1;
          after.quanCaptured[step.seat] += 1;
        }
        after.scores[step.seat] += step.count;
        if (step.type === 'capture') combo += 1;
        break;
      }
    }

    const duration = {
      pickup: 245,
      drop: dropDuration,
      capture: 540,
      sweep: 185,
      resow: 375,
    }[step.type];
    frames.push({ step: { ...step, type: step.type }, before, after, fromCell, stonesInHand, duration, combo });

    before = after;
    fromCell = step.type === 'pickup' || step.type === 'drop' ? step.cellIndex : null;
    stonesInHand = step.type === 'pickup' ? step.count : step.type === 'drop' ? stonesInHand - 1 : 0;
  }

  return frames;
}
