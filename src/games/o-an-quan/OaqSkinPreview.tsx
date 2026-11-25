import { useEffect, useRef } from 'react';
import type { EquippedFolkSkins, SkinItemDef } from '../folk-duel/types';
import { getSkinById } from '../folk-duel/skins-catalog';
import { campaignUniform } from './battlefield';
import { BOARD_H, BOARD_W, renderOAnQuanBoard } from './renderer';
import { createInitialOaqState } from './rules';
import { useCampaignImages } from './useCampaignImages';

export function OaqSkinPreview({ item, equipped }: { item: SkinItemDef; equipped: EquippedFolkSkins }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useCampaignImages(true);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const skins = { ...equipped, [item.category]: item.id };
    const unitSkin = getSkinById(skins.oaq_stones);
    const state = createInitialOaqState();
    state.scores = { P1: 14, P2: 4 };
    state.trayQuan = { P1: 1, P2: 0 };
    state.quanAlive[1] = false;
    renderOAnQuanBoard(ctx, state, skins, 3, [], state, {
      terrain: 'grass', ...images, units: images.units && campaignUniform(images.units, unitSkin),
    });
  }, [images, equipped, item]);

  return <canvas ref={canvas} width={BOARD_W} height={BOARD_H} className="fd-pixel-canvas" aria-label="Xem trang phục trên bàn Chiến Trường"/>;
}
