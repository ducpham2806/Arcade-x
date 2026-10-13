import { Action, Goal, Hazard, Level, Run, Special, Tile } from "./types";
import fallbackSeeds from "./fallback-seeds.json" with { type: "json" };
export const key = (g: Goal) =>
  g.kind === "collect" ? `collect:${g.color}` : g.kind;
export function hashSeed(text: string): number {
  let n = 2166136261;
  for (const c of text) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return n >>> 0 || 1;
}
function random(s: Run): number {
  let n = s.rng;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  s.rng = n >>> 0 || 1;
  return s.rng / 4294967296;
}
function pick(s: Run, a: number[]): number {
  return a[Math.floor(random(s) * a.length)];
}
export function neighbors(s: Run, i: number): number[] {
  const c = i % s.level.cols,
    r = Math.floor(i / s.level.cols);
  return [
    c ? i - 1 : -1,
    c < s.level.cols - 1 ? i + 1 : -1,
    r ? i - s.level.cols : -1,
    r < s.level.rows - 1 ? i + s.level.cols : -1,
  ].filter((x) => x >= 0);
}
export const fixed = (t: Tile) =>
  !!(
    t.gift ||
    t.boss ||
    ["weed", "rock", "honey", "vine", "cocoon", "ice"].includes(t.hazard || "")
  );
export const tappable = (t: Tile) =>
  t.color >= 0 &&
  !t.gift &&
  !t.seed &&
  !t.boss &&
  !["weed", "rock", "honey", "vine", "cocoon", "ice"].includes(t.hazard || "");
