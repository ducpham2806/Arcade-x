import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { FolkSoundEngine } from '../folk-duel/sfx';
import type { EquippedFolkSkins, SkinItemDef } from '../folk-duel/types';
import { getSkinById } from '../folk-duel/skins-catalog';
import { campaignUniform, type OaqTerrain } from './battlefield';
import { campaignAttackOrigins, campaignTrayState, renderCampaignTurn } from './renderCampaignTurn';
import { renderOaqTurnFrame } from './renderTurn';
import { renderOAnQuanBoard } from './renderer';
import type { OaqState, OaqStepEvent } from './rules';
import { useCampaignImages } from './useCampaignImages';
import { buildOaqFrames, type OaqFrame } from './turnAnimation';

interface Run {
  frames: OaqFrame[];
  index: number;
  elapsed: number;
  cueSent: boolean;
  attackOrigins: (number | null)[];
  trayState: OaqState;
}

export function useOaqAnimation({ canvas, state, skins, selected, preview, paused, sound, stoneSound, motionEnabled, terrain }: {
  canvas: RefObject<HTMLCanvasElement | null>;
  state: OaqState;
  skins: EquippedFolkSkins;
  selected: number | null;
  preview: number[];
  paused: boolean;
  motionEnabled: boolean;
  terrain: OaqTerrain;
  sound: FolkSoundEngine;
  stoneSound: SkinItemDef['sfxProfile'];
}) {
  const [startingBoard, setStartingBoard] = useState<OaqState | null>(null);
  const [presentedTray, setPresentedTray] = useState<OaqState | null>(null);
  const images = useCampaignImages(terrain !== 'classic');
  const units = useMemo(() => images.units && campaignUniform(images.units, getSkinById(skins.oaq_stones)), [images.units, skins.oaq_stones]);
  const run = useRef<Run | null>(null);
  const running = useCallback(() => run.current !== null, []);
  const finish = useCallback(() => {
    run.current = null;
    setStartingBoard(null);
    setPresentedTray(null);
  }, []);
  const start = useCallback((before: OaqState, steps: OaqStepEvent[]) => {
    if (run.current || !motionEnabled) return false;
    const frames = buildOaqFrames(before, steps);
    if (!frames.length) return false;
    run.current = { frames, index: 0, elapsed: 0, cueSent: false, attackOrigins: campaignAttackOrigins(frames), trayState: before };
    setStartingBoard(before);
    return true;
  }, [motionEnabled]);

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!ctx || !element) return;
    const field = terrain === 'classic' ? undefined : { terrain, ...images, units };
    if (!motionEnabled && run.current) finish();
    if (!run.current) {
      delete element.dataset.oaqStep;
      delete element.dataset.oaqCell;
      delete element.dataset.oaqFrame;
      renderOAnQuanBoard(ctx, state, skins, selected, preview, state, field);
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
      if (field?.units) {
        const projected = campaignTrayState(frame, progress);
        if (projected.scores.P1 !== current.trayState.scores.P1 || projected.scores.P2 !== current.trayState.scores.P2
          || projected.trayQuan?.P1 !== current.trayState.trayQuan?.P1 || projected.trayQuan?.P2 !== current.trayState.trayQuan?.P2) {
          current.trayState = projected;
          setPresentedTray(projected);
        }
        renderCampaignTurn(ctx, frame, progress, skins, { ...field, units: field.units }, projected, current.attackOrigins[current.index]);
      } else {
        renderOaqTurnFrame(ctx, frame, progress, skins, field);
      }
      if (!paused && !current.cueSent && progress >= (frame.step.type === 'drop' ? .78 : field?.units ? .32 : .27)) {
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
  }, [canvas, state, skins, selected, preview, paused, startingBoard, sound, stoneSound, finish, motionEnabled, terrain, images, units]);

  return { startingBoard, presentedTray, start, finish, running };
}
