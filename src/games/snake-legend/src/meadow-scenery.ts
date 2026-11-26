import type { Arena, Rect, V } from './core';

const THEMES = {
  orchard: {ground: '#d6e8b4', tint: '#d9e9aa64', leaf: '#719851', bud: '#eec996', stone: '#839472', edge: '#456342'},
  brook: {ground: '#c7e3bd', tint: '#99cfc590', leaf: '#537f75', bud: '#e7dfae', stone: '#72978e', edge: '#335b53'},
  bramble: {ground: '#e2d1a8', tint: '#d8ad776f', leaf: '#8d7d47', bud: '#d19a70', stone: '#a18e69', edge: '#69543b'},
  hollow: {ground: '#c8d7ad', tint: '#9bb68f8c', leaf: '#5c8169', bud: '#b3c5bf', stone: '#73877e', edge: '#405b50'},
  amber: {ground: '#dfd0a1', tint: '#d2a8684d', leaf: '#7b7547', bud: '#f6d895', stone: '#8c795d', edge: '#6f583f'},
  dawn: {ground: '#d7cbb6', tint: '#eadcbc36', leaf: '#817386', bud: '#f9e1a0', stone: '#8d7e8d', edge: '#5f5269'},
};

export function meadowTheme(a: Arena) {
  if (a.story?.id.startsWith('2-')) return THEMES.amber;
  if (a.story?.id.startsWith('3-')) return THEMES.dawn;
  if (a.story?.encounter) return THEMES.hollow;
  if (a.id === 15 || a.id === 18 || a.story?.foods.some(food => food.kind === 'poison')) return THEMES.bramble;
  if (a.water.length) return THEMES.brook;
  return THEMES.orchard;
}

type Motif = V & { size: number; kind: number };
const arenaMotifs = new WeakMap<Arena, Motif[]>();

function scatter(a: Arena): Motif[] {
  const motifs = arenaMotifs.get(a);
  if (motifs) return motifs;

  const seeded: Motif[] = [];
  const blocked = [...a.water, ...a.walls, ...a.spikes, ...(a.story?.bridges ?? []),
    ...(a.story?.gate ? [a.story.gate] : [])];
  const points = [a.start, ...a.route, ...(a.story?.foods ?? []),
    ...(a.story ? [a.story.exit] : []), ...(a.story?.switch ? [a.story.switch] : []),
    ...(a.story?.encounter?.webs ?? [])];
  for (let row = 0; row * 3.3 + 3 < a.h; row++) {
    for (let column = 0; column * 3.3 + 3 < a.w; column++) {
      const seed = Math.imul(a.id + row * 67 + 13, 2654435761) ^ Math.imul(column + 1, 1597334677);
      const x = column * 3.3 + .8 + (seed & 255) / 180;
      const y = row * 3.3 + .8 + ((seed >>> 8) & 255) / 180;
      if (x < 1.2 || y < 1.2 || blocked.some(b => x > b.x - .5 && x < b.x + b.w + .5
        && y > b.y - .5 && y < b.y + b.h + .5)) continue;
      if (points.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < 2.1)) continue;
      seeded.push({x, y, size: .24 + ((seed >>> 16) & 15) / 46, kind: (seed >>> 21) % 4});
    }
  }
  arenaMotifs.set(a, seeded);
  return seeded;
}

export function drawMeadowMotifs(c: CanvasRenderingContext2D, a: Arena, view: Rect) {
  const theme = meadowTheme(a);
  c.save();
  c.fillStyle = theme.tint;
  c.fillRect(0, 0, a.w, a.h);
  c.lineWidth = .24;
  c.strokeStyle = theme.edge;
  c.globalAlpha = .28;
  c.strokeRect(.22, .22, a.w - .44, a.h - .44);
  if (theme === THEMES.dawn) {
    c.globalAlpha = .32;
    c.lineWidth = .05;
    c.beginPath();
    const step = 2.4;
    const left = Math.max(0, Math.floor(view.x / step) * step);
    const right = Math.min(a.w, view.x + view.w + step);
    for (let y = Math.max(0, Math.floor(view.y / step) * step); y < Math.min(a.h, view.y + view.h + step); y += step) {
      c.moveTo(left, y); c.lineTo(right, y);
      for (let x = left + ((Math.round(y / step) % 2) * step / 2); x < right; x += step) {
        c.moveTo(x, y); c.lineTo(x, Math.min(a.h, y + step));
      }
    }
    c.stroke();
  }
  for (const {x, y, size, kind} of scatter(a)) {
    if (x < view.x - 1 || x > view.x + view.w + 1 || y < view.y - 1 || y > view.y + view.h + 1) continue;
    // Tiny silhouettes read as ground cover at play scale. Props and fruit have their own ink.
    c.fillStyle = kind === 0 ? theme.stone : theme.leaf;
    c.globalAlpha = .40;
    c.beginPath();
    if (kind === 0) {
      c.ellipse(x, y, size, size * .40, -.25, 0, Math.PI * 2);
      c.ellipse(x + size * 1.16, y + size * .32, size * .45, size * .26, .2, 0, Math.PI * 2);
    } else {
      c.ellipse(x - size * .32, y, size * .64, size * .22, .65, 0, Math.PI * 2);
      c.ellipse(x + size * .24, y - size * .14, size * .64, size * .22, -1, 0, Math.PI * 2);
    }
    c.fill();
    if (kind < 2) continue;
    c.fillStyle = theme.bud;
    c.globalAlpha = .68;
    c.beginPath();
    c.arc(x - size * .55, y - size * .40, size * .22, 0, Math.PI * 2);
    c.arc(x + size * .22, y - size * .72, size * .20, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export function drawStreamDetail(c: CanvasRenderingContext2D, b: Rect, time: number) {
  c.save();
  c.beginPath();
  c.rect(b.x, b.y, b.w, b.h);
  c.clip();
  c.fillStyle = '#246b832e';
  c.fillRect(b.x, b.y, b.w, b.h);
  c.strokeStyle = '#e3fbdd70';
  c.lineCap = 'round';
  c.lineWidth = .055;
  for (let y = b.y + .8, i = 0; y < b.y + b.h - .4; y += 1.42, i++) {
    const drift = Math.sin(time * .8 + i * 2) * .32;
    const banks = [b.x + .38, b.x + b.w - .38];
    c.beginPath();
    for (const bank of banks) {
      c.moveTo(bank - .12, y + drift);
      c.quadraticCurveTo(bank + .18, y + drift + .46, bank, y + drift + .7);
    }
    c.stroke();
  }
  c.restore();
}

export function drawDeckRails(c: CanvasRenderingContext2D, b: Rect) {
  c.save();
  for (const y of [b.y, b.y + b.h - .22]) {
    c.fillStyle = '#77542f';
    c.fillRect(b.x, y, b.w, .22);
    c.fillStyle = '#efd4a0';
    c.fillRect(b.x, y + .03, b.w, .054);
  }
  c.restore();
}

export function drawThorns(c: CanvasRenderingContext2D, b: Rect) {
  c.save();
  c.fillStyle = '#754652';
  c.fillRect(b.x, b.y, b.w, b.h);
  for (let y = b.y + .32; y < b.y + b.h - .21; y += .53) {
    c.fillStyle = '#d18379';
    c.beginPath();
    c.moveTo(b.x, y);
    c.lineTo(b.x + b.w / 2, y - .22);
    c.lineTo(b.x + b.w, y);
    c.lineTo(b.x + b.w / 2, y + .18);
    c.closePath();
    c.fill();
  }
  c.restore();
}