export function group(s: Run, cell: number): number[] {
  const t = s.board[cell];
  if (!t || !tappable(t) || t.special) return [];
  const q = [cell],
    seen = new Set(q);
  for (let a = 0; a < q.length; a++)
    for (const n of neighbors(s, q[a])) {
      const x = s.board[n];
      if (!seen.has(n) && tappable(x) && !x.special && x.color === t.color) {
        seen.add(n);
        q.push(n);
      }
    }
  return q;
}
export function groups(s: Run): number[][] {
  const seen = new Set<number>(),
    out: number[][] = [];
  for (let i = 0; i < s.board.length; i++) {
    if (seen.has(i)) continue;
    const g = group(s, i);
    g.forEach((n) => seen.add(n));
    if (g.length >= 3) out.push(g);
  }
  return out;
}
function fresh(s: Run, i: number): Tile {
  const fertilizer = s.started.includes("fertilizer") && s.turns < 10 ? 0.3 : 0;
  const weights = Array.from(
    { length: s.level.colors },
    (_, c) =>
      1 +
      (s.level.beta + fertilizer) *
        neighbors(s, i)
          .filter((n) => n === i - 1 || n === i + 1 || n === i + s.level.cols)
          .filter((n) => s.board[n]?.color === c).length,
  );
  // Collect targets receive a small supply floor; never removes player-made groups.
  const goals = s.level.goals.filter(
    (g) => g.kind === "collect" && (s.progress[key(g)] || 0) < g.target,
  );
  for (const g of goals) weights[g.color!] += 0.15;
  let roll = random(s) * weights.reduce((a, b) => a + b, 0),
    color = weights.length - 1;
  for (let c = 0; c < weights.length; c++) {
    roll -= weights[c];
    if (roll < 0) {
      color = c;
      break;
    }
  }
  return { id: s.nextId++, color };
}
function addProgress(s: Run, k: string, n = 1) {
  s.progress[k] = (s.progress[k] || 0) + n;
}
function shuffled(s: Run, indices: number[]): number[] {
  return indices
    .map((i) => ({ i, n: random(s) }))
    .sort((a, b) => a.n - b.n)
    .map((x) => x.i);
}
function repair(
  s: Run,
  target: number,
  limit = 100,
  eligible?: Set<number>,
): boolean {
  let count = groups(s).length,
    changed = 0;
  if (count >= target) return true;
  const cellsOrder = shuffled(
    s,
    s.board.map((_, i) => i),
  );
  for (let pass = 0; pass < target; pass++) {
    let improved = false;
    outer: for (const i of cellsOrder)
      for (const cells of [
        [i, i + 1, i + 2],
        [i, i + s.level.cols, i + 2 * s.level.cols],
      ]) {
        if (
          cells.some(
            (n) => !s.board[n] || !tappable(s.board[n]) || s.board[n].special,
          ) ||
          (cells[1] === i + 1 &&
            Math.floor(i / s.level.cols) !==
              Math.floor(cells[2] / s.level.cols))
        )
          continue;
        for (let color = 0; color < s.level.colors; color++) {
          const need = cells.filter((n) => s.board[n].color !== color);
          if (
            !need.length ||
            changed + need.length > limit ||
            (eligible && need.some((n) => !eligible.has(n)))
          )
            continue;
          const before = need.map((n) => s.board[n].color);
          need.forEach((n) => (s.board[n].color = color));
          const collect = s.level.goals.find(
            (g) => g.kind === "collect" && g.color === color,
          );
          if (
            collect &&
            s.level.goals.length === 1 &&
            group(s, cells[0]).length >= collect.target
          ) {
            need.forEach((n, k) => (s.board[n].color = before[k]));
            continue;
          }
          const after = groups(s).length;
          if (after > count) {
            count = after;
            changed += need.length;
            s.changed.push(...need);
            improved = true;
            if (count >= target) return true;
            break outer;
          }
          need.forEach((n, k) => (s.board[n].color = before[k]));
        }
      }
    if (!improved) break;
  }
  return count >= target;
}
export function createRun(
  level: Level,
  seed: number,
  options: Partial<
    Pick<Run, "id" | "mode" | "companion" | "started" | "dailyDate">
  > = {},
): Run {
  const s: Run = {
    version: 1,
    id: options.id || `${seed}-${Date.now()}`,
    level: structuredClone(level),
    board: [],
    rng: seed >>> 0 || 1,
    initialSeed: seed >>> 0 || 1,
    nextId: 1,
    score: 0,
    moves: level.moves,
    seconds: level.seconds,
    turns: 0,
    combo: 0,
    maxCombo: 0,
    lastTap: -Infinity,
    progress: {},
    bossHP: level.bossHP,
    phase: 1,
    status: "playing",
    freeShuffles: 0,
    effects: [],
    changed: [],
    log: [],
    companion:
      level.bossHP || options.mode === "daily"
        ? "none"
        : options.companion || "bibi",
    companionUsed: false,
    portals: [],
    used: {},
    started: options.started || [],
    bonusMoves: 0,
    mode: options.mode || "campaign",
    dailyDate: options.dailyDate,
  };
  for (let i = 0; i < level.rows * level.cols; i++) s.board.push(fresh(s, i));
  if (level.bossHP) {
    const h = Math.ceil(level.rows / 2),
      w = Math.ceil(level.cols / 2);
    for (let r = 1; r <= h; r++)
      for (
        let c = Math.floor((level.cols - w) / 2);
        c < Math.floor((level.cols - w) / 2) + w;
        c++
      ) {
        const i = r * level.cols + c;
        s.board[i] = { id: s.nextId++, color: -1, boss: true };
      }
  }
  // Reserve every seed corridor together: relocating into another seed column can trap a later seed.
  const seedColumns = Array.from({ length: level.seeds }, (_, k) =>
    Math.floor(((k + 1) * level.cols) / (level.seeds + 1)),
  );
  let space = shuffled(
    s,
    s.board
      .map((_, i) => i)
      .filter(
        (i) =>
          !s.board[i].boss &&
          !seedColumns.includes(i % level.cols) &&
          !(
            level.seedRoutes &&
            Math.floor(i / level.cols) === level.rows - 1 &&
            seedColumns.some((c) => i % level.cols === c + 1)
          ),
      ),
  );
  const cap = Math.floor(s.board.length * 0.35);
  let placed = 0;
  for (const spec of level.hazards) {
    const typeCap =
      spec.kind === "bug"
        ? 5
        : spec.kind === "bomb"
          ? 3
          : spec.kind === "rock"
            ? Math.floor(s.board.length * 0.2)
            : spec.kind === "vine"
              ? Math.floor(s.board.length * 0.25)
              : cap;
    const count = Math.min(spec.count, typeCap, cap - placed);
    if (spec.kind === "fog") {
      const side = count >= 9 ? 3 : 2,
        regions = shuffled(
          s,
          s.board
            .map((_, i) => i)
            .filter(
              (i) =>
                i % level.cols <= level.cols - side &&
                Math.floor(i / level.cols) <= level.rows - side,
            ),
        );
      const origin = regions.find((i) =>
        Array.from(
          { length: side * side },
          (_, k) => i + Math.floor(k / side) * level.cols + (k % side),
        ).every((n) => !s.board[n].hazard && !s.board[n].boss),
      );
      if (origin !== undefined) {
        for (let k = 0; k < count; k++) {
          const i = origin + Math.floor(k / side) * level.cols + (k % side);
          s.board[i].hazard = "fog";
          s.board[i].hp = 1;
          space = space.filter((n) => n !== i);
          placed++;
        }
        continue;
      }
    }
    for (let k = 0; k < count; k++) {
      const i = space.shift();
      if (i === undefined) break;
      const t = s.board[i];
      t.hazard = spec.kind;
      t.hp = spec.hp;
      if (["weed", "rock", "honey", "vine"].includes(spec.kind)) t.color = -1;
      if (spec.kind === "bomb") t.timer = level.id === 52 ? 8 : 10;
      if (
        spec.kind === "cocoon" &&
        level.goals.some((g) => g.kind === "rescue")
      )
        t.pet = true;
      placed++;
    }
  }
  for (const c of seedColumns) {
    s.board[c] = { id: s.nextId++, color: -1, seed: true };
  }
  if (level.seedRoutes) {
    // Hand-authored color steps teach planning a path; adjacent columns stay distinct.
    seedColumns.forEach((col, k) => {
      for (let row = 1; row < level.rows; row++)
        s.board[row * level.cols + col].color =
          (k + 2 * Math.floor((row - 1) / 4)) % level.colors;
      const color = s.board[(level.rows - 1) * level.cols + col].color;
      s.board[(level.rows - 1) * level.cols + col + 1].color = color;
    });
  }
  for (const preset of level.startingSpecials || [])
    if (tappable(s.board[preset.cell]))
      s.board[preset.cell].special = preset.special;
  const gifts = level.goals.find((g) => g.kind === "gift")?.target || 0;
  for (let n = 0; n < gifts; n++) {
    const i = space.shift();
    if (i !== undefined) s.board[i] = { id: s.nextId++, color: -1, gift: true };
  }
  if (level.portals) {
    s.portals = [
      level.cols + 1,
      (level.rows - 2) * level.cols + level.cols - 2,
    ];
    for (const i of s.portals) if (fixed(s.board[i])) s.board[i] = fresh(s, i);
  }
  // Ensure actual clear-goal inventory survives topology placement.
  for (const g of level.goals.filter((g) =>
    [
      "weed",
      "rock",
      "cocoon",
      "ice",
      "vine",
      "bug",
      "bomb",
      "honey",
      "fog",
    ].includes(g.kind),
  )) {
    let have = s.board.filter((t) => t.hazard === g.kind).length;
    for (const i of space) {
      if (have >= g.target) break;
      if (
        s.board[i].hazard ||
        s.board[i].seed ||
        s.board[i].boss ||
        s.portals.includes(i)
      )
        continue;
      s.board[i] = {
        ...s.board[i],
        hazard: g.kind as Hazard,
        hp: level.hazards.find((h) => h.kind === g.kind)?.hp || 1,
        ...(["weed", "rock", "vine", "honey"].includes(g.kind)
          ? { color: -1 }
          : {}),
        ...(g.kind === "bomb" ? { timer: 10 } : {}),
      };
      have++;
    }
  }
  const collection = level.goals.filter((g) => g.kind === "collect");
  if (collection.length === 1) {
    const g = collection[0],
      strip = Math.max(1, Math.floor((g.target - 1) / level.rows));
    const available = s.board
      .map((t, i) => (t.color >= 0 && !t.hazard && !t.special ? i : -1))
      .filter((i) => i >= 0);
    const stock = shuffled(
      s,
      available.filter((i) => ((i % level.cols) + 1) % (strip + 1) !== 0),
    );
    const desired = Math.min(
      Math.ceil(g.target * (level.initialCollectSupply ?? 1.5)),
      stock.length,
    );
    available.forEach((i) => {
      if (s.board[i].color === g.color)
        s.board[i].color =
          (g.color! + 1 + Math.floor(random(s) * (level.colors - 1))) %
          level.colors;
    });
    stock.slice(0, desired).forEach((i) => (s.board[i].color = g.color!));
  } else if (collection.length > 1) {
    const available = shuffled(
        s,
        s.board
          .map((t, i) => (t.color >= 0 && !t.hazard && !t.special ? i : -1))
          .filter((i) => i >= 0),
      ),
      demand = collection.reduce(
        (sum, g) =>
          sum + Math.ceil(g.target * (level.initialCollectSupply ?? 1.5)),
        0,
      );
    let offset = 0;
    for (const g of collection) {
      const count = Math.min(
        available.length - offset,
        Math.floor(
          (Math.min(available.length, demand) *
            Math.ceil(g.target * (level.initialCollectSupply ?? 1.5))) /
            demand,
        ),
      );
      available
        .slice(offset, offset + count)
        .forEach((i) => (s.board[i].color = g.color!));
      offset += count;
    }
  }
  for (const b of s.started) {
    if (["bee", "bomb", "rainbow"].includes(b)) {
      const i = space.find((i) => tappable(s.board[i]) && !s.board[i].special);
      if (i !== undefined)
        s.board[i].special =
          b === "bee" ? "bee_h" : b === "bomb" ? "bloom_bomb" : "rainbow_orb";
    }
    if (b === "moves") {
      if (level.seconds) s.seconds += 10;
      else s.moves += 5;
    }
  }
  if (s.companion === "bunny" && level.seconds) s.seconds += 3;
  repair(s, 3);
  s.changed = [];
  return s;
}
export function targetColor(s: Run): number {
  const unmet = s.level.goals.filter(
    (g) => g.kind === "collect" && (s.progress[key(g)] || 0) < g.target,
  );
  if (unmet.length)
    return unmet.sort(
      (a, b) =>
        b.target -
        (s.progress[key(b)] || 0) -
        (a.target - (s.progress[key(a)] || 0)),
    )[0].color!;
  const counts = Array.from(
    { length: s.level.colors },
    (_, c) => s.board.filter((t) => t.color === c && !t.boss).length,
  );
  return counts.indexOf(Math.max(...counts));
}
export function area(s: Run, i: number, special: Special, scale = 1): number[] {
  const row = Math.floor(i / s.level.cols),
    col = i % s.level.cols,
    color = targetColor(s);
  return s.board
    .map((_, n) => n)
    .filter((n) => {
      const r = Math.floor(n / s.level.cols),
        c = n % s.level.cols;
      switch (special) {
        case "bee_h":
          return Math.abs(r - row) < scale;
        case "bee_v":
          return Math.abs(c - col) < scale;
        case "bloom_bomb":
          return (
            Math.abs(r - row) <= 2 * scale && Math.abs(c - col) <= 2 * scale
          );
        case "rainbow_orb":
          return s.board[n].color === color;
        case "sun":
          return Math.abs(r - row) <= scale || Math.abs(c - col) <= scale;
      }
    });
}
function bossHit(s: Run, damage: number, cells: number[]) {
  if (
    s.bossHP <= 0 ||
    !cells.some(
      (i) => s.board[i]?.boss || neighbors(s, i).some((n) => s.board[n].boss),
    )
  )
    return;
  s.bossHP = Math.max(0, s.bossHP - damage);
  addProgress(s, "boss", damage);
  const phases = s.level.id === 100 ? 3 : s.level.id === 60 ? 2 : 1;
  s.phase = Math.min(
    phases,
    1 + Math.floor(((s.level.bossHP - s.bossHP) * phases) / s.level.bossHP),
  );
  if (!s.bossHP)
    s.board.forEach((t, i) => {
      if (t.boss) {
        s.board[i] = { id: s.nextId++, color: -2 };
        s.changed.push(i);
      }
    });
}
function openGift(s: Run, i: number): boolean {
  if (!s.board[i]?.gift) return false;
  addProgress(s, "gift");
  const result = Math.floor(random(s) * 3);
  s.board[i] = fresh(s, i);
  if (result === 0)
    s.board[i].special = random(s) < 0.5 ? "bee_h" : "bloom_bomb";
  else if (result === 1) addProgress(s, "giftCoins", 20);
  else s.moves += 2;
  s.changed.push(i);
  s.effects.push({ cell: i, type: "merge" });
  return true;
}
function hazardHit(s: Run, i: number): boolean {
  if (openGift(s, i)) return true;
  const t = s.board[i];
  if (!t) return false;
  let revealed = false;
  if (t.fog) {
    delete t.fog;
    addProgress(s, "fog");
    s.changed.push(i);
    revealed = true;
  }
  if (!t.hazard) return revealed;
  const kind = t.hazard;
  t.hp = (t.hp || 1) - 1;
  s.changed.push(i);
  if (t.hp <= 0) {
    addProgress(s, kind);
    if (t.pet) {
      addProgress(s, "rescue");
      t.pet = false;
    }
    delete t.hazard;
    delete t.hp;
    delete t.timer;
    if (t.color < 0) t.color = -2;
  }
  return true;
}
export const hasHazard = (t: Tile, kind?: Hazard) =>
  kind
    ? kind === "fog"
      ? t.hazard === "fog" || !!t.fog
      : t.hazard === kind
    : !!(t.hazard || t.fog);
