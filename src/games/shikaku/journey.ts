import type { ShikakuPuzzle, Rect } from "./generator";
export const PACK_VERSION = 3;
export const CHAPTERS = [
  { title: "Đếm ô", skill: "Hiểu số là diện tích", color: "#8fdccc" },
  {
    title: "Ghép thừa số",
    skill: "Nhìn ra chiều rộng × chiều cao",
    color: "#aabdf6",
  },
  {
    title: "Đọc đường biên",
    skill: "Dùng mép bảng và các số cạnh nhau",
    color: "#f2c689",
  },
  { title: "Ghép toàn cảnh", skill: "Suy luận vùng còn lại", color: "#d1b4ed" },
];
export type Lesson = {
  id: number;
  chapter: number;
  title: string;
  tip: string;
  puzzle: ShikakuPuzzle;
};
// Authored partitions: each band has a height and a list of widths summing to the board size.
function board(
  size: number,
  bands: [number, number[]][],
  variant: number,
): ShikakuPuzzle {
  let row = 0;
  const solution: Rect[] = [];
  for (const [h, widths] of bands) {
    let c = 0;
    for (const w of widths) {
      solution.push({
        id: `lesson-${variant}-${solution.length}`,
        r: row,
        c,
        w,
        h,
      });
      c += w;
    }
    row += h;
  }
  const hints = solution.map((r, i) => ({
    r: r.r + (variant >= 10 ? (i + variant) % r.h : 0),
    c: r.c + (variant >= 5 ? (i + variant) % r.w : 0),
    value: r.w * r.h,
  }));
  return {
    size,
    seed: 3000 + variant,
    contentVersion: PACK_VERSION,
    solution,
    hints,
  };
}
const designs: [number, [number, number[]][], string, string][] = [
  [
    4,
    [
      [2, [2, 2]],
      [2, [2, 2]],
    ],
    "Bốn mảnh đầu tiên",
    "Số 4 cần 4 ô. Thử kéo hình 2 × 2.",
  ],
  [4, [[4, [1, 1, 2]]], "Dải đứng", "Cùng diện tích 4: hình 1 × 4 cũng đúng."],
  [
    4,
    [
      [1, [4]],
      [1, [4]],
      [2, [4]],
    ],
    "Dải ngang",
    "Hình 4 × 1 có cùng diện tích với 1 × 4.",
  ],
  [
    4,
    [
      [1, [1, 3]],
      [3, [1, 3]],
    ],
    "Một ô cũng là hình",
    "Số 1 chỉ cần một ô. Chạm ô đó để đặt.",
  ],
  [
    4,
    [
      [2, [1, 3]],
      [2, [2, 2]],
    ],
    "Thử ghép lại",
    "Dùng diện tích và các số cạnh nhau; hoàn tác miễn phí.",
  ],
  [
    5,
    [
      [3, [2, 3]],
      [2, [2, 3]],
    ],
    "Số 6 có hai chiều",
    "6 = 2 × 3. Hình cần vừa bảng và không chứa số thứ hai.",
  ],
  [
    5,
    [
      [1, [2, 3]],
      [4, [1, 2, 2]],
    ],
    "Đổi cách nhìn",
    "Số 8 có thể là 2 × 4 hoặc 4 × 2. Xem chỗ trống.",
  ],
  [
    5,
    [
      [2, [1, 4]],
      [3, [3, 2]],
    ],
    "Những cặp thừa số",
    "Chia số cho chiều rộng để biết chiều cao.",
  ],
  [
    6,
    [
      [2, [3, 3]],
      [4, [2, 4]],
    ],
    "Hai hình, cùng số",
    "Hai số 6 không nhất thiết có hình giống nhau.",
  ],
  [
    6,
    [
      [3, [2, 1, 3]],
      [3, [3, 1, 2]],
    ],
    "Nhớ điều đã học",
    "Mỗi hình chỉ được có một số, kể cả dải dài.",
  ],
  [
    6,
    [
      [1, [2, 4]],
      [2, [1, 3, 2]],
      [3, [2, 4]],
    ],
    "Tựa vào mép",
    "Nếu hình ra ngoài bảng, hãy thử xoay cặp thừa số.",
  ],
  [
    6,
    [
      [2, [2, 1, 3]],
      [1, [3, 3]],
      [3, [1, 2, 3]],
    ],
    "Số cạnh số",
    "Một hình không thể đi qua một số khác.",
  ],
  [
    6,
    [
      [3, [1, 2, 3]],
      [1, [4, 2]],
      [2, [3, 3]],
    ],
    "Góc bảng",
    "Ở góc, hướng mở rộng bị giới hạn bởi mép bảng.",
  ],
  [
    6,
    [
      [1, [1, 2, 3]],
      [4, [2, 4]],
      [1, [3, 2, 1]],
    ],
    "Ô nhỏ mở đường",
    "Giải những vùng ít khả năng trước để giảm lựa chọn.",
  ],
  [
    6,
    [
      [2, [4, 2]],
      [3, [2, 1, 3]],
      [1, [2, 2, 2]],
    ],
    "Vòng quanh đường biên",
    "Kết hợp mép bảng, số khác và vùng đã đặt.",
  ],
  [
    6,
    [
      [2, [1, 2, 3]],
      [2, [3, 1, 2]],
      [2, [2, 3, 1]],
    ],
    "Phần còn lại",
    "Đúng diện tích chưa chắc ghép kín. Hãy nhìn cả bảng.",
  ],
  [
    6,
    [
      [1, [3, 1, 2]],
      [3, [2, 4]],
      [2, [1, 3, 2]],
    ],
    "Tìm vùng bắt buộc",
    "Nếu một số chỉ có một vị trí hợp lệ, giải nó trước.",
  ],
  [
    8,
    [
      [2, [2, 3, 3]],
      [3, [1, 3, 4]],
      [3, [4, 2, 2]],
    ],
    "Bức tranh lớn",
    "Bảng lớn nhưng quy tắc không đổi. Bắt đầu từ vùng nhỏ.",
  ],
  [
    8,
    [
      [1, [1, 3, 4]],
      [2, [3, 2, 3]],
      [3, [2, 4, 2]],
      [2, [4, 4]],
    ],
    "Đừng vội đóng khung",
    "Nếu mắc kẹt, hoàn tác vùng gần đây để thử cách ghép khác.",
  ],
  [
    8,
    [
      [3, [2, 2, 4]],
      [1, [4, 1, 3]],
      [2, [1, 3, 4]],
      [2, [3, 3, 2]],
    ],
    "Tự ghép toàn cảnh",
    "Dùng các kỹ thuật đã học. Gợi ý luôn có khi cần.",
  ],
];
export const LESSONS: Lesson[] = designs.map(
  ([size, bands, title, tip], i) => ({
    id: i + 1,
    chapter: Math.floor(i / 5),
    title,
    tip,
    puzzle: board(size, bands, i),
  }),
);
export type RecordResult = { stars: number; elapsed: number; hints: number };
export type Journey = {
  lessons: Record<string, RecordResult>;
  daily: Record<string, RecordResult>;
};
export function hydrateJourney(value: unknown): Journey {
  const raw = value as any;
  const result: Journey = { lessons: {}, daily: {} };
  for (const group of ["lessons", "daily"] as const) {
    if (!raw?.[group] || typeof raw[group] !== "object") continue;
    for (const [key, item] of Object.entries(raw[group]).slice(-500)) {
      const r = item as RecordResult;
      if (group === "lessons" && !LESSONS.some((l) => String(l.id) === key))
        continue;
      if (group === "daily" && !/^\d{4}-\d{2}-\d{2}:(4|5|6|8):3$/.test(key))
        continue;
      if (
        !r ||
        !Number.isInteger(r.stars) ||
        r.stars < 1 ||
        r.stars > 3 ||
        !Number.isFinite(r.elapsed) ||
        r.elapsed < 0 ||
        !Number.isInteger(r.hints) ||
        r.hints < 0
      )
        continue;
      result[group][key] = {
        stars: r.stars,
        elapsed: r.elapsed,
        hints: r.hints,
      };
    }
  }
  return result;
}
export function lessonOpen(journey: Journey, id: number) {
  return id === 1 || !!journey.lessons[String(id - 1)];
}
export function storeResult(
  journey: Journey,
  kind: "lessons" | "daily",
  key: string,
  result: RecordResult,
): Journey {
  const old = journey[kind][key];
  if (
    old &&
    (old.stars > result.stars ||
      (old.stars === result.stars && old.elapsed <= result.elapsed))
  )
    return journey;
  return { ...journey, [kind]: { ...journey[kind], [key]: result } };
}
export function utcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}
export const dailyKey = (day: string, size: number) =>
  `${day}:${size}:${PACK_VERSION}`;
