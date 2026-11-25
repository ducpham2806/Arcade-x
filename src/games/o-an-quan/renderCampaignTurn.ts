import { readableCanvasText } from '../../accessibility/canvasText';
import { getSkinById } from '../folk-duel/skins-catalog';
import type { EquippedFolkSkins, FolkSeat } from '../folk-duel/types';
import { campaignFormation, drawCampaignUnit, type OaqBattlefield } from './battlefield';
import { getOaqCellRects, getOaqTrayRect, OAQ_SEAT_COLOR, renderOAnQuanBoard } from './renderer';
import { getOaqTray, getOwnRange, QUAN_VALUE, type OaqState } from './rules';
import type { OaqFrame } from './turnAnimation';

const cells = getOaqCellRects();
const HIT = .32;
const FLIGHT = .23;
type Point = { x: number; y: number };
const clamp = (n: number) => Math.max(0, Math.min(n, 1));
const center = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
const cellCenter = (index: number) => center(cells[index]);

function arc(from: Point, to: Point, t: number, height: number) {
  const lift = Math.sin(t * Math.PI) * height;
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t - lift, lift };
}

function unitDeparture(index: number, total: number) {
  return .39 + .37 * index / Math.max(1, total - 1);
}

export function campaignTrayState(frame: OaqFrame, t: number): OaqState {
  const { step, before, after } = frame;
  if (step.type === 'resow') return t >= .82 ? after : before;
  if (step.type !== 'capture' && step.type !== 'sweep') return before;
  if (t < unitDeparture(0, 1) + FLIGHT) return before;
  if (t >= .99) return after;
  const dan = before.cells[step.cellIndex];
  const total = dan + Number(!!step.isQuan);
  let arrived = 0;
  while (arrived < total && t >= unitDeparture(arrived, total) + FLIGHT) arrived++;
  const commander = !!step.isQuan && arrived === total;
  return {
    ...before,
    scores: { ...before.scores, [step.seat]: before.scores[step.seat] + (commander ? dan + QUAN_VALUE : arrived) },
    trayQuan: commander ? after.trayQuan : before.trayQuan,
  };
}

function dust(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, size: number, color: string) {
  ctx.save();
  ctx.globalAlpha = (1 - t) * .65;
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    const sign = i % 2 ? 1 : -1;
    ctx.fillRect(Math.round(x + sign * (3 + i * 4) * t * size), Math.round(y + (i % 3 - 1) * 4 * t), 3, 2);
  }
  ctx.restore();
}

