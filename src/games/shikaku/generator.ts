export interface Point { r: number; c: number; }
export interface Rect { id: string; r: number; c: number; w: number; h: number; color?: string; }
export interface Hint { r: number; c: number; value: number; }
export interface ShikakuPuzzle {
  size: number;
  hints: Hint[];
  solution: Rect[];
}

export function generateShikaku(size: number, maxBlockArea: number = 12): ShikakuPuzzle {
  let rects: Rect[] = [{ id: Math.random().toString(), r: 0, c: 0, w: size, h: size }];
  let splitted = true;
  while (splitted) {
    splitted = false;
    const nextRects: Rect[] = [];
    for (const r of rects) {
      const area = r.w * r.h;
      if (area > maxBlockArea || (area > 2 && Math.random() < (area / (maxBlockArea * 1.5)))) {
        let splitHoriz = Math.random() > 0.5;
        if (r.w === 1) splitHoriz = true;
        if (r.h === 1) splitHoriz = false;

        if (splitHoriz && r.h > 1) {
          const splitPoint = Math.floor(Math.random() * (r.h - 1)) + 1;
          nextRects.push({ id: Math.random().toString(), r: r.r, c: r.c, w: r.w, h: splitPoint });
          nextRects.push({ id: Math.random().toString(), r: r.r + splitPoint, c: r.c, w: r.w, h: r.h - splitPoint });
          splitted = true;
        } else if (!splitHoriz && r.w > 1) {
          const splitPoint = Math.floor(Math.random() * (r.w - 1)) + 1;
          nextRects.push({ id: Math.random().toString(), r: r.r, c: r.c, w: splitPoint, h: r.h });
          nextRects.push({ id: Math.random().toString(), r: r.r, c: r.c + splitPoint, w: r.w - splitPoint, h: r.h });
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
    const hr = r.r + Math.floor(Math.random() * r.h);
    const hc = r.c + Math.floor(Math.random() * r.w);
    return { r: hr, c: hc, value: r.w * r.h };
  });

  return { size, hints, solution: rects };
}
