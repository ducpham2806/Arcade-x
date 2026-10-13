import { test, expect } from "@playwright/test";
import {
  act,
  createRun,
  group,
  groups,
  hint,
  hasHazard,
  revealFog,
  tick,
} from "../../src/games/hex-match/blossom/engine";
import {
  LEVELS,
  starThresholds,
} from "../../src/games/hex-match/blossom/levels";
import {
  buy,
  defaultSave,
  refund,
  reserve,
  settle,
  unlocked,
} from "../../src/games/hex-match/blossom/save";
import { Run, Special } from "../../src/games/hex-match/blossom/types";
function fixture() {
  const l = structuredClone(LEVELS[4]);
  l.goals = [{ kind: "score", target: 1e8 }];
  const s = createRun(l, 42, { id: "test" });
  s.board = s.board.map((t, i) => ({
    id: t.id,
    color: (i + Math.floor(i / l.cols)) % 4,
  }));
  s.lastTap = 0;
  return s;
}
function apply(s: Run, cell: number) {
  return act(s, { type: "tap", cell }, 3000).run;
}
test("100 blueprints, reproducible seed, legal openings and hazard caps", () => {
  expect(LEVELS).toHaveLength(100);
  for (const l of LEVELS)
    for (let seed = 1; seed <= 20; seed++) {
      const a = createRun(l, seed, { id: "same" }),
        b = createRun(l, seed, { id: "same" });
      expect(a).toEqual(b);
      expect(groups(a).length, `L${l.id}, seed ${seed}`).toBeGreaterThanOrEqual(
        3,
      );
      expect(a.board.filter((t) => t.hazard).length).toBeLessThanOrEqual(
        Math.floor(a.board.length * 0.35),
      );
      expect(
        a.board.filter((t) => t.hazard === "bug").length,
      ).toBeLessThanOrEqual(5);
      expect(
        a.board.filter((t) => t.hazard === "bomb").length,
      ).toBeLessThanOrEqual(3);
      for (const g of l.goals) {
        if (
          [
            "weed",
            "rock",
            "ice",
            "cocoon",
            "bug",
            "bomb",
            "fog",
            "honey",
            "vine",
          ].includes(g.kind)
        )
          expect(
            a.board.filter((t) => t.hazard === g.kind).length,
            `L${l.id} ${g.kind}`,
          ).toBeGreaterThanOrEqual(g.target);
        if (g.kind === "rescue")
          expect(a.board.filter((t) => t.pet).length).toBe(g.target);
      }
    }
});
test("diagonal-only groups are invalid and never spend moves", () => {
  const s = fixture();
  s.board[0].color = 3;
  s.board[7].color = 3;
  s.board[14].color = 3;
  s.board[1].color = 1;
  s.board[6].color = 1;
  expect(group(s, 0)).toHaveLength(1);
  const out = act(s, { type: "tap", cell: 0 }, 1);
  expect(out.valid).toBe(false);
  expect(out.run).toBe(s);
});
test("thresholds create four specials and do not activate adjacent specials", () => {
  for (const [n, special] of [
    [5, "bee_h"],
    [7, "bloom_bomb"],
    [9, "rainbow_orb"],
    [11, "sun"],
  ] as [number, Special][]) {
    const s = fixture();
    for (let i = 0; i < n; i++) s.board[i].color = 0;
    s.board[n] = { id: 1000, color: 2, special: "rainbow_orb" };
    const out = apply(s, 0);
    expect(out.board.some((t) => t.special === special)).toBe(true);
    expect(out.effects.filter((e) => e.type !== "pop")).toHaveLength(0);
    expect(out.board.some((t) => t.id === 1000)).toBe(true);
    expect(out.moves).toBe(s.moves - 1);
  }
});
test("multi-layer hazard loses one layer per blast and counts on final destruction", () => {
  let s = fixture();
  s.board[6] = { id: 100, color: -1, hazard: "rock", hp: 2 };
  [0, 1, 2].forEach((i) => (s.board[i].color = 3));
  s = apply(s, 0);
  expect(s.board[6].hp).toBe(1);
  expect(s.progress.rock || 0).toBe(0);
  s.board[0].color = s.board[1].color = s.board[2].color = 3;
  s = apply(s, 0);
  expect(s.progress.rock).toBe(1);
});
test("special chain activates each special once and counts removed pieces once", () => {
  const s = fixture();
  s.board[14].special = "bloom_bomb";
  s.board[15].special = "bee_h";
  s.board[20].special = "bee_v";
  const out = apply(s, 14);
  expect(new Set(out.effects.map((e) => e.cell)).size).toBe(out.effects.length);
  const count = Object.entries(out.progress)
    .filter(([k]) => k.startsWith("collect"))
    .reduce((sum, [, n]) => sum + n, 0);
  expect(count).toBeLessThanOrEqual(s.board.length);
  expect(out.effects.length).toBe(3);
});
test("all explicit pair types cost one move; nonadjacent pairs rejected", () => {
  const pairs: [Special, Special][] = [
    ["bee_h", "bee_v"],
    ["bee_h", "bloom_bomb"],
    ["bloom_bomb", "bloom_bomb"],
    ["rainbow_orb", "bee_h"],
    ["rainbow_orb", "bloom_bomb"],
    ["rainbow_orb", "rainbow_orb"],
    ["sun", "bloom_bomb"],
  ];
  for (const [a, b] of pairs) {
    const s = fixture();
    s.board[14].special = a;
    s.board[15].special = b;
    const out = act(s, { type: "merge", cell: 14, other: 15 }, 500);
    expect(out.valid).toBe(true);
    expect(out.run.moves).toBe(s.moves - 1);
    expect(out.run.turns).toBe(1);
  }
  const s = fixture();
  s.board[0].special = "sun";
  s.board[35].special = "sun";
  expect(act(s, { type: "merge", cell: 0, other: 35 }, 100).valid).toBe(false);
});
test("timer bombs decrement only on valid taps, supports do not consume a turn", () => {
  let s = fixture();
  s.board[35] = { id: 1000, color: 2, hazard: "bomb", hp: 1, timer: 2 };
  expect(act(s, { type: "tap", cell: 0 }, 1).valid).toBe(false);
  expect(act(s, { type: "hammer", cell: 1 }, 2).run.turns).toBe(0);
  [0, 1, 2].forEach((i) => (s.board[i].color = 3));
  s = apply(s, 0);
  expect(s.board.find((t) => t.hazard === "bomb")?.timer).toBe(1);
  s.board[0].color = s.board[1].color = s.board[2].color = 3;
  s = apply(s, 0);
  expect(s.status).toBe("lost");
});
test("timed countdown and winning end bonus are settled idempotently", () => {
  const l = structuredClone(LEVELS[32]);
  const timed = createRun(l, 4, { id: "timed" });
  expect(tick(timed, 75).status).toBe("lost");
  let s = createRun(LEVELS[0], 3, { id: "win" });
  s.level.goals = [{ kind: "score", target: 1 }];
  s = apply(s, hint(s)[0]);
  expect(s.status).toBe("won");
  expect(s.bonusMoves).toBe(9);
  const first = settle(defaultSave(), s);
  expect(first.reward).toBeGreaterThanOrEqual(75);
  expect(settle(first.save, s).reward).toBe(0);
});
test("boosters cannot be purchased before unlock, stock caps and unused support refunds", () => {
  let s = defaultSave();
  s.coins = 999;
  expect(buy(s, "hammer")).toBe(s);
  s.stars["8"] = 1;
  s = buy(s, "hammer");
  expect(s.coins).toBe(899);
  expect(s.inventory.hammer).toBe(1);
  s.inventory.hammer = 5;
  expect(buy(s, "hammer")).toBe(s);
  s.inventory.hammer = 2;
  s.inventory.bee = 1;
  const r = createRun(LEVELS[4], 1, { started: ["bee"] });
  s = reserve(s, r, ["bee", "hammer"]);
  r.used.hammer = 1;
  const f = refund(s, r);
  expect(f.inventory.hammer).toBe(1);
  expect(f.inventory.bee).toBe(0);
});
test("chapter gate requires previous boss and sufficient chapter stars", () => {
  const s = defaultSave();
  s.stars["10"] = 3;
  expect(unlocked(s, 11)).toBe(false);
  for (let i = 1; i <= 9; i++) s.stars[i] = 2;
  expect(unlocked(s, 11)).toBe(true);
});
test("daily improved rewards pay only the difference and cannot be farmed", () => {
  const r = createRun(LEVELS[13], 1, {
    mode: "daily",
    id: "daily1",
    companion: "none",
  });
  r.status = "won";
  r.score = 0;
  const a = settle(defaultSave(), r, "2026-10-12");
  expect(a.reward).toBe(50);
  r.id = "daily2";
  expect(settle(a.save, r, "2026-10-12").reward).toBe(0);
  r.id = "daily3";
  r.score = starThresholds(r.level)[1];
  const b = settle(a.save, r, "2026-10-12");
  expect(b.reward).toBe(40);
});

