import { getSkinById } from '../folk-duel/skins-catalog';
import type { EquippedFolkSkins } from '../folk-duel/types';
import { cellTotalStones, type OaqState } from './rules';

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
  previewCells: number[] = []
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
      drawSingleStone(ctx, sx, sy, 6, false, stoneSkin.palette);
    }

    // Badge số lượng sỏi rõ nét ở góc ô
    const totalDisplay = cellTotalStones(state, r.idx);
    const ptsDisplay = r.isQuan && qSlot !== null && state.quanAlive[qSlot] ? `${state.cells[r.idx]}+Q` : `${totalDisplay}`;
    ctx.fillStyle = totalDisplay > 0 ? '#1C1008' : 'rgba(28, 16, 8, 0.5)';
    ctx.fillRect(r.x + 6, r.y + 6, r.isQuan ? 34 : 24, 18);
    ctx.strokeStyle = boardSkin.palette.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x + 6, r.y + 6, r.isQuan ? 34 : 24, 18);

    ctx.fillStyle = totalDisplay > 0 ? '#FDE047' : '#94A3B8';
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ptsDisplay, r.x + 6 + (r.isQuan ? 17 : 12), r.y + 15);
  }
}
