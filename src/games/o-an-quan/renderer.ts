import {drawOaqProp,drawOaqHand,STONE_FRAMES,HAND_FRAMES,BOARD_FRAMES,type OaqArtwork} from './art';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { EquippedFolkSkins } from '../folk-duel/types';
import { type OaqState } from './rules';

export interface OaqCellRect {
  idx: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isQuan: boolean;
}

export const BOARD_W = 640;
export const BOARD_H = 300;

export function getOaqCellRects(): OaqCellRect[] {
  const rects: OaqCellRect[] = [];
  const padX = 24;
  const padY = 36;
  const quanW = 86;
  const cellW = (BOARD_W - padX * 2 - quanW * 2) / 5; // 84px
  const cellH = (BOARD_H - padY * 2) / 2; // 114px

  // 0: Quan Trái
  rects.push({ idx: 0, x: padX, y: padY, w: quanW, h: cellH * 2, isQuan: true });

  // 1..5: P1 (Hàng dưới, từ trái sang phải)
  for (let i = 0; i < 5; i++) {
    rects.push({
      idx: i + 1,
      x: padX + quanW + i * cellW,
      y: padY + cellH,
      w: cellW,
      h: cellH,
      isQuan: false,
    });
  }

  // 6: Quan Phải
  rects.push({
    idx: 6,
    x: padX + quanW + cellW * 5,
    y: padY,
    w: quanW,
    h: cellH * 2,
    isQuan: true,
  });

  // 7..11: P2 (Hàng trên, từ phải sang trái để đúng vòng tròn 0..11)
  for (let i = 0; i < 5; i++) {
    rects.push({
      idx: 11 - i,
      x: padX + quanW + i * cellW,
      y: padY,
      w: cellW,
      h: cellH,
      isQuan: false,
    });
  }

  return rects.sort((a, b) => a.idx - b.idx);
}

function drawSingleStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  isQuan: boolean,
  palette: { primary: string; secondary: string; accent: string; highlight: string; outline: string }
) {
  ctx.fillStyle = palette.outline;
  ctx.beginPath();
  ctx.arc(x, y, r + 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isQuan ? palette.accent : palette.primary;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.secondary;
  ctx.beginPath();
  ctx.arc(x + r * 0.2, y + r * 0.25, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.highlight;
  ctx.fillRect(Math.round(x - r * 0.45), Math.round(y - r * 0.45), isQuan ? 4 : 2, isQuan ? 4 : 2);
}

export function renderOAnQuanBoard(
  ctx: CanvasRenderingContext2D,
  state: OaqState,
  skins: EquippedFolkSkins,
  selectedCell: number | null,
  previewCells: number[] = [],
  art?: OaqArtwork
) {
  ctx.imageSmoothingEnabled = false;
  const boardSkin = getSkinById(skins.oaq_board);
  const stoneSkin = getSkinById(skins.oaq_stones);

  // 1. Nền sân đình / bàn gỗ / chiếu cói
  ctx.fillStyle = boardSkin.palette.secondary;
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);

  // Họa tiết gạch tàu / vân gỗ pixel
  ctx.fillStyle = boardSkin.palette.primary;
  for (let gx = 8; gx < BOARD_W - 8; gx += 40) {
    for (let gy = 8; gy < BOARD_H - 8; gy += 28) {
      ctx.fillRect(gx, gy, 36, 24);
    }
  }
  if (art?.boards) {
    const [x,y,w,h]=BOARD_FRAMES[skins.oaq_board]??BOARD_FRAMES.board_terracotta;
    ctx.drawImage(art.boards,x,y,w,h,0,0,BOARD_W,BOARD_H);
  }
  const frames = STONE_FRAMES[skins.oaq_stones] ?? STONE_FRAMES.stones_pebbles;

  const rects = getOaqCellRects();

  for (const r of rects) {
    const isSelected = selectedCell === r.idx;
    const isPreview = previewCells.includes(r.idx);

    ctx.save();
    // Khung ô
    ctx.fillStyle = isSelected
      ? 'rgba(251, 191, 36, 0.26)'
      : isPreview
      ? 'rgba(56, 189, 248, 0.22)'
      : 'rgba(15, 23, 42, 0.18)';
    ctx.strokeStyle = isSelected ? '#FDE047' : boardSkin.palette.accent;
    ctx.lineWidth = isSelected ? 3 : 2;

    if (r.isQuan) {
      const radius = r.w / 2;
      ctx.beginPath();
      if (r.idx === 0) {
        ctx.roundRect(r.x, r.y, r.w, r.h, [radius, 8, 8, radius]);
      } else {
        ctx.roundRect(r.x, r.y, r.w, r.h, [8, radius, radius, 8]);
      }
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
      ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    }
    ctx.restore();

    // Vẽ quân Quan (nếu còn)
    const qSlot = r.idx === 0 ? 0 : r.idx === 6 ? 1 : null;
    if (qSlot !== null && state.quanAlive[qSlot]) {
      if (!drawOaqProp(ctx, art?.props, frames[1], r.x + r.w / 2, r.y + r.h / 2 - 14, 40))
        drawSingleStone(ctx, r.x + r.w / 2, r.y + r.h / 2 - 14, 15, true, stoneSkin.palette);
    }

    // Vẽ tối đa 12 viên Dân đại diện trong ô theo lưới xoắn ốc
    const danCount = state.cells[r.idx];
    const drawCount = Math.min(12, danCount);
    const centerX = r.x + r.w / 2;
    const centerY = r.y + r.h / 2 + (r.isQuan ? 22 : 4);
    for (let i = 0; i < drawCount; i++) {
      const angle = i * 2.39996;
      const dist = Math.min(22, 6 + Math.sqrt(i) * 5.2);
      const sx = Math.round(centerX + Math.cos(angle) * dist);
      const sy = Math.round(centerY + Math.sin(angle) * dist * 0.75);
      if (!drawOaqProp(ctx, art?.props, frames[0], sx, sy, 18))
        drawSingleStone(ctx, sx, sy, 6, false, stoneSkin.palette);
    }


    if (isSelected) drawOaqHand(ctx,art?.hands,(HAND_FRAMES[skins.oaq_hand]??HAND_FRAMES.hand_student)[0],r.x+r.w-14,r.y+r.h-18,46);

  }
}

/** Shop shares the exact sprites and board renderer used in a match. */
export function renderOaqShopPreview(canvas:HTMLCanvasElement,item:import('../folk-duel/types').SkinItemDef,tick:number,art:OaqArtwork){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#e6d4ad';ctx.fillRect(0,0,canvas.width,canvas.height);
 if(item.category==='oaq_stones'){
  const frames=STONE_FRAMES[item.id]??STONE_FRAMES.stones_pebbles;
  if(art.props){drawOaqProp(ctx,art.props,frames[0],35,65,27);drawOaqProp(ctx,art.props,frames[1],90,48+Math.sin(tick*.04)*2,59);drawOaqProp(ctx,art.props,frames[0],147,65,27);}
  else {drawSingleStone(ctx,35,65,11,false,item.palette);drawSingleStone(ctx,90,48,21,true,item.palette);drawSingleStone(ctx,147,65,11,false,item.palette);}
 }else if(item.category==='oaq_hand'){
  const frames=HAND_FRAMES[item.id]??HAND_FRAMES.hand_student;
  if(!drawOaqHand(ctx,art.hands,frames[1],62,57,82)){ctx.fillStyle=item.palette.primary;ctx.fillRect(20,20,82,68);}
  drawOaqHand(ctx,art.hands,frames[0],122,49,70);
 }else{
  ctx.fillStyle=item.palette.secondary;ctx.fillRect(10,12,160,84);ctx.fillStyle=item.palette.primary;ctx.fillRect(14,16,152,76);
  if(art.boards){const [x,y,w,h]=BOARD_FRAMES[item.id]??BOARD_FRAMES.board_terracotta;ctx.drawImage(art.boards,x,y,w,h,14,16,152,76);}
  ctx.strokeStyle='#fff3d9';ctx.lineWidth=2;ctx.strokeRect(23,25,134,58);
  for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(23+i*134/5,25);ctx.lineTo(23+i*134/5,83);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(23,54);ctx.lineTo(157,54);ctx.stroke();drawOaqProp(ctx,art.props,0,62,42,15);drawOaqProp(ctx,art.props,1,122,69,22);
 }
}