test("drop seeds are unbreakable and reach the bottom through cleared columns", () => {
  const l = structuredClone(LEVELS[22]);
  l.goals = [{ kind: "drop", target: 2 }];
  const s = createRun(l, 8, { id: "drop" });
  const c = s.board.findIndex((t) => t.seed) % l.cols;
  for (let r = 1; r < l.rows; r++)
    s.board[r * l.cols + c] = { id: 1000 + r, color: 0 };
  s.board[l.cols + c].special = "bee_v";
  const out = act(s, { type: "tap", cell: l.cols + c }, 0).run;
  expect(out.progress.drop).toBeGreaterThanOrEqual(1);
  expect(
    out.board.filter((t) => t.seed).length + (out.progress.drop || 0),
  ).toBe(2);
});
test("rescue is counted only when the final protective layer breaks", () => {
  let s = fixture();
  s.board[6] = { id: 100, color: 1, hazard: "cocoon", hp: 2, pet: true };
  [0, 1, 2].forEach((i) => (s.board[i].color = 3));
  s = apply(s, 0);
  expect(s.progress.rescue || 0).toBe(0);
  s.board[0].color = s.board[1].color = s.board[2].color = 3;
  s = apply(s, 0);
  expect(s.progress.rescue).toBe(1);
});
test("normal boss hits are one damage, special hits have the specified damage", () => {
  for (const [special, damage] of [
    ["bee_h", 2],
    ["bloom_bomb", 2],
    ["rainbow_orb", 3],
    ["sun", 3],
  ] as [Special, number][]) {
    const s = fixture();
    s.level.bossHP = 15;
    s.bossHP = 15;
    s.board[14].boss = true;
    s.board[14].color = -1;
    s.board[13].special = special;
    const next = apply(s, 13);
    expect(next.bossHP).toBe(15 - damage);
  }
});
test("gift boxes open from adjacent blasts and combo challenges can finish", () => {
  const s = fixture();
  s.board[6] = { id: 100, color: -1, gift: true };
  [0, 1, 2].forEach((i) => (s.board[i].color = 3));
  const out = apply(s, 0);
  expect(out.progress.gift).toBe(1);
  expect(out.board[6].gift).toBeFalsy();
  const combo = fixture();
  combo.level.goals = [{ kind: "combo", target: 2 }];
  [0, 1, 2].forEach((i) => (combo.board[i].color = 3));
  let r = act(combo, { type: "tap", cell: 0 }, 0).run;
  r.board[0].color = r.board[1].color = r.board[2].color = 3;
  r = act(r, { type: "tap", cell: 0 }, 1000).run;
  expect(r.status).toBe("won");
  expect(r.maxCombo).toBe(2);
});

