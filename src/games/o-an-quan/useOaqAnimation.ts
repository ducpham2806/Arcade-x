import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { FolkSoundEngine } from '../folk-duel/sfx';
import type { EquippedFolkSkins, SkinItemDef } from '../folk-duel/types';
import { renderOaqTurnFrame } from './renderTurn';
import { renderOAnQuanBoard } from './renderer';
import type { OaqState, OaqStepEvent } from './rules';
import { buildOaqFrames, type OaqFrame } from './turnAnimation';

interface Run {
  frames: OaqFrame[];
  index: number;
  elapsed: number;
  cueSent: boolean;
}

export function useOaqAnimation({ canvas, state, skins, selected, preview, paused, sound, stoneSound }: {
  canvas: RefObject<HTMLCanvasElement | null>;
  state: OaqState;
  skins: EquippedFolkSkins;
  selected: number | null;
  preview: number[];
  paused: boolean;
  sound: FolkSoundEngine;
  stoneSound: SkinItemDef['sfxProfile'];
}) {
  const [startingBoard, setStartingBoard] = useState<OaqState | null>(null);
  const run = useRef<Run | null>(null);
  const running = useCallback(() => run.current !== null, []);
  const finish = useCallback(() => {
    run.current = null;
    setStartingBoard(null);
  }, []);
  const start = useCallback((before: OaqState, steps: OaqStepEvent[]) => {
    if (run.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const frames = buildOaqFrames(before, steps);
    if (!frames.length) return false;
    run.current = { frames, index: 0, elapsed: 0, cueSent: false };
    setStartingBoard(before);
    return true;
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!ctx || !element) return;
    if (!run.current) {
      delete element.dataset.oaqStep;
      delete element.dataset.oaqCell;
      delete element.dataset.oaqFrame;
      renderOAnQuanBoard(ctx, state, skins, selected, preview);
      return;
    }

    let raf = 0;
    let last: number | null = null;
    const draw = (now: number) => {
      const current = run.current;
      if (!current) return;
      if (last !== null && !paused) current.elapsed += Math.min(48, now - last);
      last = now;
      const frame = current.frames[current.index];
      const progress = Math.min(1, current.elapsed / frame.duration);
      element.dataset.oaqStep = frame.step.type;
      element.dataset.oaqCell = String(frame.step.cellIndex);
      element.dataset.oaqFrame = String(current.index);
      renderOaqTurnFrame(ctx, frame, progress, skins);
      if (!paused && !current.cueSent && progress >= (frame.step.type === 'drop' ? .78 : .27)) {
        current.cueSent = true;
        if (frame.step.type === 'drop') sound.playDropStone(Math.max(0, frame.step.count - 1), stoneSound);
        if (frame.step.type === 'capture') sound.playCapture(frame.step.isQuan);
      }
      if (progress >= 1) {
        current.index += 1;
        current.elapsed = 0;
        current.cueSent = false;
        if (current.index === current.frames.length) {
          finish();
          return;
        }
      }
      if (!paused) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [canvas, state, skins, selected, preview, paused, startingBoard, sound, stoneSound, finish]);

  return { startingBoard, start, finish, running };
}
