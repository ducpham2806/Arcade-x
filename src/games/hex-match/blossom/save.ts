import { Run, Save } from "./types";
import { starThresholds } from "./levels";
export const SAVE_KEY =
  typeof window !== "undefined" && window.__BLOSSOM_REVIEW__
    ? "arcadex_blossom_review_v1"
    : "arcadex_blossom_v1";
export const BOOSTERS: Record<
  string,
  {
    label: string;
    price: number;
    unlock: number;
    start: boolean;
    max: number;
    icon: string;
  }
> = {
  bee: {
    label: "Ong Mật",
    price: 80,
    unlock: 5,
    start: true,
    max: 1,
    icon: "🐝",
  },
  bomb: {
    label: "Bom Hoa",
    price: 100,
    unlock: 5,
    start: true,
    max: 1,
    icon: "🌸",
  },
  rainbow: {
    label: "Cầu Vồng",
    price: 150,
    unlock: 15,
    start: true,
    max: 1,
    icon: "🌈",
  },
  moves: {
    label: "+5 lượt / +10 giây",
    price: 120,
    unlock: 10,
    start: true,
    max: 1,
    icon: "➕",
  },
  fertilizer: {
    label: "Phân bón",
    price: 90,
    unlock: 10,
    start: true,
    max: 1,
    icon: "🌱",
  },
  hammer: {
    label: "Búa",
    price: 100,
    unlock: 8,
    start: false,
    max: 2,
    icon: "🔨",
  },
  shuffle: {
    label: "Trộn",
    price: 100,
    unlock: 8,
    start: false,
    max: 2,
    icon: "🔄",
  },
  undo: {
    label: "Hoàn tác",
    price: 120,
    unlock: 8,
    start: false,
    max: 2,
    icon: "↶",
  },
  vacuum: {
    label: "Hút màu",
    price: 200,
    unlock: 31,
    start: false,
    max: 1,
    icon: "🌀",
  },
  broom: {
    label: "Chổi",
    price: 150,
    unlock: 41,
    start: false,
    max: 1,
    icon: "🧹",
  },
};
export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function defaultSave(): Save {
  return {
    version: 1,
    coins: 0,
    stars: {},
    best: {},
    losses: {},
    inventory: {},
    completed: [],
    rewardDays: {},
    daily: {},
    garden: Array(48).fill(null),
    companion: "bibi",
    settings: {
      style: "gloss",
      volume: 0.8,
      music: true,
      musicVolume: 0.22,
      haptic: true,
      reduced: false,
      labels: false,
      hint: true,
      language: "vi",
      font: 1,
      season: "none",
      sameSeed: false,
    },
    badges: [],
    streak: 0,
    lastDaily: "",
    perfectStreak: 0,
    clean: [],
  };
}
export function validateSave(raw: unknown): Save {
  const base = defaultSave();
  if (!raw || typeof raw !== "object" || (raw as Save).version !== 1)
    return base;
  const x = raw as Save;
  const numeric = (o: unknown, max: number): Record<string, number> => {
    if (!o || typeof o !== "object") return {};
    return Object.fromEntries(
      Object.entries(o)
        .filter(
          ([k, v]) => /^\d+$/.test(k) && Number.isFinite(v) && Number(v) >= 0,
        )
        .map(([k, v]) => [k, Math.min(max, Math.floor(Number(v)))]),
    );
  };
  return {
    ...base,
    ...x,
    tutorials: Array.isArray(x.tutorials)
      ? x.tutorials.filter((t) => typeof t === "string")
      : [],
    pendingResult:
      x.pendingResult?.run?.version === 1 &&
      Array.isArray(x.pendingResult.run.board) &&
      x.pendingResult.run.board.length ===
        x.pendingResult.run.level?.cols * x.pendingResult.run.level?.rows &&
      ["won", "lost"].includes(x.pendingResult.run.status) &&
      Number.isFinite(x.pendingResult.stars) &&
      Number.isFinite(x.pendingResult.reward)
        ? x.pendingResult
        : undefined,
    coins: Math.min(99999, Math.max(0, Math.floor(Number(x.coins) || 0))),
    stars: numeric(x.stars, 3),
    best: numeric(x.best, 1e9),
    losses: numeric(x.losses, 100),
    inventory: Object.fromEntries(
      Object.keys(BOOSTERS).map((k) => [
        k,
        Math.min(5, Math.max(0, Math.floor(Number(x.inventory?.[k]) || 0))),
      ]),
    ),
    settings: {
      ...base.settings,
      ...x.settings,
      style: x.settings?.style === "chibi" ? "chibi" : "gloss",
      language: x.settings?.language === "en" ? "en" : "vi",
      season: ["tet", "trungthu"].includes(x.settings?.season)
        ? x.settings.season
        : "none",
      sameSeed: !!x.settings?.sameSeed,
      haptic: x.settings?.haptic !== false,
      reduced: !!x.settings?.reduced,
      labels: !!x.settings?.labels,
      hint: x.settings?.hint !== false,
      volume: Math.min(1, Math.max(0, Number(x.settings?.volume) || 0)),
      music: x.settings?.music !== false,
      musicVolume: Number.isFinite(x.settings?.musicVolume)
        ? Math.min(1, Math.max(0, x.settings.musicVolume))
        : 0.22,
      font: [1, 1.15, 1.3].includes(x.settings?.font) ? x.settings.font : 1,
    },
    completed: Array.isArray(x.completed) ? x.completed.slice(-500) : [],
    badges: Array.isArray(x.badges) ? x.badges : [],
    clean: Array.isArray(x.clean) ? x.clean : [],
    garden: Array.from({ length: 48 }, (_, i) =>
      typeof x.garden?.[i] === "string" ? x.garden[i] : null,
    ),
    active:
      x.active?.version === 1 &&
      Array.isArray(x.active.board) &&
      x.active.level?.rows >= 5 &&
      x.active.level?.rows <= 9 &&
      x.active.level?.cols >= 5 &&
      x.active.level?.cols <= 9 &&
      x.active.level?.rows * x.active.level?.cols === x.active.board.length &&
      x.active.board.every(
        (t) =>
          t &&
          Number.isSafeInteger(t.id) &&
          Number.isInteger(t.color) &&
          t.color >= -2 &&
          t.color <= 5,
      ) &&
      Array.isArray(x.active.level.goals) &&
      ["playing", "won", "lost"].includes(x.active.status) &&
      Number.isFinite(x.active.score) &&
      Array.isArray(x.active.log)
        ? x.active
        : undefined,
  };
}
export function loadSave(
  storage: Pick<Storage, "getItem" | "setItem"> = localStorage,
): Save {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (raw) return validateSave(JSON.parse(raw));
    const s = defaultSave();
    if (typeof window !== "undefined" && window.__BLOSSOM_REVIEW__) return s;
    const old = {
      unlocked: storage.getItem("arcadex_hex_unlocked_lvl"),
      stars: storage.getItem("arcadex_hex_stars"),
      boosters: storage.getItem("arcadex_hex_boosters"),
    };
    if (Object.values(old).some(Boolean)) {
      s.legacy = old;
      storage.setItem("arcadex_hex_legacy_backup_v1", JSON.stringify(old));
    }
    return s;
  } catch {
    return defaultSave();
  }
}
export function persist(s: Save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* Storage is optional. */
  }
}
export function unlocked(s: Save, n: number): boolean {
  if (n === 1) return true;
  if (!s.stars[String(n - 1)]) return false;
  if ((n - 1) % 10 === 0) {
    const c = (n - 1) / 10;
    return (
      Array.from(
        { length: 10 },
        (_, k) => s.stars[String((c - 1) * 10 + k + 1)] || 0,
      ).reduce((a, b) => a + b, 0) >=
      14 + c
    );
  }
  return true;
}
export function reached(s: Save): number {
  return Math.max(
    1,
    ...Object.keys(s.stars)
      .filter((k) => s.stars[k] > 0)
      .map(Number),
  );
}
export function reserve(save: Save, run: Run, selected: string[]): Save {
  const s = structuredClone(save);
  for (const k of selected) {
    const b = BOOSTERS[k];
    if (!b || !s.inventory[k]) continue;
    const n = b.start ? 1 : Math.min(b.max, s.inventory[k]);
    s.inventory[k] -= n;
    run.used[`reserved:${k}`] = n;
  }
  s.active = run;
  return s;
}
export function refund(save: Save, run: Run): Save {
  const s = structuredClone(save);
  for (const [k, b] of Object.entries(BOOSTERS)) {
    if (b.start) continue;
    const n = (run.used[`reserved:${k}`] || 0) - (run.used[k] || 0);
    s.inventory[k] = Math.min(5, (s.inventory[k] || 0) + Math.max(0, n));
  }
  s.active = undefined;
  return s;
}
export function settle(
  save: Save,
  run: Run,
  date = dayKey(),
): { save: Save; stars: number; reward: number } {
  date = run.dailyDate || date;
  const [two, three] = starThresholds(run.level),
    stars =
      run.status === "won"
        ? run.score >= three
          ? 3
          : run.score >= two
            ? 2
            : 1
        : 0;
  if (save.completed.includes(run.id)) return { save, stars, reward: 0 };
  let s = refund(save, run);
  s.completed = [...s.completed, run.id].slice(-500);
  let reward = 0;
  const id = String(run.level.id),
    old = s.stars[id] || 0;
  if (run.status === "won") {
    if (run.mode === "daily") {
      const previous = s.daily[date] || 0,
        b = [0, 40, 60, 80];
      if (stars > previous) {
        reward = b[stars] - b[previous];
        s.daily[date] = stars;
        if (!previous) {
          const yesterday = new Date(`${date}T12:00:00`);
          yesterday.setDate(yesterday.getDate() - 1);
          s.streak =
            s.lastDaily === dayKey(yesterday) ? Math.min(7, s.streak + 1) : 1;
          s.lastDaily = date;
          reward += s.streak * 10;
        }
      }
    } else if (run.mode === "campaign") {
      const b = [0, 30, 45, 60];
      reward = stars <= old ? Math.floor(b[stars] * 0.3) : b[stars];
      if (run.level.bossHP && !old) reward *= 3;
      reward += run.bonusMoves * 5;
      if (
        s.best[id] &&
        run.score >= s.best[id] * 1.05 &&
        s.rewardDays[id] !== date
      ) {
        reward += 20;
        s.rewardDays[id] = date;
      }
      s.stars[id] = Math.max(old, stars);
      s.best[id] = Math.max(s.best[id] || 0, run.score);
      s.losses[id] = 0;
      if (run.level.id === 5 && !s.badges.includes("level5")) {
        s.badges.push("level5");
        reward += 300;
      }
      if (
        !run.started.length &&
        !Object.entries(run.used).some(
          ([k, v]) => !k.startsWith("reserved:") && v > 0,
        ) &&
        !s.clean.includes(run.level.id)
      )
        s.clean.push(run.level.id);
      s.perfectStreak = stars === 3 ? s.perfectStreak + 1 : 0;
      if (s.perfectStreak >= 5 && !s.badges.includes("perfect5")) {
        s.badges.push("perfect5");
        reward += 50;
      }
      for (let c = 1; c <= 10; c++)
        if (
          Array.from({ length: 10 }, (_, i) => (c - 1) * 10 + i + 1).every(
            (i) => s.clean.includes(i),
          ) &&
          !s.badges.includes(`clean${c}`)
        )
          s.badges.push(`clean${c}`);
      if (run.level.id === 100 && !s.badges.includes("tree"))
        s.badges.push("tree");
    } else {
      const flag = `side:${run.level.id}`;
      if (!s.badges.includes(flag)) {
        s.badges.push(flag);
        reward = 40;
      }
      reward += run.progress.giftCoins || 0;
    }
    if (run.companion === "pip" && run.mode !== "daily") reward += 5;
  } else if (run.mode === "campaign") s.losses[id] = (s.losses[id] || 0) + 1;
  if (
    run.mode === "campaign" &&
    (run.maxCombo || run.combo) >= 10 &&
    !s.badges.includes("combo10")
  ) {
    s.badges.push("combo10");
    reward += 50;
  }
  s.coins = Math.min(99999, s.coins + reward);
  return { save: s, stars, reward };
}
export function buy(s: Save, k: string): Save {
  const b = BOOSTERS[k];
  if (
    !b ||
    reached(s) < b.unlock ||
    (s.inventory[k] || 0) >= 5 ||
    s.coins < b.price
  )
    return s;
  const n = structuredClone(s);
  n.coins -= b.price;
  n.inventory[k] = (n.inventory[k] || 0) + 1;
  return n;
}