test("portals transport seeds, specials and timed bombs only into a vacant output", () => {
  for (const payload of [
    { seed: true, color: -1 },
    { special: "sun" as Special, color: 2 },
    { hazard: "bomb" as const, hp: 1, timer: 9, color: 2 },
  ]) {
    const s = fixture(),
      w = s.level.cols,
      entry = 1,
      exit = 2 * w + 3;
    s.portals = [entry, exit];
    for (let c = 0; c < w; c++) {
      s.board[w + c].color = 0;
      s.board[s.board.length - w + c].color = 1;
    }
    s.board[entry] = { id: 99001, ...payload };
    const out = act(s, { type: "hammer", cell: exit }, 3000).run;
    expect(out.portalMoves).toContainEqual({
      id: 99001,
      from: entry,
      to: exit,
    });
    expect(out.board[exit]).toMatchObject({ id: 99001, ...payload });
    expect(out.board.every((t) => t.color !== -2)).toBe(true);
    expect(out.effects.filter((e) => e.type === "portal")).toHaveLength(2);
  }
  const s = fixture(),
    w = s.level.cols;
  for (let c = 0; c < w; c++) {
    s.board[w + c].color = 0;
    s.board[s.board.length - w + c].color = 1;
  }
  s.portals = [1, 2 * w + 3];
  s.board[1] = { id: 99001, color: 1, special: "sun" };
  const outputId = s.board[s.portals[1]].id;
  const out = act(s, { type: "hammer", cell: 2 * w }, 3000).run;
  expect(out.portalMoves).toEqual([]);
  expect(out.board[1].id).toBe(99001);
  expect(out.board[s.portals[1]].id).toBe(outputId);
});
test("fog stays at board positions through falling and can be revealed by Owl or hammer", () => {
  const s = fixture(),
    w = s.level.cols,
    cell = w + 1;
  s.board[cell].fog = true;
  const out = act(s, { type: "hammer", cell: 3 * w + 1 }, 3000).run;
  expect(out.board[cell].fog).toBe(true);
  expect(out.board.filter((t) => hasHazard(t, "fog"))).toHaveLength(1);
  const owl = revealFog(out);
  expect(owl.board[cell].fog).toBeUndefined();
  expect(owl.progress.fog).toBe(1);
  const hit = act(out, { type: "hammer", cell }, 4000).run;
  expect(hit.progress.fog).toBe(1);
  expect(hit.board[cell].fog).toBeUndefined();
});
test("final boss uses all three hazard families per phase and fog boss creates a square patch", () => {
  for (const [chapter, phase, kinds] of [
    [10, 1, ["weed", "rock", "cocoon"]],
    [10, 2, ["vine", "bug", "honey"]],
    [10, 3, ["ice", "fog", "bomb"]],
    [8, 1, ["fog"]],
  ] as const) {
    const s = fixture();
    s.level.chapter = chapter;
    s.level.bossHP = 100;
    s.bossHP = phase === 1 ? 100 : phase === 2 ? 60 : 30;
    s.phase = phase;
    s.turns = 3;
    [0, 1, 2].forEach((i) => (s.board[i].color = 3));
    const out = apply(s, 0);
    for (const kind of kinds)
      expect(
        out.board.some((t) => hasHazard(t, kind)),
        `${chapter}/${phase}/${kind}`,
      ).toBe(true);
    expect(out.board.filter((t) => hasHazard(t)).length).toBeLessThanOrEqual(
      Math.floor(out.board.length * 0.35),
    );
    if (kinds.includes("fog" as never)) {
      const cells = out.board
          .map((t, i) => (hasHazard(t, "fog") ? i : -1))
          .filter((i) => i >= 0),
        first = cells[0],
        w = s.level.cols;
      expect(cells).toEqual([first, first + 1, first + w, first + w + 1]);
    }
  }
});

