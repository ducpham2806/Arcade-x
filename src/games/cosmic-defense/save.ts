import {
  BOOSTERS,
  GATES,
  levelFor,
  UPGRADE_INFO,
  upgradeCost,
} from "./content.ts";
import { EMPTY_UPGRADES, replaySimulation, resultFor } from "./engine.ts";
import type {
  CosmicSave,
  Simulation,
  Upgrade,
  Booster,
  RunConfig,
  Result,
} from "./types.ts";
const num = (v: unknown, min: number, max: number, fallback = 0) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(min, Math.min(max, Math.round(v)))
    : fallback;
export function emptySave(): CosmicSave {
  return {
    version: 2,
    credits: 0,
    cores: 0,
    blueprints: 0,
    kits: 0,
    integrity: 100,
    upgrades: { ...EMPTY_UPGRADES },
    inventory: Object.fromEntries(
      Object.keys(BOOSTERS).map((k) => [k, 0]),
    ) as CosmicSave["inventory"],
    results: {},
    attempts: {},
    unlocked: 1,
    ngUnlocked: 1,
    ngResults: {},
    archive: [],
    runs: 0,
    lastLevel: 0,
    streak: 0,
    emergencyAt: -3,
    tutorial: true,
    skin: "nova",
    ship: "nova",
    settings: {
      reducedMotion: false,
      hitbox: true,
      backgroundDim: 0.2,
      sensitivity: 1,
      oneHand: false,
      practiceSpeed: 1,
      sound: true,
    },
    run: null,
    bestReplay: null,
    daily: { day: "", attempts: 0, best: 0 },
    pending: [],
  };
}
export function validConfig(c: RunConfig) {
  return (
    !!c &&
    c.version === 2 &&
    Number.isInteger(c.level) &&
    c.level >= 1 &&
    c.level <= 100 &&
    Number.isInteger(c.seed) &&
    c.seed >= 0 &&
    c.seed <= 4294967295 &&
    [
      "campaign",
      "practice",
      "daily",
      "weekly",
      "endless",
      "rush",
      "ngplus",
    ].includes(c.mode) &&
    typeof c.integrity === "number" &&
    c.integrity >= 0 &&
    c.integrity <= 100 &&
    !!c.upgrades &&
    Object.keys(EMPTY_UPGRADES).every(
      (k) =>
        Number.isInteger(c.upgrades[k]) &&
        c.upgrades[k] >= 0 &&
        c.upgrades[k] <= 10,
    ) &&
    Array.isArray(c.boosters) &&
    c.boosters.length <= 3 &&
    new Set(c.boosters).size === c.boosters.length &&
    c.boosters.every((b) => b in BOOSTERS) &&
    Array.isArray(c.mutators) &&
    c.mutators.length <= 2 &&
    c.mutators.every((m) =>
      [
        "glass",
        "swarm",
        "fast",
        "iron",
        "blackout",
        "dry",
        "pacifist",
        "remix",
      ].includes(m),
    ) &&
    (!c.practiceEnemy ||
      [
        "scout",
        "gnat",
        "drone",
        "wasp",
        "moth",
        "hornet",
        "larva",
        "beetle",
        "mantis",
        "cicada",
        "minelayer",
        "wraith",
        "commander",
        "prism",
      ].includes(c.practiceEnemy)) &&
    (!c.practicePath ||
      (Number.isInteger(c.practicePath) &&
        c.practicePath >= 1 &&
        c.practicePath <= 17)) &&
    (!c.practiceCount ||
      (Number.isInteger(c.practiceCount) &&
        c.practiceCount >= 1 &&
        c.practiceCount <= 6))
  );
}
export const totalStars = (s: CosmicSave) =>
  Object.values(s.results).reduce((a, r) => a + r.stars, 0);
