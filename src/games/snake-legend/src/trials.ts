import type { Arena, Rect, V } from './core';
import type { StorageLike } from './story-save';

export const TRIAL_SAVE_KEY = 'snake-legend:meadow-trials:v1';
export const TRIAL_STAGE_SIZE = 3;
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
const lakesideRoute = points([[11,26],[17,26],[23,26],[29,26],[33,24],[35,20],[35,14],[35,8],[32,4],[27,4],[20,4],[13,5]]);
const patrolRoute = points([[10,25],[13,23],[15,20],[20,20],[25,20],[30,20],[34,20],[38,18],[39,14],[36,12],[31,12],[26,12],[21,12],[16,12],[10,12]]);
const gorgeRoute = points([[12,25],[17,25],[22,25],[25,22],[26,17],[26,12],[26,8],[31,8],[35,8],[40,8],[44,9],[45,13],[45,17.5],[48,19],[52,19],[57,19],[61,23],[59,28]]);
const gorgeHeight = 34;
const gorgeBridges = [{x:14,y:23.1,w:6,h:3.8},{x:31,y:6.4,w:7,h:3.2},{x:49,y:17.3,w:6,h:3.4}];
const gorgeWater = gorgeBridges.flatMap(deck => {
  const bottom = deck.y + deck.h;
  return [{x:deck.x,y:0,w:deck.w,h:deck.y},{x:deck.x,y:bottom,w:deck.w,h:gorgeHeight-bottom}];
});

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
  {
    label: 'Ven hồ',
    lesson: 'Giữ cách mép nước một thân rắn. Đi dọc bờ nam rồi nhả Dash trước vòng cua ở góc đông.',
    parSeconds: 17.5,
    bridges: [],
    guide: lakesideRoute,
    arena: {
      id: 16, name: 'Bờ Hồ Cong', subtitle: '12 quả · ôm bờ hồ qua hai góc cua',
      w: 42, h: 32, start: {x:7,y:26}, heading: 0, length: 8,
      walls: [{x:11,y:12,w:2,h:8},{x:36.8,y:11,w:1.8,h:7}],
      water: [{x:16,y:8,w:14,h:15},{x:30,y:11,w:2,h:9}],
      spikes: [], route: lakesideRoute,
    },
  },
  {
    label: 'Tuần tra',
    lesson: 'Vật cản đỏ di chuyển. Đi giữa hai hàng, vòng ở bãi rộng phía đông rồi quay lại.',
    parSeconds: 18,
    bridges: [],
    guide: patrolRoute,
    arena: {
      id: 17, name: 'Vườn Tuần Tra', subtitle: '15 quả · men theo hai hàng vật cản di động',
      w: 45, h: 31, start: {x:6,y:25}, heading: 0, length: 9,
      walls: [{x:18,y:24,w:4,h:3},{x:5,y:7,w:1.8,h:6},{x:41,y:9,w:1.6,h:7}],
      water: [], spikes: [], patrols: 10, route: patrolRoute,
    },
  },
  {
    label: 'Ba cầu',
    lesson: 'Ba cầu lệch độ cao. Chỉnh hướng trên hai cồn, qua hẳn cầu cuối rồi mới rẽ về phía quả cuối.',
    parSeconds: 21.5,
    bridges: gorgeBridges,
    guide: gorgeRoute,
    arena: {
      id: 18, name: 'Hẻm Đá Ba Cầu', subtitle: '18 quả · qua ba cầu và hai cồn hẹp',
      w: 66, h: gorgeHeight, start: {x:8,y:25}, heading: 0, length: 10,
      walls: [{x:21.5,y:9,w:2.2,h:11},{x:39.5,y:12,w:2.4,h:6},{x:58,y:6,w:2.6,h:8}],
      water: gorgeWater,
      spikes: [{x:29,y:12,w:.62,h:6},{x:46.8,y:10.5,w:.6,h:4.8},{x:63,y:20,w:.6,h:6}],
      route: gorgeRoute,
    },
  },
];

export const TRIAL_STAGE_COUNT = Math.ceil(TRIALS.length / TRIAL_STAGE_SIZE);

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
  const best = TRIALS.map((_, i) => {
    const time = progress.best[i] ?? null;
    const old = previous.best[i];
    if (old === null) return time;
    return time === null ? old : Math.min(old, time);
  });
  const next = { arena: progress.arena, best };
  store.setItem(TRIAL_SAVE_KEY, JSON.stringify({ version: 1, ...next }));
  return next;
}
