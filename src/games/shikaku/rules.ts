import type { Point, Rect, ShikakuPuzzle } from "./generator";
export const contains = (rect: Rect, p: Point) =>
  p.r >= rect.r &&
  p.r < rect.r + rect.h &&
  p.c >= rect.c &&
  p.c < rect.c + rect.w;
export const overlaps = (a: Rect, b: Rect) =>
  a.r < b.r + b.h && b.r < a.r + a.h && a.c < b.c + b.w && b.c < a.c + a.w;
export const rectangle = (a: Point, b: Point): Rect => ({
  id: "preview",
  r: Math.min(a.r, b.r),
  c: Math.min(a.c, b.c),
  w: Math.abs(a.c - b.c) + 1,
  h: Math.abs(a.r - b.r) + 1,
});
export function checkRegion(
  puzzle: ShikakuPuzzle,
  rect: Rect,
  placed: Rect[] = [],
) {
  if (
    ![rect.r, rect.c, rect.w, rect.h].every(Number.isInteger) ||
    rect.r < 0 ||
    rect.c < 0 ||
    rect.w < 1 ||
    rect.h < 1 ||
    rect.r + rect.h > puzzle.size ||
    rect.c + rect.w > puzzle.size
  )
    return { valid: false, text: "Vùng chọn nằm ngoài bảng." };
  const clues = puzzle.hints.filter((h) => contains(rect, h));
  const area = rect.w * rect.h;
  if (placed.some((r) => overlaps(r, rect)))
    return { valid: false, text: "Vùng này đè lên vùng đã đặt." };
  if (clues.length === 0)
    return { valid: false, text: `${area} ô · Cần chứa một số.` };
  if (clues.length > 1)
    return { valid: false, text: `${area} ô · Chỉ được chứa một số.` };
  if (area !== clues[0].value)
    return {
      valid: false,
      text: `${area} / ${clues[0].value} ô · ${area < clues[0].value ? "Kéo rộng thêm" : "Thu nhỏ lại"}.`,
    };
  return {
    valid: true,
    text: `${rect.w} × ${rect.h} = ${area} ô · Thả để đặt ✓`,
  };
}
export function solved(puzzle: ShikakuPuzzle, rects: Rect[]) {
  return (
    rects.reduce((a, r) => a + r.w * r.h, 0) === puzzle.size ** 2 &&
    rects.every(
      (r, i) =>
        checkRegion(
          puzzle,
          r,
          rects.filter((_, j) => j !== i),
        ).valid,
    )
  );
}
// Search a completion consistent with the player's rectangles, not just the generator's answer.
// Bound work on older mobile devices; a exhausted search never reports a contradiction.
export function findCompletion(
  puzzle: ShikakuPuzzle,
  placed: Rect[],
  budget = 25000,
): { rects: Rect[] | null; exhausted: boolean } {
  if (
    placed.some(
      (r, i) =>
        !checkRegion(
          puzzle,
          r,
          placed.filter((_, j) => i !== j),
        ).valid,
    )
  )
    return { rects: null, exhausted: false };
  let visits = 0;
  let exhausted = false;
  const pending = puzzle.hints.filter(
    (h) => !placed.some((r) => contains(r, h)),
  );
  const options = pending.map((hint, i) => {
    const list: Rect[] = [];
    for (let h = 1; h <= puzzle.size; h++) {
      if (hint.value % h) continue;
      const w = hint.value / h;
      if (w > puzzle.size) continue;
      for (
        let r = Math.max(0, hint.r - h + 1);
        r <= Math.min(hint.r, puzzle.size - h);
        r++
      )
        for (
          let c = Math.max(0, hint.c - w + 1);
          c <= Math.min(hint.c, puzzle.size - w);
          c++
        ) {
          const rect = { id: `hint-${i}-${r}-${c}-${w}`, r, c, w, h };
          if (checkRegion(puzzle, rect, placed).valid) list.push(rect);
        }
    }
    return list;
  });
  const search = (groups: Rect[][], chosen: Rect[]): Rect[] | null => {
    if (++visits > budget) {
      exhausted = true;
      return null;
    }
    if (!groups.length) return chosen;
    groups.sort((a, b) => a.length - b.length);
    if (!groups[0].length) return null;
    for (const rect of groups[0]) {
      const next = groups
        .slice(1)
        .map((g) => g.filter((r) => !overlaps(r, rect)));
      const result = search(next, [...chosen, rect]);
      if (result) return result;
      if (exhausted) return null;
    }
    return null;
  };
  const result = search(options, []);
  return { rects: result ? [...placed, ...result] : null, exhausted };
}
export const tutorialPuzzle: ShikakuPuzzle = {
  size: 4,
  contentVersion: 2,
  seed: 2026,
  hints: [
    { r: 0, c: 0, value: 4 },
    { r: 0, c: 3, value: 4 },
    { r: 3, c: 0, value: 4 },
    { r: 3, c: 3, value: 4 },
  ],
  solution: [
    { id: "a", r: 0, c: 0, w: 2, h: 2 },
    { id: "b", r: 0, c: 2, w: 2, h: 2 },
    { id: "c", r: 2, c: 0, w: 2, h: 2 },
    { id: "d", r: 2, c: 2, w: 2, h: 2 },
  ],
};

