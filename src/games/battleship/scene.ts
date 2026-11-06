// Pseudo-3D drawing on a tilted sea plane (see projection.ts). Ships are the painted top-down
// sprites laid on the plane in perspective strips, lifted to deck height above a stack of dark
// hull layers (the visible side of the hull), with a soft shadow and a foam ring at the
// waterline. No new raster art: silhouettes, shadows and foam are derived from the sprites.
import type {Camera} from './projection';
import type {Art} from './art';

type Pt = {x: number; y: number};
type Prepared = {sil: HTMLCanvasElement[]; shadow: HTMLCanvasElement; foam: HTMLCanvasElement; pad: number};
const prepared = new WeakMap<HTMLImageElement, Prepared>();
// Hull side from the waterline (dark, wet) up to the deck edge (lighter steel).
const HULL = Array.from({length: 9}, (_, i) => {const k = i / 8, c = (a: number, b: number) => Math.round(a + (b - a) * k).toString(16).padStart(2, '0'); return `#${c(6, 66)}${c(13, 80)}${c(18, 88)}`;});

function canvas(w: number, h: number) {const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c;}
function tinted(img: HTMLImageElement, color: string, pad = 0, blur = 0) {
  const c = canvas(img.width + pad * 2, img.height + pad * 2), x = c.getContext('2d')!;
  if (blur) x.filter = `blur(${blur}px)`;
  x.drawImage(img, pad, pad);
  x.filter = 'none'; x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return c;
}
export function prepare(img: HTMLImageElement): Prepared {
  let p = prepared.get(img);
  if (!p) {
    const pad = Math.round(img.height * .06);
    // A slightly blurred silhouette keeps the stacked hull smooth where the deck art has spiky
    // edges (guns, aircraft wings).
    p = {sil: HULL.map(c => tinted(img, c, 0, img.height * .006)), shadow: tinted(img, '#000', pad, pad / 2.2), foam: tinted(img, '#f4fbff', pad, pad / 5), pad};
    prepared.set(img, p);
  }
  return p;
}

/** Map an image onto a region of the plane given by pt(a, b): a runs down the image (0..1 over
 * [aA, aB]), b across it (over [bA, bB]); drawn as strips so depth foreshortening is right. */
