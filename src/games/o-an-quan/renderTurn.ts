import { readableCanvasText } from '../../accessibility/canvasText';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { EquippedFolkSkins, FolkSeat } from '../folk-duel/types';
import { drawSingleStone, getOaqCellRects, getOaqTrayRect, OAQ_SEAT_COLOR, renderOAnQuanBoard } from './renderer';
import { getOwnRange, QUAN_VALUE } from './rules';
import type { OaqFrame } from './turnAnimation';

const cells = getOaqCellRects();
type Point = { x: number; y: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const between = (progress: number, from: number, to: number) => clamp((progress - from) / (to - from));
const easeOut = (value: number) => 1 - (1 - value) ** 3;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const center = (rect: { x: number; y: number; w: number; h: number }): Point => ({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });
const cellCenter = (index: number) => center(cells[index]);

function hand(ctx: CanvasRenderingContext2D, at: Point, closed: number, seat: FolkSeat, skins: EquippedFolkSkins) {
  const palette = getSkinById(skins.oaq_hand).palette;
  ctx.save();
  ctx.translate(at.x, at.y);
  if (seat === 'P2') ctx.scale(-1, 1);

  // The cuff carries the skin, and the stitched edge identifies the active seat.
  ctx.fillStyle = palette.primary;
  ctx.strokeStyle = '#342119';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-77, -36, 33, 27, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = OAQ_SEAT_COLOR[seat];
  ctx.fillRect(-53, -34, 5, 23);

  const fingertip = mix(2, -8, closed);
  const skin = ctx.createLinearGradient(0, -42, 5, 4);
  skin.addColorStop(0, '#ffe2b8');
  skin.addColorStop(.58, '#edaa78');
  skin.addColorStop(1, '#bc7148');
  ctx.fillStyle = skin;
  ctx.strokeStyle = '#523023';
  ctx.beginPath();
  ctx.moveTo(-46, -31);
  ctx.bezierCurveTo(-37, -31, -31, -43, -16, -41);
  ctx.bezierCurveTo(-1, -42, 13, -36, 21, -25);
  ctx.bezierCurveTo(31, -16, 28, fingertip - 6, 21, fingertip - 5);
  ctx.bezierCurveTo(17, fingertip - 4, 15, -16, 10, -18);
  ctx.bezierCurveTo(16, -5, 14, fingertip + 3, 8, fingertip + 2);
  ctx.bezierCurveTo(2, fingertip + 2, 4, -13, -2, -13);
  ctx.bezierCurveTo(3, -2, -2, fingertip + 3, -7, fingertip + 1);
  ctx.bezierCurveTo(-14, fingertip, -11, -12, -18, -13);
  ctx.bezierCurveTo(-25, -12, -29, -7, -37, -10);
  ctx.lineTo(-46, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#a76547';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -30);
  ctx.quadraticCurveTo(3, -27, 8, -22);
  ctx.moveTo(-21, -20);
  ctx.quadraticCurveTo(-14, -24, -9, -18);
  ctx.stroke();
  ctx.restore();
}

function ring(ctx: CanvasRenderingContext2D, p: Point, radius: number, color: string, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, radius, radius * .5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drop(ctx: CanvasRenderingContext2D, frame: OaqFrame, t: number, at: Point, skins: EquippedFolkSkins) {
  const stone = getSkinById(skins.oaq_stones).palette;
  const from = frame.fromCell === null ? at : cellCenter(frame.fromCell);
  const travel = easeOut(between(t, 0, .56));
  const palm = { x: mix(from.x, at.x, travel), y: mix(from.y, at.y, travel) - 26 };
  hand(ctx, palm, mix(.9, .1, between(t, .38, .65)), frame.step.seat, skins);
  const carried = Math.min(3, frame.stonesInHand - Number(t >= .38));
  for (let i = 0; i < carried; i++) drawSingleStone(ctx, palm.x - 11 + i * 8, palm.y - 5 + (i % 2) * 3, 4.5, false, stone);
  const flight = between(t, .38, .78);
  if (t >= .38 && t < .78) {
    const y = mix(palm.y + 1, at.y + 4, flight ** 2);
    drawSingleStone(ctx, palm.x + (at.x - palm.x) * flight, y, 6.5, false, stone);
  }
  if (t >= .78) {
    const impact = between(t, .78, 1);
    ring(ctx, at, mix(8, 24, impact), '#fff0c0', .85 * (1 - impact));
  }
}

function pickup(ctx: CanvasRenderingContext2D, frame: OaqFrame, t: number, at: Point, skins: EquippedFolkSkins) {
  const from = frame.fromCell === null ? center(getOaqTrayRect(frame.step.seat)) : cellCenter(frame.fromCell);
  const visit = easeOut(between(t, 0, .55));
  const lift = between(t, .57, 1);
  const palm = { x: mix(from.x, at.x, visit), y: mix(from.y - 27, at.y + 3, visit) - 32 * lift };
  hand(ctx, palm, between(t, .3, .62), frame.step.seat, skins);
  if (lift > 0) {
    const palette = getSkinById(skins.oaq_stones).palette;
    for (let i = 0; i < Math.min(4, frame.step.count); i++) {
      drawSingleStone(ctx, palm.x + i * 8 - 9, palm.y + 1 + (i % 2) * 3, 5.5, false, palette);
    }
  }
}

function capture(ctx: CanvasRenderingContext2D, frame: OaqFrame, t: number, at: Point, skins: EquippedFolkSkins) {
  const { seat, count, isQuan, type } = frame.step;
  const color = OAQ_SEAT_COLOR[seat];
  const palette = getSkinById(skins.oaq_stones).palette;
  const tray = center(getOaqTrayRect(seat));
  const flash = type === 'capture' ? 1 : .5;
  const burst = between(t, .04, .66);
  ring(ctx, at, mix(12, 53, easeOut(burst)), color, flash * (1 - burst));
  ring(ctx, at, mix(8, 37, easeOut(burst)), '#fff1c7', .75 * flash * (1 - burst));

  if (type === 'capture' && burst < 1) {
    ctx.save();
    ctx.globalAlpha = (1 - burst) * .96;
    ctx.fillStyle = '#fff0b1';
    for (let i = 0; i < 9; i++) {
      const angle = i * Math.PI * 2 / 9 + .2;
      const x = at.x + Math.cos(angle) * mix(14, 61, burst);
      const y = at.y + Math.sin(angle) * mix(5, 35, burst) - burst * 8;
      const sparkle = mix(6, 2, burst);
      ctx.fillRect(x - sparkle, y - 1.2, sparkle * 2, 2.4);
      ctx.fillRect(x - 1.2, y - sparkle, 2.4, sparkle * 2);
    }
    ctx.restore();
  }

  if (t >= .22 && t < .84) {
    const flight = between(t, .22, .84);
    const pebbles = Math.min(6, count - (isQuan ? QUAN_VALUE : 0));
    for (let i = 0; i < pebbles + Number(!!isQuan); i++) {
      const offset = (i - pebbles / 2) * 10;
      const x = mix(at.x + offset * .45, tray.x + offset, flight);
      const y = mix(at.y + (i % 2) * 5, tray.y + (i % 2) * 5, flight) - Math.sin(flight * Math.PI) * (43 + i * 2);
      const large = !!isQuan && i === pebbles;
      drawSingleStone(ctx, x, y, large ? 10 : 5.5, large, palette);
    }
  }
  if (t > .84) ring(ctx, tray, mix(9, 27, between(t, .84, 1)), color, 1 - between(t, .84, 1));

  if (type === 'capture' && t < .9) {
    ctx.save();
    ctx.font = '800 20px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe7a1';
    ctx.globalAlpha = Math.min(1, t * 11, (1 - t) * 8);
    readableCanvasText(ctx, frame.combo > 1 ? `Ăn kép ×${frame.combo} · +${count}` : `+${count} điểm`, at.x, at.y - 30 - t * 16);
    ctx.restore();
  }
}

export function renderOaqTurnFrame(ctx: CanvasRenderingContext2D, frame: OaqFrame, progress: number, skins: EquippedFolkSkins) {
  const { step, before, after } = frame;
  const at = cellCenter(step.cellIndex);
  const showingAfter = progress >= { pickup: .57, drop: .78, capture: .22, sweep: .22, resow: .82 }[step.type];
  const countTray = step.type === 'capture' || step.type === 'sweep' ? progress >= .84 : showingAfter;
  renderOAnQuanBoard(ctx, showingAfter ? after : before, skins, step.type === 'pickup' || step.type === 'drop' ? step.cellIndex : null, [], countTray ? after : before);

  switch (step.type) {
    case 'pickup': pickup(ctx, frame, progress, at, skins); break;
    case 'drop': drop(ctx, frame, progress, at, skins); break;
    case 'capture':
    case 'sweep': capture(ctx, frame, progress, at, skins); break;
    case 'resow': {
      const tray = center(getOaqTrayRect(step.seat));
      const flight = between(progress, .09, .82);
      if (flight >= 1) break;
      const palette = getSkinById(skins.oaq_stones).palette;
      for (const index of getOwnRange(step.seat)) {
        const target = cellCenter(index);
        drawSingleStone(ctx, mix(tray.x, target.x, flight), mix(tray.y, target.y, flight) - Math.sin(Math.PI * flight) * 30, 5.6, false, palette);
      }
      break;
    }
  }
}