export function dailySeed(day: string, size: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || ![4, 5, 6, 8].includes(size))
    throw Error("Invalid daily config");
  const stamp = Date.parse(day + "T00:00:00Z");
  if (
    !Number.isFinite(stamp) ||
    new Date(stamp).toISOString().slice(0, 10) !== day
  )
    throw Error("Invalid calendar date");
  // Gregorian days since epoch; identical bigint arithmetic is used by PostgreSQL.
  return (
    (Math.imul(
      Math.floor(Date.parse(day + "T00:00:00Z") / 86400000),
      1103515245,
    ) +
      size * 12345 +
      PACK_VERSION * 97) >>>
    0
  );
}
export function dailyPuzzle(day: string, size: number): ShikakuPuzzle {
  let state = dailySeed(day, size);
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  let rects: Rect[] = [{ id: "root", r: 0, c: 0, w: size, h: size }];
  const max = size === 4 ? 6 : size === 5 ? 8 : 12;
  while (rects.some((r) => r.w * r.h > max)) {
    const next: Rect[] = [];
    for (const r of rects) {
      if (r.w * r.h <= max) {
        next.push(r);
        continue;
      }
      let horizontal = random() >= 0.5;
      if (r.w === 1) horizontal = true;
      if (r.h === 1) horizontal = false;
      const length = horizontal ? r.h : r.w;
      const cut = Math.floor(random() * (length - 1)) + 1;
      if (horizontal)
        next.push({ ...r, h: cut }, { ...r, r: r.r + cut, h: r.h - cut });
      else next.push({ ...r, w: cut }, { ...r, c: r.c + cut, w: r.w - cut });
    }
    rects = next;
  }
  const solution = rects.map((r, i) => ({ ...r, id: `daily-${i}` }));
  const hints = solution.map((r) => ({
    r: r.r + Math.floor(random() * r.h),
    c: r.c + Math.floor(random() * r.w),
    value: r.w * r.h,
  }));
  return {
    size,
    seed: dailySeed(day, size),
    contentVersion: PACK_VERSION,
    solution,
    hints,
  };
}

export function samePuzzle(a: ShikakuPuzzle, b: ShikakuPuzzle) {
  const signature = (p: ShikakuPuzzle) =>
    JSON.stringify({
      size: p.size,
      seed: p.seed,
      version: p.contentVersion,
      hints: p.hints.map((h) => [h.r, h.c, h.value]).sort(),
      solution: p.solution.map((r) => [r.r, r.c, r.w, r.h]).sort(),
    });
  return signature(a) === signature(b);
}
