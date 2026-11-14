import { getSkinById } from '../folk-duel/skins-catalog';
import type { EquippedFolkSkins, FolkSeat } from '../folk-duel/types';
import type { NlcState } from './rules';

export const COURT_W = 340;
export const COURT_H = 480;

export interface BoxLayout {
  box: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isDouble: boolean;
  isSemiCircle?: boolean;
}

export function getNlcBoxLayouts(): BoxLayout[] {
  const cx = COURT_W / 2;
  const singleW = 86;
  const doubleW = 74;
  const h = 48;
  // Vẽ từ dưới (Ô 1) lên trên (Ô 10 Đầu Chùa)
  return [
    { box: 10, x: cx - 72, y: 20, w: 144, h: 52, isDouble: true, isSemiCircle: true },
    { box: 9, x: cx - singleW / 2, y: 76, w: singleW, h, isDouble: false },
    { box: 7, x: cx - doubleW - 3, y: 128, w: doubleW, h, isDouble: true },
    { box: 8, x: cx + 3, y: 128, w: doubleW, h, isDouble: true },
    { box: 6, x: cx - singleW / 2, y: 180, w: singleW, h, isDouble: false },
    { box: 4, x: cx - doubleW - 3, y: 232, w: doubleW, h, isDouble: true },
    { box: 5, x: cx + 3, y: 232, w: doubleW, h, isDouble: true },
    { box: 3, x: cx - singleW / 2, y: 284, w: singleW, h, isDouble: false },
    { box: 2, x: cx - singleW / 2, y: 336, w: singleW, h, isDouble: false },
    { box: 1, x: cx - singleW / 2, y: 388, w: singleW, h, isDouble: false },
  ];
}

export function renderNhayLoCoCourt(
  ctx: CanvasRenderingContext2D,
  state: NlcState,
  skins: EquippedFolkSkins,
  activeBoxes: number[],
  chamBox: number | null,
  mySeat: FolkSeat,
  tick: number
) {
  ctx.imageSmoothingEnabled = false;
  const courtSkin = getSkinById(skins.nlc_court);
  const doubleSkin = getSkinById(skins.nlc_double_tile);
  const chamSkin = getSkinById(skins.nlc_cham);
  const charSkin = getSkinById(skins.nlc_character);

  // 1. Nền sân ngõ nhỏ / sân trường / phố cổ Hội An
  ctx.fillStyle = courtSkin.palette.secondary;
  ctx.fillRect(0, 0, COURT_W, COURT_H);
  ctx.fillStyle = courtSkin.palette.primary;
  ctx.fillRect(10, 10, COURT_W - 20, COURT_H - 20);

  // Tường vôi & hoa giấy góc trên (trang trí pixel)
  ctx.fillStyle = courtSkin.palette.accent;
  ctx.fillRect(14, 14, 24, 16);
  ctx.fillRect(COURT_W - 38, 14, 24, 16);

  const layouts = getNlcBoxLayouts();

  for (const item of layouts) {
    const isDoublePair = item.box === 4 || item.box === 5 || item.box === 7 || item.box === 8;
    const isActive = activeBoxes.includes(item.box);
    const houseOwner = state.houses[item.box];

    ctx.save();
    if (isDoublePair) {
      // Render Ô Viên Gạch Đôi theo Skin đã trang bị!
      ctx.fillStyle = doubleSkin.palette.outline;
      ctx.fillRect(item.x - 2, item.y - 2, item.w + 4, item.h + 4);
      ctx.fillStyle = doubleSkin.palette.primary;
      ctx.fillRect(item.x, item.y, item.w, item.h);
      ctx.fillStyle = doubleSkin.palette.secondary;
      ctx.fillRect(item.x + 6, item.y + 6, item.w - 12, item.h - 12);
      ctx.fillStyle = doubleSkin.palette.accent;
      ctx.fillRect(item.x + item.w / 2 - 8, item.y + item.h / 2 - 6, 16, 12);
    } else if (item.isSemiCircle) {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.roundRect(item.x, item.y, item.w, item.h, [40, 40, 6, 6]);
      ctx.fill();
      ctx.strokeStyle = courtSkin.palette.highlight;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(item.x, item.y, item.w, item.h);
      ctx.strokeStyle = courtSkin.palette.highlight;
      ctx.lineWidth = 3;
      ctx.strokeRect(item.x, item.y, item.w, item.h);
    }

    // Highlight ô mục tiêu đang đứng
    if (isActive) {
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 4;
      ctx.strokeRect(item.x - 2, item.y - 2, item.w + 4, item.h + 4);
    }

    // Số ô phấn trắng
    ctx.fillStyle = isDoublePair ? doubleSkin.palette.highlight : courtSkin.palette.highlight;
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(item.box === 10 ? 'CHÙA' : String(item.box), item.x + 6, item.y + 5);

    // Dấu Nhà (đã chiếm)
    if (houseOwner) {
      const isMine = houseOwner === mySeat;
      ctx.fillStyle = isMine ? '#22C55E' : '#EF4444';
      ctx.fillRect(item.x + item.w - 24, item.y + 6, 18, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏠', item.x + item.w - 15, item.y + 8);
    }

    // Mảnh Chàm đang nằm trong ô
    if (chamBox === item.box) {
      ctx.fillStyle = chamSkin.palette.outline;
      ctx.fillRect(item.x + item.w / 2 - 9, item.y + item.h / 2 - 5, 18, 14);
      ctx.fillStyle = chamSkin.palette.primary;
      ctx.fillRect(item.x + item.w / 2 - 7, item.y + item.h / 2 - 3, 14, 10);
      ctx.fillStyle = chamSkin.palette.secondary;
      ctx.fillRect(item.x + item.w / 2 - 3, item.y + item.h / 2, 6, 4);
    }
    ctx.restore();
  }

  // Vẽ nhân vật Pixel đang nhảy ở activeBoxes
  if (activeBoxes.length > 0) {
    const boxObj = layouts.find((l) => l.box === activeBoxes[0]);
    if (boxObj) {
      const px = activeBoxes.length === 2 ? COURT_W / 2 : boxObj.x + boxObj.w / 2;
      const py = boxObj.y + boxObj.h / 2 + Math.round(Math.sin(tick * 0.25) * 3);
      ctx.fillStyle = charSkin.palette.outline;
      ctx.fillRect(px - 12, py - 20, 24, 30);
      ctx.fillStyle = charSkin.palette.primary;
      ctx.fillRect(px - 10, py - 10, 20, 18);
      ctx.fillStyle = charSkin.palette.secondary;
      ctx.fillRect(px - 8, py - 18, 16, 10);
      ctx.fillStyle = charSkin.palette.accent;
      ctx.fillRect(px - 6, py - 10, 12, 4); // Khăn quàng đỏ / thắt lưng
    }
  }
}