test("boss and daily constructors lock companions even when Turtle is requested", () => {
  for (const level of LEVELS.filter((l) => l.bossHP))
    expect(createRun(level, 9, { companion: "turtle" }).companion).toBe("none");
  expect(
    createRun(LEVELS[4], 9, { mode: "daily", companion: "owl" }).companion,
  ).toBe("none");
  expect(createRun(LEVELS[4], 9, { companion: "owl" }).companion).toBe("owl");
});

test("Owl reveals fog without damaging the underlying bomb or special", () => {
  const s = fixture();
  s.board[0] = {
    id: 99001,
    color: 1,
    hazard: "bomb",
    hp: 1,
    timer: 9,
    fog: true,
  };
  s.board[1] = { id: 99002, color: 2, special: "sun", fog: true };
  const out = revealFog(s);
  expect(out.board[0]).toEqual({
    id: 99001,
    color: 1,
    hazard: "bomb",
    hp: 1,
    timer: 9,
  });
  expect(out.board[1]).toEqual({ id: 99002, color: 2, special: "sun" });
  expect(out.progress.fog).toBe(2);
  expect(out.progress.bomb || 0).toBe(0);
});

test("all seed corridors stay clear at creation, without relocating rocks into another seed path", () => {
  for (const l of LEVELS.filter((l) => l.seeds))
    for (let seed = 1; seed <= 100; seed++) {
      const s = createRun(l, seed, { companion: "none" });
      const cols = s.board
        .map((t, i) => (t.seed ? i % l.cols : -1))
        .filter((i) => i >= 0);
      expect(cols).toHaveLength(l.seeds);
      for (const col of cols)
        for (let r = 1; r < l.rows; r++)
          expect(
            hasHazard(s.board[r * l.cols + col]),
            `L${l.id} seed${seed} row${r} col${col}`,
          ).toBe(false);
    }
});