function groundRing(ctx: CanvasRenderingContext2D, at: Point, t: number, size: number, color: string) {
  const width = 5 + size * t;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = .65 * (1 - t);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, width, width * .32, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function spearSweep(ctx: CanvasRenderingContext2D, sheet: HTMLImageElement, t: number, at: Point,
  seat: FolkSeat, facing: number, large: boolean,
) {
  const width = sheet.naturalWidth / 16;
  const height = sheet.naturalHeight / 2;
  const scale = large ? 1.42 : 1.17;
  const frame = Math.min(15, Math.floor(t * 16));
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.scale(facing * scale, scale);
  ctx.drawImage(sheet, frame * width, seat === 'P1' ? 0 : height, width, height,
    -width / 2, -height * .60, width, height);
  ctx.restore();
}

function capture(ctx: CanvasRenderingContext2D, frame: OaqFrame, t: number, at: Point, tray: Point,
  field: OaqBattlefield & { units: CanvasImageSource }, from: Point, particle: string,
) {
  const { step, before } = frame;
  const { seat, isQuan } = step;
  const facing = Math.sign(at.x - from.x) || (seat === 'P1' ? 1 : -1);
  if (step.type === 'capture' && t < .72) {
    const preparation = clamp(t / .085);
    const jump = clamp((t - .085) / (HIT - .085));
    const attack = arc(from, at, jump, isQuan ? 45 : 35);
    const brace = Math.sin(preparation * Math.PI);
    attack.x -= facing * brace * 6;
    ctx.save();
    ctx.globalAlpha = 1 - clamp((t - .54) / .18);
    drawCampaignUnit(ctx, field.units, seat, attack.x, attack.y, 49, false, facing, -.31 * brace + .78 * clamp((t - .205) / .15), attack.lift);
    ctx.restore();
  }

  if (step.type === 'capture' && t >= HIT && t < .7) {
    const impact = clamp((t - HIT) / .38);
    if (field.sweep) spearSweep(ctx, field.sweep, impact, at, seat, facing, !!isQuan);
    if (field.impact && (isQuan || !field.sweep)) {
      const w = field.impact.naturalWidth / 16;
      const h = field.impact.naturalHeight;
      ctx.save();
      ctx.globalAlpha = field.sweep ? .55 : 1;
      ctx.drawImage(field.impact, Math.min(15, Math.floor(impact * 16)) * w, 0, w, h, at.x - 61, at.y - 42, 122, 71);
      ctx.restore();
    }
    dust(ctx, at.x, at.y + 9, impact, 2, particle);
    groundRing(ctx, { x: at.x, y: at.y + 12 }, impact, isQuan ? 35 : 22, OAQ_SEAT_COLOR[seat]);
  }
  if (t < HIT) return;

  const dan = before.cells[step.cellIndex];
  const count = dan + Number(!!isQuan);
  const defeated = step.cellIndex >= 6 ? 'P2' : 'P1';
  const cleared = getOaqTray(before, seat);
  const capacity = isQuan ? 23 : 16;
  for (let i = 0; i < count; i++) {
    const commander = !!isQuan && i === dan;
    const origin = commander ? { x: at.x, y: at.y - 18 } : campaignFormation(at.x, at.y - 8, i % 12);
    const elapsed = (t - unitDeparture(i, count)) / FLIGHT;
    if (elapsed >= 1) {
      if (elapsed < 1.46 && i >= count - capacity) {
        const x = tray.x + (i % 8) * 10 - 30;
        ctx.save();
        ctx.globalAlpha = clamp((1.46 - elapsed) / .3);
        ctx.font = commander ? 'bold 22px system-ui' : 'bold 17px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = OAQ_SEAT_COLOR[seat];
        readableCanvasText(ctx, commander ? '+10' : '+1', x, tray.y - 6 - (elapsed - 1) * 36);
        ctx.restore();
        if (commander || i === count - 1) groundRing(ctx, tray, (elapsed - 1) / .46, commander ? 22 : 10, OAQ_SEAT_COLOR[seat]);
      }
      continue;
    }
    if (elapsed < 0 && i >= 12 && !commander) continue;
    const destination = commander
      ? { x: tray.x + 25 + cleared.quan * 22, y: tray.y - 1 }
      : { x: tray.x - 109 + Math.min(15, cleared.dan + i) % 8 * 15, y: tray.y + (cleared.dan + i >= 8 ? 6 : -6) };
    const progress = clamp(elapsed);
    const point = arc(origin, destination, progress, 25 + i % 4 * 4);
    const size = commander ? 68 - 44 * progress : 31 - 16 * progress;
    drawCampaignUnit(ctx, field.units, defeated, point.x, point.y, size, commander, -facing,
      (1 - progress) * clamp((t - HIT) * 17) * -.9, point.lift);
  }
}

export function renderCampaignTurn(
  ctx: CanvasRenderingContext2D, frame: OaqFrame, t: number, skins: EquippedFolkSkins,
  field: OaqBattlefield & { units: CanvasImageSource }, trayState: OaqState, attackFrom: number | null,
) {
  const { step, before, after } = frame;
  const particle = getSkinById(skins.oaq_stones).palette.particle;
  const at = cellCenter(step.cellIndex);
  const tray = center(getOaqTrayRect(step.seat));
  const from = frame.fromCell === null ? tray : cellCenter(frame.fromCell);
  const settled = t >= { pickup: .25, drop: .78, capture: HIT, sweep: HIT, resow: .82 }[step.type];
  const selection = step.type === 'pickup' || step.type === 'drop' ? step.cellIndex : null;
  renderOAnQuanBoard(ctx, settled ? after : before, skins, selection, [], trayState, field);
  const facing = Math.sign(at.x - from.x) || (step.seat === 'P1' ? 1 : -1);

  if (step.type === 'pickup') {
    if (!settled) {
      groundRing(ctx, at, t / .25, 18, OAQ_SEAT_COLOR[step.seat]);
      return;
    }
    const brace = Math.sin(Math.PI * clamp((t - .25) / .75));
    for (let i = 0; i < Math.min(12, step.count); i++) {
      const point = campaignFormation(at.x, at.y - 8, i);
      drawCampaignUnit(ctx, field.units, step.seat, point.x, point.y + brace * 5, 31, false, facing, brace * -.25);
    }
    return;
  }
  if (step.type === 'drop' && !settled) {
    const march = clamp(t / .78);
    const carried = Math.min(frame.stonesInHand, 4);
    for (let i = carried - 1; i >= 0; i--) {
      const offset = i * 5;
      const unit = arc(from, at, march, 4 + i);
      unit.x -= facing * offset;
      unit.y += i * 4;
      const gait = Math.sin(march * 4 * Math.PI - i);
      drawCampaignUnit(ctx, field.units, step.seat, unit.x, unit.y - Math.abs(gait) * 4, 33, false, facing, gait * .1, unit.lift + Math.abs(gait) * 4);
    }
    if (carried > 0) dust(ctx, from.x, from.y + 5, march, 1, particle);
    return;
  }
  if (step.type === 'drop') {
    const landing = clamp((t - .78) / .22);
    dust(ctx, at.x, at.y + 8, landing, 1, particle);
    groundRing(ctx, at, landing, 10, OAQ_SEAT_COLOR[step.seat]);
    return;
  }
  if (step.type === 'capture' || step.type === 'sweep') {
    capture(ctx, frame, t, at, tray, field, attackFrom === null ? from : cellCenter(attackFrom), particle);
    return;
  }
  if (!settled) {
    const tResow = clamp((t - .09) / .73);
    for (const index of getOwnRange(step.seat)) {
      const point = arc(tray, cellCenter(index), tResow, 24);
      drawCampaignUnit(ctx, field.units, step.seat, point.x, point.y, 31, false, 1, 0, point.lift);
    }
  }
}

export function campaignAttackOrigins(frames: readonly OaqFrame[]) {
  let previousTarget: number | null = null;
  return frames.map(frame => {
    if (frame.step.type !== 'capture') {
      previousTarget = null;
      return null;
    }
    const origin: number | null = frame.fromCell ?? previousTarget;
    previousTarget = frame.step.cellIndex;
    return origin;
  });
}