function gravity(s: Run) {
  const fog = s.board
    .map((t, i) => (hasHazard(t, "fog") ? i : -1))
    .filter((i) => i >= 0);
  for (const i of fog) {
    const t = s.board[i];
    delete t.fog;
    if (t.hazard === "fog") {
      delete t.hazard;
      delete t.hp;
    }
  }
  if (s.portals.length) portalGravity(s);
  else ordinaryGravity(s);
  for (const i of fog) if (!s.board[i].boss) s.board[i].fog = true;
}
function portalGravity(s: Run) {
  const [entry, exit] = s.portals,
    w = s.level.cols,
    h = s.level.rows,
    transported = new Set<number>();
  s.portalMoves = [];
  for (let pass = 0; pass <= s.board.length; pass++) {
    let changed = false;
    for (let i = s.board.length - 1; i >= 0; i--) {
      if (s.board[i].color !== -2 || fixed(s.board[i])) continue;
      let from = i >= w ? i - w : -1;
      if (
        i === exit &&
        s.board[entry].color !== -2 &&
        !fixed(s.board[entry]) &&
        !transported.has(s.board[entry].id)
      )
        from = entry;
      if (from >= 0 && s.board[from].color === -2) continue;
      if (from < 0 || fixed(s.board[from])) {
        s.board[i] = fresh(s, i);
        s.changed.push(i);
        changed = true;
        continue;
      }
      const t = s.board[from];
      s.board[i] = t;
      s.board[from] = { id: s.nextId++, color: -2 };
      s.changed.push(i, from);
      changed = true;
      if (i === exit && from === entry) {
        transported.add(t.id);
        s.portalMoves.push({ id: t.id, from, to: i });
        s.effects.push(
          { cell: entry, type: "portal" },
          { cell: exit, type: "portal" },
        );
      }
    }
    let dropped = false;
    for (let c = 0; c < w; c++) {
      const i = (h - 1) * w + c;
      if (s.board[i].seed) {
        addProgress(s, "drop");
        s.board[i] = { id: s.nextId++, color: -2 };
        s.changed.push(i);
        dropped = changed = true;
      }
    }
    if (!s.board.some((t) => t.color === -2)) return;
    if (!changed && !dropped)
      throw new Error("Portal graph has an unreachable vacancy.");
  }
  throw new Error("Portal settling exceeded its finite board bound.");
}
function ordinaryGravity(s: Run) {
  const w = s.level.cols,
    h = s.level.rows;
  for (let c = 0; c < w; c++) {
    let end = h - 1;
    while (end >= 0) {
      if (fixed(s.board[end * w + c])) {
        end--;
        continue;
      }
      let start = end;
      while (start > 0 && !fixed(s.board[(start - 1) * w + c])) start--;
      const items: Tile[] = [];
      for (let r = end; r >= start; r--) {
        const t = s.board[r * w + c];
        if (t.color !== -2) items.push(t);
      }
      let a = 0;
      for (let r = end; r >= start; r--) {
        const i = r * w + c,
          old = s.board[i];
        const t = items[a++] || fresh(s, i);
        s.board[i] = t;
        if (old.id !== t.id) s.changed.push(i);
      }
      end = start - 1;
    }
  }
  let dropped = false;
  for (let c = 0; c < w; c++) {
    const i = (h - 1) * w + c;
    if (s.board[i].seed) {
      addProgress(s, "drop");
      s.board[i] = { id: s.nextId++, color: -2 };
      s.changed.push(i);
      dropped = true;
    }
  }
  if (dropped) ordinaryGravity(s);
}
function shuffle(s: Run, free: boolean) {
  const indices = s.board
    .map((_, i) => i)
    .filter((i) => tappable(s.board[i]) && !hasHazard(s.board[i]));
  const values = shuffled(s, indices).map((i) => s.board[i]);
  indices.forEach((i, k) => {
    s.board[i] = values[k];
    s.changed.push(i);
  });
  if (free) s.freeShuffles++;
  if (!repair(s, 2) || s.freeShuffles > 3) {
    s.status = "lost";
    s.reason = "Bàn không còn nước đi sau 3 lần trộn miễn phí.";
  }
}
function ensurePlayable(s: Run, spawned: Set<number>) {
  if (groups(s).length >= 2) return;
  if (repair(s, 2, 2, spawned)) return;
  shuffle(s, true);
}
function evolve(s: Run) {
  for (let i = 0; i < s.board.length; i++) {
    const t = s.board[i];
    if (t.hazard === "bomb") {
      t.timer = (t.timer || 0) - 1;
      if (t.timer <= 0) {
        s.status = "lost";
        s.reason = "Bom hẹn giờ đã hết lượt.";
      }
    }
  }
  const bugs = s.board
    .map((t, i) => (t.hazard === "bug" ? i : -1))
    .filter((i) => i >= 0);
  for (const i of bugs) {
    const to = neighbors(s, i).filter(
      (n) =>
        tappable(s.board[n]) &&
        !hasHazard(s.board[n]) &&
        !s.board[n].special &&
        !s.board[n].seed,
    );
    if (!to.length) continue;
    const n = pick(s, to);
    s.board[i].hazard = undefined;
    s.board[i].hp = undefined;
    s.board[n] = {
      id: s.nextId++,
      color: s.board[n].color,
      hazard: "bug",
      hp: 1,
    };
    s.changed.push(i, n);
  }
  if (s.turns % 3 === 0) {
    const vines = s.board
      .map((t, i) => (t.hazard === "vine" ? i : -1))
      .filter((i) => i >= 0);
    if (vines.length < Math.floor(s.board.length * 0.25)) {
      const edges = [...new Set(vines.flatMap((i) => neighbors(s, i)))].filter(
        (i) =>
          tappable(s.board[i]) && !hasHazard(s.board[i]) && !s.board[i].special,
      );
      if (edges.length) addHazard(s, pick(s, edges), "vine");
    }
  }
  if (s.bossHP > 0 && s.turns % (s.level.chapter === 3 ? 5 : 4) === 0) {
    if (s.level.chapter === 3) {
      for (let c = 0; c < s.level.cols; c++) {
        const indices = s.board
          .map((t, i) =>
            i % s.level.cols === c && tappable(t) && !hasHazard(t) ? i : -1,
          )
          .filter((i) => i >= 0);
        const values = shuffled(s, indices).map((i) => s.board[i]);
        indices.forEach((i, k) => {
          s.board[i] = values[k];
          s.changed.push(i);
        });
      }
      return;
    }
    const palettes: Record<number, Hazard[]> = {
      1: ["weed"],
      2: ["weed"],
      4: ["vine"],
      5: ["bug"],
      6: s.phase === 2 ? ["bomb", "rock"] : ["rock"],
      7: ["ice"],
      8: ["fog"],
      9: ["cocoon"],
      10:
        s.phase === 1
          ? ["weed", "rock", "cocoon"]
          : s.phase === 2
            ? ["vine", "bug", "honey"]
            : ["ice", "fog", "bomb"],
    };
    for (const hazard of palettes[s.level.chapter] || ["weed"]) {
      if (hazard === "fog") {
        spawnFog(s, 2);
        continue;
      }
      const candidates = s.board
        .map((t, i) =>
          tappable(t) &&
          !hasHazard(t) &&
          !t.special &&
          !t.seed &&
          !s.portals.includes(i)
            ? i
            : -1,
        )
        .filter((i) => i >= 0);
      const ordered = shuffled(s, candidates).sort(
        (a, b) =>
          Number(neighbors(s, b).some((n) => s.board[n].boss)) -
          Number(neighbors(s, a).some((n) => s.board[n].boss)),
      );
      const quota = s.level.chapter === 10 ? 1 : 2;
      for (const i of ordered.slice(0, quota)) addHazard(s, i, hazard);
    }
  }
}
function addHazard(s: Run, i: number, hazard: Hazard) {
  const count = s.board.filter((t) => hasHazard(t)).length,
    type = s.board.filter((t) => hasHazard(t, hazard)).length;
  if (
    count >= Math.floor(s.board.length * 0.35) ||
    type >=
      (hazard === "bug"
        ? 5
        : hazard === "bomb"
          ? 3
          : hazard === "vine"
            ? Math.floor(s.board.length * 0.25)
            : hazard === "rock"
              ? Math.floor(s.board.length * 0.2)
              : s.board.length)
  )
    return;
  const t = s.board[i];
  if (t.seed || t.special || t.boss || t.gift || s.portals.includes(i)) return;
  if (hazard === "fog") {
    t.fog = true;
    s.changed.push(i);
    return;
  }
  t.hazard = hazard;
  t.hp = 1;
  if (hazard === "bomb") t.timer = 10;
  if (["weed", "rock", "vine", "honey"].includes(hazard)) t.color = -1;
  s.changed.push(i);
}
export function goalsMet(s: Run): boolean {
  return s.level.goals.every((g) =>
    g.kind === "score"
      ? s.score >= g.target
      : g.kind === "combo"
        ? s.maxCombo >= g.target
        : g.kind === "boss"
          ? s.bossHP === 0
          : (s.progress[key(g)] || 0) >= g.target,
  );
}
function explosion(
  s: Run,
  initial: {
    cell: number;
    special: Special;
    scale?: number;
    custom?: number[];
  }[],
  mult: number,
) {
  const queue = [...initial],
    activated = new Set<number>(),
    removed = new Set<number>();
  let chain = 0;
  for (let q = 0; q < queue.length; q++) {
    const a = queue[q];
    if (activated.has(a.cell)) continue;
    activated.add(a.cell);
    chain++;
    const cells = a.custom || area(s, a.cell, a.special, a.scale || 1);
    if (!cells.includes(a.cell)) cells.push(a.cell);
    const colors = [...new Set(cells.filter(i => i !== a.cell && s.board[i]?.color >= 0 && !s.board[i].seed && !s.board[i].boss).map(i => s.board[i].color))];
    s.effects.push({ cell: a.cell, type: a.special,
      color: a.special === "rainbow_orb" ? (colors.length === 1 ? colors[0] : a.custom ? undefined : targetColor(s)) : undefined,
      cells: [...cells],
      targets: cells.filter(i => s.board[i]?.color >= 0 && !s.board[i].seed && !s.board[i].boss)
        .map(i => ({ cell: i, color: s.board[i].color })),
    });
    bossHit(
      s,
      a.special === "rainbow_orb" || a.special === "sun" ? 3 : 2,
      cells,
    );
    const hit = new Set<number>();
    for (const i of cells) {
      const t = s.board[i];
      if (!t || t.boss) continue;
      if (t.seed) {
        if (hasHazard(t, "fog")) hazardHit(s, i);
        continue;
      }
      if (openGift(s, i)) continue;
      if (t.special && !activated.has(i))
        queue.push({ cell: i, special: t.special });
      if (hasHazard(t) && !hit.has(i)) {
        hit.add(i);
        hazardHit(s, i);
        if (t.hazard) continue;
      }
      if (t.color >= 0 && !removed.has(i)) {
        removed.add(i);
        addProgress(s, `collect:${t.color}`);
        s.board[i] = { id: s.nextId++, color: -2 };
        s.changed.push(i);
      }
    }
  }
  s.score += Math.round(
    15 * removed.size * mult * (1 + 0.25 * Math.max(0, chain - 1)),
  );
}
function normalBlast(s: Run, cells: number[], cell: number, mult: number) {
  const color = s.board[cell].color,
    n = cells.length,
    rs = cells.map((i) => Math.floor(i / s.level.cols)),
    cs = cells.map((i) => i % s.level.cols);
  const special: Special | undefined =
    n >= 11
      ? "sun"
      : n >= 9
        ? "rainbow_orb"
        : n >= 7
          ? "bloom_bomb"
          : n >= 5
            ? Math.max(...cs) - Math.min(...cs) >=
              Math.max(...rs) - Math.min(...rs)
              ? "bee_h"
              : "bee_v"
            : undefined;
  const adjacent = new Set(
    cells.flatMap((i) => neighbors(s, i)).filter((i) => !cells.includes(i)),
  );
  cells.forEach((i) => {
    const t = s.board[i];
    if (hasHazard(t)) hazardHit(s, i);
    addProgress(s, `collect:${color}`);
    s.effects.push({ cell: i, type: "pop", color });
    s.board[i] = { id: s.nextId++, color: -2 };
    s.changed.push(i);
  });
  adjacent.forEach((i) => hazardHit(s, i));
  bossHit(s, 1, cells);
  if (special) s.board[cell] = { id: s.nextId++, color, special };
  s.score += Math.round(10 * n * (1 + 0.1 * (n - 3)) * mult);
}
function merge(s: Run, a: number, b: number, mult: number) {
  s.effects.push({ cell: a, type: "merge" });
  const first = s.board[a].special!,
    second = s.board[b].special!;
  s.board[b].special = undefined;
  let factor = 2,
    custom: number[] | undefined,
    scale = 1,
    special = first;
  const bee = (v: Special) => v === "bee_h" || v === "bee_v";
  if (first === "sun" || second === "sun") {
    factor = 3;
    special = first === "sun" ? second : first;
    scale = 2;
    if (special === "rainbow_orb") custom = s.board.map((_, i) => i);
  } else if (first === "rainbow_orb" && second === "rainbow_orb") {
    factor = 5;
    custom = s.board.map((_, i) => i);
  } else if (first === "rainbow_orb" || second === "rainbow_orb") {
    const other = first === "rainbow_orb" ? second : first,
      color = targetColor(s);
    factor = bee(other) ? 4 : 5;
    const cells = s.board
      .map((t, i) =>
        t.color === color && !t.seed && !t.boss && !fixed(t) ? i : -1,
      )
      .filter((i) => i >= 0);
    cells.forEach(
      (i, k) =>
        (s.board[i].special = bee(other)
          ? k % 2
            ? "bee_v"
            : "bee_h"
          : "bloom_bomb"),
    );
    explosion(
      s,
      [
        { cell: a, special: first, custom: [a, b] },
        ...cells.map((i) => ({ cell: i, special: s.board[i].special! })),
      ],
      mult * factor,
    );
    return;
  } else if (first === "bloom_bomb" && second === "bloom_bomb") {
    factor = 4;
    special = "bloom_bomb";
    scale = 2;
  } else if (bee(first) && bee(second)) {
    factor = 2;
    custom = [...new Set([...area(s, a, "bee_h"), ...area(s, a, "bee_v")])];
  } else {
    factor = 3;
    special = "sun";
  }
  explosion(s, [{ cell: a, special, scale, custom }], mult * factor);
}
function finish(s: Run) {
  if (s.status !== "playing") return;
  if (goalsMet(s)) {
    s.completion = {
      score: s.score,
      progress: { ...s.progress },
      remainingMoves: s.moves,
    };
    s.bonusMoves = s.level.seconds ? 0 : Math.max(0, s.moves);
    const bonuses = s.bonusMoves;
    for (let n = 0; n < bonuses; n++) {
      const indices = s.board
        .map((t, i) => (tappable(t) ? i : -1))
        .filter((i) => i >= 0);
      if (!indices.length) break;
      const effectStart = s.effects.length;
      explosion(
        s,
        [{ cell: pick(s, indices), special: n % 2 ? "bloom_bomb" : "bee_h" }],
        1,
      );
      for (const effect of s.effects.slice(effectStart)) effect.bonusIndex = n + 1;
      s.score += 50;
      gravity(s);
    }
    s.moves = 0;
    s.status = "won";
    return;
  }
  if (!s.level.seconds && s.moves <= 0) {
    s.status = "lost";
    s.reason = "Đã dùng hết lượt. Bạn có thể thử lại miễn phí.";
  }
  if (s.level.seconds && s.seconds <= 0) {
    s.status = "lost";
    s.reason = "Hết thời gian.";
  }
}
export function act(
  original: Run,
  action: Action,
  now: number,
): { run: Run; valid: boolean } {
  if (original.status !== "playing") return { run: original, valid: false };
  const s = structuredClone(original);
  s.effects = [];
  s.changed = [];
  s.portalMoves = [];
  let cells: number[] = [];
  if (action.type === "tap") {
    const t = s.board[action.cell];
    if (!t || !tappable(t)) return { run: original, valid: false };
    if (!t.special) {
      cells = group(s, action.cell);
      if (cells.length < 3) return { run: original, valid: false };
    }
  }
  if (
    action.type === "merge" &&
    (!s.board[action.cell]?.special ||
      !s.board[action.other]?.special ||
      !tappable(s.board[action.cell]) ||
      !tappable(s.board[action.other]) ||
      !neighbors(s, action.cell).includes(action.other))
  )
    return { run: original, valid: false };
  const costs = action.type === "tap" || action.type === "merge";
  if (costs) {
    s.turns++;
    if (!s.level.seconds) s.moves--;
    s.combo = now - s.lastTap <= 2000 ? s.combo + 1 : 1;
    s.lastTap = now;
    s.maxCombo = Math.max(s.maxCombo || 0, s.combo);
  }
  const mult = [1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4][
    Math.min(7, Math.max(0, s.combo - 1))
  ];
  if (action.type === "tap") {
    const special = s.board[action.cell].special;
    if (special) explosion(s, [{ cell: action.cell, special }], mult);
    else normalBlast(s, cells, action.cell, mult);
  } else if (action.type === "merge") merge(s, action.cell, action.other, mult);
  else if (action.type === "shuffle") shuffle(s, false);
  else if (action.type === "hammer") {
    const t = s.board[action.cell];
    if (!t || t.boss || t.seed) return { run: original, valid: false };
    if (t.special) explosion(s, [{ cell: action.cell, special: t.special }], 1);
    else if (hasHazard(t)) hazardHit(s, action.cell);
    else {
      addProgress(s, `collect:${t.color}`);
      s.board[action.cell] = { id: s.nextId++, color: -2 };
      s.score += 15;
      s.changed.push(action.cell);
    }
  } else if (action.type === "vacuum") {
    const color = s.board[action.cell]?.color;
    if (color === undefined || color < 0)
      return { run: original, valid: false };
    const target = s.board
      .map((t, i) => (t.color === color ? i : -1))
      .filter((i) => i >= 0);
    explosion(
      s,
      [{ cell: action.cell, special: "rainbow_orb", custom: target }],
      1,
    );
  } else if (action.type === "broom")
    explosion(
      s,
      [{ cell: action.cell, special: action.vertical ? "bee_v" : "bee_h" }],
      1,
    );
  if (!costs) s.used[action.type] = (s.used[action.type] || 0) + 1;
  const spawnStart = s.nextId;
  gravity(s);
  if (costs) evolve(s);
  if (
    s.companion === "turtle" &&
    !s.companionUsed &&
    s.moves === 3 &&
    !s.level.seconds
  ) {
    s.moves++;
    s.companionUsed = true;
  }
  finish(s);
  if (s.status === "playing")
    ensurePlayable(
      s,
      new Set(
        s.board
          .map((t, i) => (t.id >= spawnStart ? i : -1))
          .filter((i) => i >= 0),
      ),
    );
  s.changed = [...new Set(s.changed)];
  s.log.push({ action, at: now });
  return { run: s, valid: true };
}
export function tick(original: Run, seconds: number): Run {
  if (!original.level.seconds || original.status !== "playing") return original;
  const s = structuredClone(original);
  s.seconds = Math.max(0, s.seconds - seconds);
  finish(s);
  return s;
}
export function hint(s: Run): number[] {
  const best = groups(s).sort((a, b) => b.length - a.length)[0];
  if (best) return best;
  const i = s.board.findIndex((t) => t.special && tappable(t));
  return i >= 0 ? [i] : [];
}
export function revealFog(original: Run): Run {
  const s = structuredClone(original),
    i = s.board.findIndex((t) => hasHazard(t, "fog"));
  if (i >= 0) {
    const row = Math.floor(i / s.level.cols),
      col = i % s.level.cols;
    for (let r = row; r < Math.min(row + 3, s.level.rows); r++)
      for (let c = col; c < Math.min(col + 3, s.level.cols); c++) {
        const n = r * s.level.cols + c;
        if (s.board[n].fog) {
          delete s.board[n].fog;
          addProgress(s, "fog");
          s.changed.push(n);
        } else if (s.board[n].hazard === "fog") hazardHit(s, n);
      }
    s.companionUsed = true;
  }
  return s;
}
// Validation is separate from the deterministic constructor: replay uses the accepted seed.
export function validatedRun(
  level: Level,
  seed: number,
  options: Partial<
    Pick<Run, "id" | "mode" | "companion" | "started" | "dailyDate">
  > = {},
): Run {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = createRun(
      level,
      (seed + Math.imul(attempt, 2654435761)) >>> 0,
      options,
    );
    if (groups(candidate).length < 3) continue;
    const actions = groups(candidate).map(
      (g) => ({ type: "tap", cell: g[0] }) as Action,
    );
    if (
      !options.started?.length &&
      actions.some((a) => act(candidate, a, 0).run.status === "won")
    )
      continue;
    let probe = candidate;
    let blocked = false;
    for (let turn = 0; turn < 3 && probe.status === "playing"; turn++) {
      const g = groups(probe).sort((a, b) => b.length - a.length)[0],
        special = probe.board.findIndex((t) => t.special && tappable(t));
      if (!g && special < 0) {
        blocked = true;
        break;
      }
      probe = act(
        probe,
        { type: "tap", cell: special >= 0 ? special : g[0] },
        turn * 3000,
      ).run;
      if (probe.status === "lost") blocked = true;
    }
    if (!blocked) return candidate;
  }
  // Static opening seeds also checked by the offline seed audit. Never accept a broken board.
  for (const fallback of (fallbackSeeds as Record<string, number[]>)[
    String(level.id)
  ] || Array.from({ length: 20 }, (_, i) => i + 1)) {
    const candidate = createRun(level, fallback, options);
    if (groups(candidate).length >= 3) return candidate;
  }
  throw new Error("Blueprint needs a new fallback opening.");
}

function spawnFog(s: Run, side: number) {
  const origins = shuffled(
    s,
    s.board
      .map((_, i) => i)
      .filter(
        (i) =>
          i % s.level.cols <= s.level.cols - side &&
          Math.floor(i / s.level.cols) <= s.level.rows - side,
      ),
  );
  for (const origin of origins) {
    const cells = Array.from(
      { length: side * side },
      (_, k) => origin + Math.floor(k / side) * s.level.cols + (k % side),
    );
    if (
      cells.some(
        (i) =>
          fixed(s.board[i]) ||
          hasHazard(s.board[i]) ||
          s.board[i].seed ||
          s.board[i].special ||
          s.portals.includes(i),
      )
    )
      continue;
    if (
      s.board.filter((t) => hasHazard(t)).length + cells.length >
      Math.floor(s.board.length * 0.35)
    )
      return;
    cells.forEach((i) => addHazard(s, i, "fog"));
    return;
  }
}