export function planetOpen(s: CosmicSave, p: number) {
  return (
    p === 1 ||
    (!!s.results[String((p - 1) * 10)]?.won && totalStars(s) >= GATES[p - 1])
  );
}
export function highestPlanet(s: CosmicSave) {
  let p = 1;
  for (let n = 2; n <= 10; n++) if (planetOpen(s, n)) p = n;
  return p;
}
export function levelOpen(s: CosmicSave, id: number) {
  return (
    id >= 1 &&
    id <= 100 &&
    planetOpen(s, levelFor(id).planet) &&
    (id === 1 || !!s.results[String(id - 1)]?.won)
  );
}
export function hydrateSave(raw: unknown): CosmicSave {
  const s = emptySave(),
    r = raw as Partial<CosmicSave>;
  if (!r || r.version !== 2) return s;
  for (const k of [
    "credits",
    "cores",
    "blueprints",
    "kits",
    "runs",
    "streak",
  ] as const)
    s[k] = num(r[k], 0, 100000000);
  s.integrity = num(r.integrity, 0, 100, 100);
  s.lastLevel = num(r.lastLevel, 0, 100);
  s.emergencyAt = num(r.emergencyAt, -3, s.runs, -3);
  for (const k of Object.keys(UPGRADE_INFO) as Upgrade[])
    s.upgrades[k] = num(r.upgrades?.[k], 0, 10);
  for (const k of Object.keys(BOOSTERS) as Booster[])
    s.inventory[k] = num(r.inventory?.[k], 0, 10000);
  for (const [id, v] of Object.entries(r.results || {}).slice(0, 100)) {
    if (
      Number(id) >= 1 &&
      Number(id) <= 100 &&
      v?.won === true &&
      v.mode === "campaign" &&
      v.level === Number(id) &&
      Number.isInteger(v.stars) &&
      v.stars >= 1 &&
      v.stars <= 3 &&
      Number.isFinite(v.score) &&
      v.score >= 0
    )
      s.results[id] = v;
  }
  s.ngUnlocked = num(r.ngUnlocked, 1, 100, 1);
  s.ngResults =
    r.ngResults && typeof r.ngResults === "object" ? r.ngResults : {};
  s.unlocked = Math.min(
    100,
    1 + Object.keys(s.results).reduce((a, k) => Math.max(a, Number(k)), 0),
  );
  for (const [id, v] of Object.entries(r.attempts || {}))
    if (Number(id) >= 1 && Number(id) <= 100)
      s.attempts[id] = num(v, 0, 100000);
  s.archive = Array.isArray(r.archive)
    ? [
        ...new Set(
          r.archive.filter((n) => Number.isInteger(n) && n >= 0 && n < 30),
        ),
      ]
    : [];
  s.tutorial = r.tutorial !== false;
  s.skin = [
    "nova",
    "ember",
    "frostbite",
    "verdant",
    "royal_violet",
    "solar_flare",
  ].includes(r.skin)
    ? r.skin
    : "nova";
  s.ship = ["nova", "striker", "bulwark", "courier"].includes(r.ship)
    ? r.ship
    : "nova";
  s.settings = {
    reducedMotion: r.settings?.reducedMotion === true,
    hitbox: r.settings?.hitbox !== false,
    backgroundDim:
      num((r.settings?.backgroundDim ?? 0.2) * 100, 0, 60, 20) / 100,
    sensitivity: num((r.settings?.sensitivity ?? 1) * 100, 60, 160, 100) / 100,
    oneHand: r.settings?.oneHand === true,
    practiceSpeed: [0.7, 0.85, 1].includes(r.settings?.practiceSpeed)
      ? r.settings.practiceSpeed
      : 1,
    sound: r.settings?.sound !== false,
  };
  if (/^\d{4}-\d{2}-\d{2}$/.test(r.daily?.day || ""))
    s.daily = {
      day: r.daily.day,
      attempts: num(r.daily.attempts, 0, 3),
      best: num(r.daily.best, 0, 100000000),
    };
  if (r.run && validConfig(r.run.config)) {
    try {
      const run = replaySimulation(r.run.config, r.run.replay, r.run.frame);
      if (run.status === "playing" || run.status === "revive") s.run = r.run;
    } catch {
      /* corrupt replay cannot resume */
    }
  }
  if (
    r.bestReplay &&
    validConfig(r.bestReplay.config) &&
    Array.isArray(r.bestReplay.replay) &&
    r.bestReplay.replay.length <= 12200
  )
    s.bestReplay = r.bestReplay;
  s.pending = Array.isArray(r.pending)
    ? r.pending
        .filter(
          (p) =>
            p &&
            typeof p.ticket === "string" &&
            typeof p.owner === "string" &&
            validConfig(p.config) &&
            Array.isArray(p.replay) &&
            p.replay.length <= 12200,
        )
        .slice(-10)
    : [];
  return s;
}
export function complete(
  s: CosmicSave,
  sim: Simulation,
): { save: CosmicSave; result: Result } {
  const result = resultFor(sim),
    l = levelFor(sim.config.level);
  let next: CosmicSave = { ...s, run: null };
  if (sim.config.mode === "practice") return { save: next, result };
  next = {
    ...next,
    runs: s.runs + 1,
    attempts: { ...s.attempts, [l.id]: (s.attempts[l.id] || 0) + 1 },
    streak: s.lastLevel === l.id ? s.streak + 1 : 1,
    lastLevel: l.id,
  };
  const repeated = !!s.results[l.id],
    factor = repeated ? (next.streak >= 4 ? 0.55 : 0.7) : 1;
  let reward = result.credits * (sim.config.mode === "campaign" ? factor : 1);
  if (
    result.won &&
    l.stage === 10 &&
    !repeated &&
    sim.config.mode === "campaign"
  )
    reward += 500 * l.planet;
  next.credits = s.credits + Math.floor(reward);
  result.credits = Math.floor(reward);
  if (sim.config.mode === "campaign" || sim.config.mode === "ngplus")
    next.integrity = Math.max(
      0,
      Math.round(
        s.integrity -
          (sim.hits * 5 + sim.bossHits * 2 + (result.won ? 2 : 10)) *
            (1 - 0.03 * s.upgrades.hull),
      ),
    );
  if (result.won && sim.config.mode === "campaign") {
    const old = s.results[l.id];
    next.results = {
      ...s.results,
      [l.id]: {
        ...result,
        stars: Math.max(old?.stars || 0, result.stars),
        score: Math.max(old?.score || 0, result.score),
      },
    };
    next.unlocked = Math.min(100, Math.max(s.unlocked, l.id + 1));
    next.cores += sim.collected;
    if (l.stage === 10 && !repeated) {
      next.blueprints += 3;
      next.kits++;
      next.inventory = {
        ...s.inventory,
        shield: s.inventory.shield + 1,
        bomb: s.inventory.bomb + 1,
      };
    }
    if (
      l.stage === 5 ||
      (l.stage === 9 && result.stars === 3) ||
      l.stage === 10
    ) {
      const entry =
        (l.planet - 1) * 3 + (l.stage === 5 ? 0 : l.stage === 9 ? 1 : 2);
      next.archive = [...new Set([...s.archive, entry])];
    }
  }
  if (sim.config.mode === "ngplus" && result.won) {
    next.ngUnlocked = Math.min(100, Math.max(s.ngUnlocked, l.id + 1));
    next.ngResults = { ...s.ngResults, [l.id]: result };
  }
  if (sim.config.mode === "daily" && result.won) {
    next.cores += 3;
    next.daily = { ...s.daily, best: Math.max(s.daily.best, result.score) };
  }
  if (
    result.won &&
    (!s.bestReplay ||
      s.bestReplay.config.level !== sim.config.level ||
      result.score > s.bestReplay.score)
  )
    next.bestReplay = {
      config: sim.config,
      replay: sim.replay,
      frame: sim.frame,
      score: result.score,
    };
  return { save: next, result };
}
export function buyUpgrade(s: CosmicSave, kind: Upgrade): CosmicSave {
  const lv = s.upgrades[kind],
    price = upgradeCost(kind, lv),
    cap = Math.min(10, highestPlanet(s) + 1);
  if (lv >= cap || s.credits < price) return s;
  return {
    ...s,
    credits: s.credits - price,
    upgrades: { ...s.upgrades, [kind]: lv + 1 },
  };
}
export function boosterPrice(
  s: CosmicSave,
  kind: Booster,
  p: number,
  day: string,
) {
  const keys = Object.keys(BOOSTERS),
    discount =
      keys[Number(day.replaceAll("-", "")) % keys.length] === kind ? 0.7 : 1;
  return Math.round(BOOSTERS[kind].price * (1 + 0.25 * (p - 1)) * discount);
}
export function buyBooster(
  s: CosmicSave,
  kind: Booster,
  p: number,
  day: string,
) {
  const price = boosterPrice(s, kind, p, day);
  if (highestPlanet(s) < BOOSTERS[kind].unlock || s.credits < price) return s;
  return {
    ...s,
    credits: s.credits - price,
    inventory: { ...s.inventory, [kind]: s.inventory[kind] + 1 },
  };
}
export function repairCost(s: CosmicSave, p: number, quick = false) {
  return Math.ceil(
    Math.max(0, (quick ? 80 : 100) - s.integrity) * 2 * p * (quick ? 0.85 : 1),
  );
}
export function repair(
  s: CosmicSave,
  p: number,
  kind: "full" | "quick" | "kit" | "emergency",
) {
  if (kind === "emergency") {
    if (
      s.integrity >= 40 ||
      s.runs - s.emergencyAt < 3 ||
      s.credits >= repairCost(s, p, true)
    )
      return s;
    return { ...s, integrity: 40, emergencyAt: s.runs };
  }
  if (kind === "kit")
    return s.kits > 0 ? { ...s, kits: s.kits - 1, integrity: 100 } : s;
  const cost = repairCost(s, p, kind === "quick");
  return s.credits >= cost
    ? {
        ...s,
        credits: s.credits - cost,
        integrity: Math.max(s.integrity, kind === "quick" ? 80 : 100),
      }
    : s;
}