export type HintExplanation = {
  text: string;
  rect: Rect | null;
  forced: boolean;
};
export function explainHint(
  puzzle: ShikakuPuzzle,
  placed: Rect[],
): HintExplanation {
  const result = findCompletion(puzzle, placed);
  if (!result.rects)
    return {
      rect: null,
      forced: false,
      text: result.exhausted
        ? "Chưa tìm được lời giải trong lượt tìm này. Thử hoàn tác một vùng gần đây."
        : "Các vùng hiện tại không thể ghép kín bảng. Thử sửa một vùng; đúng diện tích chưa đủ để hoàn thành.",
    };
  const pending = puzzle.hints.filter(
    (h) => !placed.some((r) => contains(r, h)),
  );
  let smallest: {
    rect: Rect;
    count: number;
    value: number;
    at: { r: number; c: number };
  } | null = null;
  for (const clue of pending) {
    let count = 0;
    for (let h = 1; h <= puzzle.size; h++) {
      if (clue.value % h) continue;
      const w = clue.value / h;
      if (w > puzzle.size) continue;
      for (
        let r = Math.max(0, clue.r - h + 1);
        r <= Math.min(clue.r, puzzle.size - h);
        r++
      )
        for (
          let c = Math.max(0, clue.c - w + 1);
          c <= Math.min(clue.c, puzzle.size - w);
          c++
        )
          if (
            checkRegion(puzzle, { id: "candidate", r, c, w, h }, placed).valid
          )
            count++;
    }
    const rect = result.rects.find((r) => contains(r, clue))!;
    if (!smallest || count < smallest.count)
      smallest = { rect, count, value: clue.value, at: clue };
  }
  if (!smallest)
    return { rect: null, forced: false, text: "Bảng đã hoàn thành." };
  const { rect, count, value, at } = smallest;
  const location = `số ${value} ở hàng ${at.r + 1}, cột ${at.c + 1}`;
  if (count === 1)
    return {
      rect,
      forced: true,
      text: `Xét ${location}: mép bảng, các số khác và vùng đã đặt chỉ cho phép một hình ${rect.w} × ${rect.h}. Đây là vùng bắt buộc.`,
    };
  const factors = [];
  for (let w = 1; w <= puzzle.size; w++)
    if (value % w === 0 && value / w <= puzzle.size)
      factors.push(`${w} × ${value / w}`);
  return {
    rect,
    forced: false,
    text: `Xét ${location}: ${value} = ${factors.join(" hoặc ")}. Còn ${count} vị trí hợp lệ về diện tích; hãy loại hình chứa số khác hoặc đè vùng cũ. Bấm xem khung nếu cần một cách ghép đã kiểm tra tới cuối bảng.`,
  };
}

