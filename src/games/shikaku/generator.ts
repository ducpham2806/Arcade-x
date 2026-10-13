export interface Point { r: number; c: number; }
export interface Rect { id: string; r: number; c: number; w: number; h: number; color?: string; }
export interface Hint { r: number; c: number; value: number; }
export interface ShikakuPuzzle {
  size: number;
  seed?: number;
  contentVersion?: number;
  hints: Hint[];
  solution: Rect[];
}

export function generateShikaku(size: number, maxBlockArea: number = 12, seed = Math.floor(Math.random() * 4294967296)): ShikakuPuzzle {
  if (!Number.isInteger(size) || size < 4 || size > 10 || !Number.isFinite(maxBlockArea) || maxBlockArea < 1) throw new Error('Invalid Shikaku dimensions');
  seed = seed >>> 0;
  let state = seed;
  const random = () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
  let rects: Rect[] = [{ id: random().toString(), r: 0, c: 0, w: size, h: size }];
  let splitted = true;
  while (splitted) {
    splitted = false;
    const nextRects: Rect[] = [];
    for (const r of rects) {
      const area = r.w * r.h;
      if (area > maxBlockArea || (area > 2 && random() < (area / (maxBlockArea * 1.5)))) {
        let splitHoriz = random() > 0.5;
        if (r.w === 1) splitHoriz = true;
        if (r.h === 1) splitHoriz = false;

        if (splitHoriz && r.h > 1) {
          const splitPoint = Math.floor(random() * (r.h - 1)) + 1;
          nextRects.push({ id: random().toString(), r: r.r, c: r.c, w: r.w, h: splitPoint });
          nextRects.push({ id: random().toString(), r: r.r + splitPoint, c: r.c, w: r.w, h: r.h - splitPoint });
          splitted = true;
        } else if (!splitHoriz && r.w > 1) {
          const splitPoint = Math.floor(random() * (r.w - 1)) + 1;
          nextRects.push({ id: random().toString(), r: r.r, c: r.c, w: splitPoint, h: r.h });
          nextRects.push({ id: random().toString(), r: r.r, c: r.c + splitPoint, w: r.w - splitPoint, h: r.h });
          splitted = true;
        } else {
          nextRects.push(r);
        }
      } else {
        nextRects.push(r);
      }
    }
    rects = nextRects;
  }

  const hints: Hint[] = rects.map(r => {
    const hr = r.r + Math.floor(random() * r.h);
    const hc = r.c + Math.floor(random() * r.w);
    return { r: hr, c: hc, value: r.w * r.h };
  });

  return { size, seed, contentVersion: 1, hints, solution: rects };
}

