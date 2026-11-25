import { readableCanvasText } from '../../accessibility/canvasText';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { EquippedFolkSkins, FolkSeat } from '../folk-duel/types';
import { campaignFormation, drawCampaignGround, drawCampaignUnit, oppositeSeat, type OaqBattlefield } from './battlefield';
import { cellTotalStones, getOaqTray, type OaqState } from './rules';

export interface OaqCellRect {
  idx: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isQuan: boolean;
}

export const BOARD_W = 640;
export const BOARD_H = 394;
const TABLE_TOP = 47;
const TABLE_H = 300;

export const OAQ_SEAT_COLOR = { P1: '#ffbc73', P2: '#79e2cb' };

export function getOaqTrayRect(seat: FolkSeat) {
  return { x: 110, y: seat === 'P2' ? 5 : TABLE_TOP + TABLE_H + 4, w: 420, h: 38 };
}

export function getOaqCellRects(): OaqCellRect[] {
  const rects: OaqCellRect[] = [];
  const padX = 24;
  const padY = TABLE_TOP + 26;
  const quanW = 86;
  const cellW = (BOARD_W - padX * 2 - quanW * 2) / 5;
  const cellH = (TABLE_H - 52) / 2;

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

export function drawSingleStone(
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

function drawTray(ctx: CanvasRenderingContext2D, state: OaqState, seat: FolkSeat, skins: EquippedFolkSkins, field?: OaqBattlefield) {
  const { x, y, w, h } = getOaqTrayRect(seat);
  const stones = getOaqTray(state, seat);
  const hand = getSkinById(skins.oaq_hand).palette;
  const stone = getSkinById(skins.oaq_stones).palette;
  ctx.save();
  ctx.fillStyle = hand.outline;
  ctx.strokeStyle = OAQ_SEAT_COLOR[seat];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 13);
  ctx.fill();
  ctx.stroke();
  ctx.clip();
  ctx.strokeStyle = hand.secondary;
  ctx.globalAlpha = .42;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= w; i += 12) {
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + 34, y + h);
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + 34, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (let i = 0; i < Math.min(16, stones.dan); i++) {
    const sx = x + 101 + (i % 8) * 15 + Math.floor(i / 8) * 5;
    const sy = y + 13 + Math.floor(i / 8) * 12;
    if (field?.units) drawCampaignUnit(ctx, field.units, oppositeSeat(seat), sx, sy, 15);
    else drawSingleStone(ctx, sx, sy, 5.3, false, stone);
  }
  for (let i = 0; i < stones.quan; i++) {
    const sx = x + 235 + i * 22;
    if (field?.units) drawCampaignUnit(ctx, field.units, oppositeSeat(seat), sx, y + 18, 24, true);
    else drawSingleStone(ctx, sx, y + 18, 9, true, stone);
  }
  ctx.font = '700 18px system-ui';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = OAQ_SEAT_COLOR[seat];
  readableCanvasText(ctx, field ? (seat === 'P1' ? 'Trại 1' : 'Trại 2') : (seat === 'P1' ? 'Mẹt 1' : 'Mẹt 2'), x + 11, y + h / 2);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff5df';
  const unit = field ? 'lính' : 'sỏi';
  readableCanvasText(ctx, stones.quan ? `${stones.dan} ${unit} · ${stones.quan} Q` : `${stones.dan} ${unit}`, x + w - 10, y + h / 2);
  ctx.restore();
}

export function renderOAnQuanBoard(
  ctx: CanvasRenderingContext2D,
  state: OaqState,
  skins: EquippedFolkSkins,
  selectedCell: number | null,
  previewCells: number[] = [],
  trayState = state,
  field?: OaqBattlefield
) {
  ctx.imageSmoothingEnabled = false;
  const boardSkin = getSkinById(skins.oaq_board);
  const stoneSkin = getSkinById(skins.oaq_stones);

  // 1. Nền sân đình / bàn gỗ / chiếu cói
  ctx.fillStyle = boardSkin.palette.outline;
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);
  if (field) {
    drawCampaignGround(ctx, field, 0, TABLE_TOP, BOARD_W, TABLE_H);
  } else {
    ctx.fillStyle = boardSkin.palette.secondary;
    ctx.fillRect(0, TABLE_TOP, BOARD_W, TABLE_H);
    ctx.fillStyle = boardSkin.palette.primary;
    for (let gx = 8; gx < BOARD_W - 8; gx += 40) {
      for (let gy = TABLE_TOP + 8; gy < TABLE_TOP + TABLE_H - 26; gy += 28) {
        ctx.fillRect(gx, gy, 36, 24);
      }
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
      : field ? '#15120e7d' : 'rgba(15, 23, 42, 0.18)';
    ctx.strokeStyle = isSelected ? '#ffe6b4' : r.isQuan ? boardSkin.palette.accent : OAQ_SEAT_COLOR[r.idx <= 5 ? 'P1' : 'P2'];
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
    const seat = r.idx <= 5 ? 'P1' : 'P2';
    const facing = r.idx === 6 || (!r.isQuan && seat === 'P2') ? -1 : 1;
    if (qSlot !== null && state.quanAlive[qSlot]) {
      if (field?.units) drawCampaignUnit(ctx, field.units, seat, r.x + r.w / 2, r.y + r.h / 2 - 18, 72, true, facing);
      else drawSingleStone(ctx, r.x + r.w / 2, r.y + r.h / 2 - 14, 15, true, stoneSkin.palette);
    }

    // Vẽ tối đa 12 viên Dân đại diện trong ô theo lưới xoắn ốc
    const danCount = state.cells[r.idx];
    const drawCount = Math.min(12, danCount);
    const centerX = r.x + r.w / 2;
    const centerY = r.y + r.h / 2 + (r.isQuan ? 22 : 4);
    for (let i = 0; i < drawCount; i++) {
      if (field?.units) {
        const point = campaignFormation(centerX, centerY - 12, i);
        drawCampaignUnit(ctx, field.units, seat, point.x, point.y, 31, false, facing);
        continue;
      }
      const angle = i * 2.39996;
      const dist = Math.min(22, 6 + Math.sqrt(i) * 5.2);
      const sx = Math.round(centerX + Math.cos(angle) * dist);
      const sy = Math.round(centerY + Math.sin(angle) * dist * 0.75);
      drawSingleStone(ctx, sx, sy, 6, false, stoneSkin.palette);
    }

    // Badge số lượng sỏi rõ nét ở góc ô
    const totalDisplay = cellTotalStones(state, r.idx);
    const ptsDisplay = r.isQuan && qSlot !== null && state.quanAlive[qSlot] ? `${state.cells[r.idx]}+Q` : `${totalDisplay}`;
    const badgeWidth = r.isQuan ? 58 : 36;
    ctx.fillStyle = totalDisplay > 0 ? '#1C1008' : 'rgba(28, 16, 8, 0.5)';
    ctx.fillRect(r.x + 6, r.y + 6, badgeWidth, 26);
    ctx.strokeStyle = boardSkin.palette.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x + 6, r.y + 6, badgeWidth, 26);

    ctx.fillStyle = totalDisplay > 0 ? '#FDE047' : '#94A3B8';
    ctx.font = 'bold 20px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    readableCanvasText(ctx, ptsDisplay, r.x + 6 + badgeWidth / 2, r.y + 19);
  }
  drawTray(ctx, trayState, 'P2', skins, field);
  drawTray(ctx, trayState, 'P1', skins, field);
}
