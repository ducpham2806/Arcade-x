import type { Arena, Rect, V } from './core';
import type { StorageLike } from './story-save';

export const TRIAL_SAVE_KEY = 'snake-legend:meadow-trials:v1';
type TrialProgress = { arena: number; best: (number | null)[] };

export type TrialCourse = {
  arena: Arena;
  label: string;
  lesson: string;
  bridges: Rect[];
  parSeconds: number;
  guide: V[];
};

function points(pairs: [number, number][]): V[] {
  return pairs.map(([x, y]) => ({ x, y }));
}

const gardenRoute = points([[9,20],[15,20],[18,17],[19,12],[19,7],[22,4],[28,4],[31,9],[30,15],[27,21]]);
const streamRoute = points([[10,8.5],[14,8.5],[20,8.5],[28,8.5],[34,8.5],[37,13],[36,17],[32,20],[28,20],[21,20],[14,20],[9,20]]);
const brambleRoute = points([[11,24],[16,24],[21,24],[26,24],[29,20],[29,12],[28,8],[31,8],[36,8],[40,8],[45,8],[48,11],[48,18],[46,23],[40,25]]);

export const TRIALS: readonly TrialCourse[] = [
  {
    label: 'Uốn lượn',
    lesson: 'Ăn dọc lối rộng trước. Khi luồn qua hai bờ rào, nhả Dash và bắt đầu cua từ dấu quả kế tiếp.',
    parSeconds: 13.5,
    bridges: [],
    guide: gardenRoute,
    arena: {
      id: 13, name: 'Vườn Quanh Co', subtitle: '10 quả · luyện vòng cua giữa hai bờ rào',
      w: 35, h: 25, start: {x: 6, y: 20}, heading: 0, length: 5,
      walls: [{x: 11, y: 6, w: 3, h: 11}, {x: 22, y: 8, w: 3, h: 10}],
      water: [], spikes: [], route: gardenRoute,
    },
  },
  {
    label: 'Qua suối',
    lesson: 'Căn thẳng trước mép nước. Qua cầu rộng sang bờ đông, lượn một vòng rồi trở về theo cầu hẹp.',
    parSeconds: 17,
    bridges: [{x: 15, y: 6.6, w: 12, h: 3.8}, {x: 15, y: 18.3, w: 12, h: 3.4}],
    guide: streamRoute,
    arena: {
      id: 14, name: 'Suối Hai Nhịp', subtitle: '12 quả · qua hai cầu và vòng trên bờ đông',
      w: 42, h: 28, start: {x: 6, y: 8.5}, heading: 0, length: 7,
      walls: [{x: 27.8, y: 11.5, w: 1.6, h: 5.5}, {x: 33, y: 12, w: 1.4, h: 4}],
      water: [
        {x: 15, y: 0, w: 12, h: 6.6}, {x: 15, y: 10.4, w: 12, h: 7.9},
        {x: 15, y: 21.7, w: 12, h: 6.3},
      ],
      spikes: [], route: streamRoute,
    },
  },
  {
    label: 'Vượt gai',
    lesson: 'Qua cầu nam rồi đổi hướng trên cồn. Căn thẳng tới cầu bắc và chọn vòng ngoài cụm gai ở bờ đông.',
    parSeconds: 19.5,
    bridges: [{x: 13, y: 22.1, w: 7, h: 3.8}, {x: 32, y: 6.4, w: 7, h: 3.2}],
    guide: brambleRoute,
    arena: {
      id: 15, name: 'Vòng Gai Cổ Thụ', subtitle: '15 quả · nối hai cầu lệch hướng và tránh bụi gai',
      w: 53, h: 31, start: {x: 7, y: 24}, heading: 0, length: 9,
      walls: [{x: 23, y: 11, w: 2.5, h: 9}, {x: 43, y: 12, w: 2, h: 6}],
      water: [
        {x: 13, y: 0, w: 7, h: 22.1}, {x: 13, y: 25.9, w: 7, h: 5.1},
        {x: 32, y: 0, w: 7, h: 6.4}, {x: 32, y: 9.6, w: 7, h: 21.4},
      ],
      spikes: [{x: 26, y: 9.5, w: .7, h: 6.5}, {x: 45.5, y: 12.5, w: .6, h: 5}, {x: 41, y: 17, w: .6, h: 4}],
      route: brambleRoute,
    },
  },
];

export function trialForArena(id: number): TrialCourse | undefined {
  return TRIALS.find(trial => trial.arena.id === id);
}

export function loadTrialProgress(store: StorageLike): TrialProgress {
  const blank: TrialProgress = { arena: 0, best: TRIALS.map(() => null) };
  try {
    const record = JSON.parse(store.getItem(TRIAL_SAVE_KEY) ?? 'null');
    if (record?.version !== 1) return blank;
    return {
      arena: Number.isInteger(record.arena) && record.arena >= 0 && record.arena < TRIALS.length ? record.arena : 0,
      best: TRIALS.map((_, i) => Number.isFinite(record.best?.[i]) && record.best[i] > 0 ? record.best[i] : null),
    };
  } catch {
    return blank;
  }
}

export function saveTrialProgress(store: StorageLike, progress: TrialProgress): TrialProgress {
  const previous = loadTrialProgress(store);
  const best = progress.best.map((time, i) => {
    const old = previous.best[i];
    if (old === null) return time;
    return time === null ? old : Math.min(old, time);
  });
  const next = { arena: progress.arena, best };
  store.setItem(TRIAL_SAVE_KEY, JSON.stringify({ version: 1, ...next }));
  return next;
}