let ox = 0, oy = 0; // origin of the offscreen canvas a ship is being cached into
function drawMapped(ctx: CanvasRenderingContext2D, img: CanvasImageSource & {width: number; height: number}, pt: (a: number, b: number) => Pt, aA: number, aB: number, bA: number, bB: number, strips: number) {
  const W = img.width, H = img.height;
  for (let i = 0; i < strips; i++) {
    const t0 = i / strips, t1 = (i + 1) / strips, a0 = aA + (aB - aA) * t0, a1 = aA + (aB - aA) * t1;
    const p00 = pt(a0, bA), p10 = pt(a0, bB), p01 = pt(a1, bA);
    const sy = t0 * H, sh = (t1 - t0) * H, over = i < strips - 1 ? sh * .06 : 0;
    ctx.setTransform((p10.x - p00.x) / W, (p10.y - p00.y) / W, (p01.x - p00.x) / sh, (p01.y - p00.y) / sh, p00.x - ox, p00.y - oy);
    ctx.drawImage(img, 0, sy, W, Math.min(H - sy, sh + over), 0, 0, W, Math.min(H - sy, sh + over));
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export type ShipPose = {
  img: HTMLImageElement; n: number; row: number; col: number; length: number; horizontal: boolean;
  /** Deck height in cells. */ height: number;
  /** 0 = afloat, 1 = fully settled after sinking. */ sink?: number;
  alpha?: number; foamColor?: string; ghost?: boolean;
};
/** Footprint of a ship sprite on the plane: centre, along-axis length and beam in board units. */
export function footprint(s: Pick<ShipPose, 'img' | 'n' | 'row' | 'col' | 'length' | 'horizontal'>) {
  const cell = 1 / s.n, len = .96 * s.length * cell;
  const beam = Math.min(.82 * cell, Math.max(.4 * cell, len * s.img.width / s.img.height));
  const uc = (s.col + (s.horizontal ? s.length / 2 : .5)) * cell, vc = (s.row + (s.horizontal ? .5 : s.length / 2)) * cell;
  return {uc, vc, len, beam};
}

/** Shallow deck: a board piece must read inside its logical row, not half a row above it. */
export const deckHeight = (s: Pick<ShipPose,'height'|'n'|'sink'>) => Math.max(.004, Math.min(.1, s.height * .22) * (1 - (s.sink ?? 0) * .92)) / s.n;
/** Project deck/FX points with the same registration: deck centre stays on the grid centre. */
export function shipPoint(cam: Camera, s: ShipPose, u: number, v: number, lift = 0) {
  const {uc,vc}=footprint(s),h=deckHeight(s),water=cam.project(uc,vc),deck=cam.project(uc,vc,h),p=cam.project(u,v,h+lift);
  return {...p,x:p.x+water.x-deck.x,y:p.y+water.y-deck.y};
}

/** Ship at rest (or settling while it sinks) drawn in screen space; see shipSprite for the cached
 * version the board uses every frame. */
export function drawShip(ctx: CanvasRenderingContext2D, cam: Camera, s: ShipPose) {
  const prep = prepare(s.img), {uc, vc, len, beam} = footprint(s), cell = 1 / s.n, sink = s.sink ?? 0;
  const roll = sink * .08 * beam;
  const deck = deckHeight(s);
  const width = beam * (1 - sink * .12);
  // a: 0 at the bow, 1 at the stern. Vertical ships point up the board (bow on the far row),
  // horizontal ships point right, matching the original top-down art orientation.
  const at = (a: number, b: number, h: number) => s.horizontal
    ? shipPoint(cam, s, uc + len / 2 - a * len, vc + b * width + roll, h-deck)
    : shipPoint(cam, s, uc + b * width + roll, vc - len / 2 + a * len, h-deck);
  const padA = prep.pad / s.img.height, padB = prep.pad / s.img.width;
  const strips = 6 + s.length * 3, alpha = (s.alpha ?? 1) * (1 - sink * .15);
  ctx.save();
  // Shadow falls down-right of the hull on the water.
  const off = .2 * cell;
  ctx.globalAlpha = alpha * .55 * (1 - sink * .6);
  drawMapped(ctx, prep.shadow, (a, b) => s.horizontal ? cam.project(uc + len / 2 - a * len + off, vc + b * width + off * .8, 0) : cam.project(uc + b * width + off, vc - len / 2 + a * len + off * .8, 0), -padA, 1 + padA, -.5 - padB, .5 + padB, 6);
  // Foam ring at the waterline (a sunk hull no longer throws a bow wave).
  if (sink < 1 && !s.ghost) {
    ctx.globalAlpha = alpha * .3 * (1 - sink);
    const grow = 1.05;
    drawMapped(ctx, s.foamColor ? tintedCache(prep.foam, s.foamColor) : prep.foam, (a, b) => at(.5 + (a - .5) * grow, b * grow * 1.1, 0), -padA, 1 + padA, -.5 - padB, .5 + padB, 6);
  }
  ctx.globalAlpha = alpha;
  // Hull side: stacked dark silhouettes from the waterline up to just under the deck.
  const layers = HULL.length;
  for (let i = 0; i < layers; i++) {
    const h = deck * (i / layers);
    drawMapped(ctx, prep.sil[i], (a, b) => at(a, b * (.96 - .04 * (layers - i) / layers), h), 0, 1, -.5, .5, 4);
  }
  drawMapped(ctx, s.img, (a, b) => at(a, b, deck), 0, 1, -.5, .5, strips);
  if (sink > 0) {
    // Settling hull: darkened and washed over by the sea.
    ctx.globalAlpha = alpha * .6 * sink;
    drawMapped(ctx, prep.sil[2], (a, b) => at(a, b, deck), 0, 1, -.5, .5, strips);
  }
  ctx.restore();
}

type Sprite = {canvas: HTMLCanvasElement; x: number; y: number};
const sprites = new Map<string, Sprite>();
const spriteIds = new WeakMap<HTMLImageElement, number>();
let nextId = 1;
/** A ship rendered once into its own canvas (keyed by pose; sinking is quantised), so a frame
 * only blits it. Board-space poses never change while a ship is afloat. */
export function shipSprite(cam: Camera, s: ShipPose): Sprite {
  let id = spriteIds.get(s.img); if (!id) {id = nextId++; spriteIds.set(s.img, id);}
  const sink = Math.round((s.sink ?? 0) * 20) / 20;
  const key = [id, cam.width, cam.height, s.n, s.row, s.col, s.length, s.horizontal ? 1 : 0, s.height, sink, s.alpha ?? 1, s.foamColor || '', s.ghost ? 1 : 0].join(':');
  let sp = sprites.get(key);
  if (sp) {sprites.delete(key); sprites.set(key, sp); return sp;}
  const {uc, vc, len, beam} = footprint(s), cell = 1 / s.n, hu = (s.horizontal ? len : beam) * .75 + cell * .4, hv = (s.horizontal ? beam : len) * .75 + cell * .4;
  const pts = [cam.project(uc - hu, vc - hv), cam.project(uc + hu, vc - hv), cam.project(uc - hu, vc + hv, 0), cam.project(uc + hu, vc + hv), cam.project(uc - hu, vc - hv, s.height * cell * 1.3), cam.project(uc + hu, vc - hv, s.height * cell * 1.3)];
  const x = Math.floor(Math.min(...pts.map(p => p.x))) - 4, y = Math.floor(Math.min(...pts.map(p => p.y))) - 4;
  const w = Math.ceil(Math.max(...pts.map(p => p.x))) + 4 - x, h = Math.ceil(Math.max(...pts.map(p => p.y))) + 4 - y;
  const c = canvas(w, h), cx = c.getContext('2d')!;
  ox = x; oy = y; try {drawShip(cx, cam, {...s, sink});} finally {ox = 0; oy = 0;}
  sp = {canvas: c, x, y}; sprites.set(key, sp);
  while (sprites.size > 60) sprites.delete(sprites.keys().next().value!);
  return sp;
}

/** Cached render of a static layer, rebuilt only when its key changes. */
export function layer(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, store: {key?: string; canvas?: HTMLCanvasElement}) {
  if (store.key !== key || !store.canvas) {const c = store.canvas && store.canvas.width === w && store.canvas.height === h ? store.canvas : canvas(w, h), x = c.getContext('2d')!; x.clearRect(0, 0, w, h); draw(x); store.canvas = c; store.key = key;}
  return store.canvas;
}
const tintCache = new WeakMap<HTMLCanvasElement, Map<string, HTMLCanvasElement>>();
function tintedCache(src: HTMLCanvasElement, color: string) {
  let m = tintCache.get(src); if (!m) {m = new Map(); tintCache.set(src, m);}
  let c = m.get(color);
  if (!c) {c = canvas(src.width, src.height); const x = c.getContext('2d')!; x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height); m.set(color, c);}
  return c;
}

/** Sea plane from the top of the canvas down, tiled ocean texture in perspective rows. */
export function drawSea(ctx: CanvasRenderingContext2D, cam: Camera, art: Art, t: number, animate: boolean) {
  const sea = art.images.ocean, T = sea.width, tex = 900, step = 6;
  ctx.fillStyle = '#071520'; ctx.fillRect(0, 0, cam.width, cam.height);
  for (let y = 0; y < cam.height; y += step) {
    const l = cam.unproject(0, y + step / 2), r = cam.unproject(cam.width, y + step / 2), l2 = cam.unproject(0, y + step * 1.5);
    const drift = animate ? t * .004 : 0, wave = animate ? Math.sin(y * .02 + t * .0006) * 4 : 0;
    let ty = ((l.v * tex + drift) % T + T) % T; const th = Math.max(1, Math.min(T - ty, Math.abs(l2.v - l.v) * tex));
    if (ty + th > T) ty = T - th;
    const x0 = l.u * tex + wave, x1 = r.u * tex + wave;
    // Tile horizontally across texture seams.
    let sx = x0;
    while (sx < x1) {
      const tile = Math.floor(sx / T), local = sx - tile * T, end = Math.min(x1, (tile + 1) * T);
      const dx0 = (sx - x0) / (x1 - x0) * cam.width, dx1 = (end - x0) / (x1 - x0) * cam.width;
      ctx.drawImage(sea, local, ty, end - sx, th, dx0, y, dx1 - dx0 + .6, step + .6);
      sx = end;
    }
  }
  // Colour grade: deep teal, a soft sun glint on the far right, haze over distant water.
  ctx.fillStyle = '#04223a3d'; ctx.fillRect(0, 0, cam.width, cam.height);
  const glint = ctx.createRadialGradient(cam.width * .78, cam.height * .05, 10, cam.width * .78, cam.height * .05, cam.width * .6);
  glint.addColorStop(0, '#fff2d040'); glint.addColorStop(.4, '#bfe0ee18'); glint.addColorStop(1, '#0000');
  ctx.fillStyle = glint; ctx.fillRect(0, 0, cam.width, cam.height);
}
export function drawHaze(ctx: CanvasRenderingContext2D, cam: Camera, top: number) {
  const fog = ctx.createLinearGradient(0, 0, 0, top);
  fog.addColorStop(0, '#b4c8d2e6'); fog.addColorStop(.35, '#7f9cab88'); fog.addColorStop(.75, '#3d5a6a30'); fog.addColorStop(1, '#0000');
  ctx.fillStyle = fog; ctx.fillRect(0, 0, cam.width, top);
  const v = ctx.createRadialGradient(cam.width / 2, cam.height * .55, cam.height * .35, cam.width / 2, cam.height * .55, cam.width * .78);
  v.addColorStop(0, '#0000'); v.addColorStop(1, '#020a10b0');
  ctx.fillStyle = v; ctx.fillRect(0, 0, cam.width, cam.height);
}

/** Closed path through projected plane points. */
export function quad(ctx: CanvasRenderingContext2D, cam: Camera, u0: number, v0: number, u1: number, v1: number, h = 0) {
  const a = cam.project(u0, v0, h), b = cam.project(u1, v0, h), c = cam.project(u1, v1, h), d = cam.project(u0, v1, h);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath();
}
/** Ellipse lying on the plane (a ring around a cell centre). */
export function ring(ctx: CanvasRenderingContext2D, cam: Camera, u: number, v: number, r: number, h = 0) {
  ctx.beginPath();
  for (let i = 0; i <= 28; i++) {const a = i / 28 * Math.PI * 2, p = cam.project(u + Math.cos(a) * r, v + Math.sin(a) * r, h); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);}
  ctx.closePath();
}
/** Screen width of one cell at a plane point (for sizing billboards by depth). */
export function cellWidth(cam: Camera, u: number, v: number, n: number) {
  return cam.project(u + .5 / n, v).x - cam.project(u - .5 / n, v).x;
}
