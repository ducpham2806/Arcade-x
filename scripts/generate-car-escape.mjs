// Node 24+: deterministic OFFLINE puzzle construction. Can take several minutes.
// Every accepted layout is certified by A* using arbitrary-distance slides.
import {
  solve,
  legalMoves,
  applyMove,
} from "../src/games/car-escape/engine.ts";
import fs from "node:fs";
const pools = { 6: [], 7: [], 8: [] };
{
  let seed = 0xcae2026;
  function rand() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }
  const int = (n) => Math.floor(rand() * n);
  const seen = new Set();
  let attempts = 0;
  for (const size of [6, 7]) {
    const needed = size === 6 ? 35 : size === 7 ? 45 : 65;
    let best = 0;
    for (
      let attempt = 0;
      attempt < 50000 && pools[size].length < needed;
      attempt++
    ) {
      attempts++;
      const row = Math.floor((size - 1) / 2),
        vehicles = [
          {
            id: 0,
            isTarget: true,
            isHorizontal: true,
            length: 2,
            row,
            col: size - 2,
            color: "#ffcc55",
          },
        ];
      const count =
        size === 6 ? 12 + int(3) : size === 7 ? 16 + int(5) : 21 + int(5);
      const occupied = new Set([row * size + size - 2, row * size + size - 1]);
      for (let id = 1; id < count; id++)
        for (let tries = 0; tries < 90; tries++) {
          const h = rand() < 0.5,
            length = rand() < 0.28 ? 3 : 2,
            r = int(h ? size : size - length + 1),
            c = int(h ? size - length + 1 : size),
            cells = Array.from(
              { length },
              (_, j) => (r + (h ? 0 : j)) * size + c + (h ? j : 0),
            );
          if (cells.some((c) => occupied.has(c))) continue;
          cells.forEach((c) => occupied.add(c));
          vehicles.push({
            id,
            isTarget: false,
            isHorizontal: h,
            length,
            row: r,
            col: c,
            color: ["#72a4b8", "#89aa89", "#ad91b2", "#e29e72", "#7e91af"][
              id % 5
            ],
          });
          break;
        }
      let state = vehicles,
        last = -1;
      for (let k = 0; k < 80 + int(120); k++) {
        let moves = legalMoves(state, size).filter((m) => m.vehicleId !== last);
        if (!moves.length) moves = legalMoves(state, size);
        if (!moves.length) break;
        const move = moves[int(moves.length)];
        state = applyMove(state, size, move);
        last = move.vehicleId;
      }
      if (state[0].col > 1) continue;
      const config = { size, targetRow: row, vehicles: state, city: 1 };
      const solution = solve(config, state, 35000);
      if (solution.status !== "solved") continue;
      const depth = solution.moves.length;
      best = Math.max(best, depth);
      const min = size === 6 ? 5 : size === 7 ? 9 : 12;
      if (depth < min || depth > 28) continue;
      const signature = JSON.stringify(
        state.map((v) => [v.isHorizontal, v.length, v.row, v.col]),
      );
      if (seen.has(signature)) continue;
      seen.add(signature);
      pools[size].push({
        ...config,
        optimalMoves: depth,
        solution: solution.moves,
        proofVisited: solution.visited,
      });
      if (pools[size].length % 5 === 0)
        console.log(
          size,
          pools[size].length,
          "depth",
          depth,
          "best",
          best,
          "attempt",
          attempt,
        );
    }
    console.log("POOL", size, pools[size].length, "best", best);
  }
  console.log("attempts", attempts);
}
{
  let seed = 0xa23092;
  function rand() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }
  const int = (n) => Math.floor(rand() * n);
  const seen = new Set();
  const key = (s) =>
    s
      .map((v) => String.fromCharCode(65 + (v.isHorizontal ? v.col : v.row)))
      .join("");
  for (const size of [6, 7]) {
    const needed = size === 6 ? 50 : 40;
    for (let a = 0; a < 12000 && pools[size].length < needed; a++) {
      const row = Math.floor((size - 1) / 2),
        vs = [
          {
            id: 0,
            isTarget: true,
            isHorizontal: true,
            length: 2,
            row,
            col: size - 2,
            color: "#ffcc55",
          },
        ],
        occupied = new Set([row * size + size - 2, row * size + size - 1]),
        count =
          size === 6 ? 13 + int(3) : size === 7 ? 19 + int(4) : 25 + int(5);
      for (let id = 1; id < count; id++)
        for (let tr = 0; tr < 100; tr++) {
          const h = rand() < 0.5,
            length = rand() < 0.4 ? 3 : 2,
            r = int(h ? size : size - length + 1),
            c = int(h ? size - length + 1 : size),
            cells = Array.from(
              { length },
              (_, j) => (r + (h ? 0 : j)) * size + c + (h ? j : 0),
            );
          if (cells.some((c) => occupied.has(c))) continue;
          cells.forEach((c) => occupied.add(c));
          vs.push({
            id,
            isTarget: false,
            isHorizontal: h,
            length,
            row: r,
            col: c,
            color: ["#72a4b8", "#89aa89", "#ad91b2", "#e29e72", "#7e91af"][
              id % 5
            ],
          });
          break;
        }
      const q = [{ s: vs, d: 0 }],
        idx = new Map([[key(vs), 0]]),
        goals = [];
      let head = 0;
      while (head < q.length && q.length < 6000) {
        const node = q[head++];
        if (node.s[0].col === size - 2) goals.push(head - 1);
        for (const m of legalMoves(node.s, size)) {
          const s = applyMove(node.s, size, m),
            k = key(s);
          if (!idx.has(k)) {
            idx.set(k, q.length);
            q.push({ s, d: node.d + 1 });
          }
        }
      }
      // Distance to every discovered goal, not merely the single initially solved arrangement.
      const distance = new Map(goals.map((i) => [i, 0])),
        front = [...goals];
      let h = 0;
      while (h < front.length) {
        const i = front[h++];
        for (const m of legalMoves(q[i].s, size)) {
          const s = applyMove(q[i].s, size, m),
            next = idx.get(key(s));
          if (next !== undefined && !distance.has(next)) {
            distance.set(next, distance.get(i) + 1);
            front.push(next);
          }
        }
      }
      const candidates = [...distance.entries()]
        .filter(([i]) => q[i].s[0].col <= 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);
      for (const [i, estimate] of candidates) {
        const min = size === 6 ? 7 : size === 7 ? 10 : 12;
        if (estimate < min) continue;
        const state = q[i].s,
          sig = JSON.stringify(
            state.map((v) => [v.isHorizontal, v.length, v.row, v.col]),
          );
        if (seen.has(sig)) continue;
        const config = { size, targetRow: row, vehicles: state, city: 1 },
          sol = solve(config, state, 80000);
        if (
          sol.status === "solved" &&
          sol.moves.length >= min &&
          sol.moves.length <= 30
        ) {
          seen.add(sig);
          pools[size].push({
            ...config,
            optimalMoves: sol.moves.length,
            solution: sol.moves,
            proofVisited: sol.visited,
          });
          console.log(
            "ADD",
            size,
            pools[size].length,
            "optimal",
            sol.moves.length,
            "attempt",
            a,
            "states",
            q.length,
          );
        }
      }
      if (a % 100 === 0) console.log("PROGRESS", size, a, pools[size].length);
    }
    console.log("POOL", size, pools[size].length);
  }
}
{
  const reflect = (p) => ({
    ...p,
    targetRow: p.size - 1 - p.targetRow,
    vehicles: p.vehicles.map((v) => ({
      ...v,
      row: p.size - v.row - (v.isHorizontal ? 1 : v.length),
    })),
  });
  let id = 50;
  const eight = [];
  for (const original of pools[7].filter((p) => p.optimalMoves >= 12))
    for (const mirror of [false, true])
      for (const offset of [0, 1]) {
        const p = mirror ? reflect(original) : original,
          size = 8,
          targetRow = p.targetRow + offset;
        let vehicles = p.vehicles.map((v) => ({ ...v, row: v.row + offset }));
        const add = (h, len, row, col) =>
          vehicles.push({
            id: id++,
            isTarget: false,
            isHorizontal: h,
            length: len,
            row,
            col,
            color: "#7b8f9b",
          });
        const borderRow = offset ? 0 : 7;
        add(true, 3, borderRow, 0);
        add(true, 2, borderRow, 3);
        add(true, 3, borderRow, 5);
        // Parked perimeter blocks preserve internal dependencies; the exit lane remains open.
        const fill = (from, to) => {
          let r = from;
          while (r < to) {
            const len = to - r === 3 ? 3 : 2;
            if (to - r < 2) break;
            add(false, len, r, 7);
            r += len;
          }
        };
        fill(offset, targetRow);
        fill(targetRow + 1, offset + 7);
        const config = { size, targetRow, vehicles, city: 1 };
        const sol = solve(config, vehicles, 180000);
        if (sol.status === "solved" && sol.moves.length >= 12)
          eight.push({
            ...config,
            optimalMoves: sol.moves.length,
            solution: sol.moves,
            proofVisited: sol.visited,
          });
      }
  console.log("8x8 verified candidates", eight.length);
  if (eight.length < 40) throw new Error("Not enough certified 8x8 boards");
  const pick = (pool, count) => {
    const sorted = [...pool].sort((a, b) => a.optimalMoves - b.optimalMoves);
    return Array.from(
      { length: count },
      (_, i) => sorted[Math.floor((i * (sorted.length - 1)) / (count - 1))],
    );
  };
  const groups = new Map();
  for (const b of [...pools[6]].sort(
    (a, b) =>
      a.optimalMoves - b.optimalMoves || a.proofVisited - b.proofVisited,
  )) {
    const group = groups.get(b.optimalMoves) || [];
    group.push(b);
    groups.set(b.optimalMoves, group);
  }
  const first = [];
  for (const [depth, count] of [
    [5, 5],
    [6, 5],
    [7, 5],
    [8, 6],
    [9, 1],
    [10, 4],
    [11, 1],
    [12, 3],
  ]) {
    const rows = groups.get(depth) || [];
    if (rows.length < count) throw new Error("Insufficient board pool");
    first.push(...rows.slice(0, count));
  }
  const selected = [...first, ...pick(pools[7], 30), ...pick(eight, 40)];
  let seed = 0x213923;
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }
  const modes = [];
  for (let i = 0; i < 25; i++) {
    const block = ["classic", "turns", "timed", "endless"];
    for (let j = 3; j > 0; j--) {
      const k = Math.floor(random() * (j + 1));
      [block[j], block[k]] = [block[k], block[j]];
    }
    modes.push(...block);
  }
  const lessons = [
    "Dọn lối cho xe chắn đường trước, rồi mới đẩy xe cứu hộ.",
    "Một xe có thể phải lùi để mở chỗ cho xe khác.",
    "Đừng chỉ nhìn lối ra: tìm khoảng trống cần tạo ở phía sau.",
    "Trượt nhiều ô trong một lượt để tiết kiệm lượt.",
    "Lập chuỗi di chuyển: xe nào đang khóa xe chắn đường?",
  ];
  const bank = selected.map((p, i) => {
    const level = i + 1,
      mode =
        level <= 3
          ? "classic"
          : level <= 6 && modes[i] === "timed"
            ? "classic"
            : modes[i],
      challenge = level % 10 === 0;
    return {
      ...p,
      city: Math.floor(i / 10) + 1,
      level,
      mode,
      moveLimit:
        mode === "turns"
          ? p.optimalMoves + Math.max(3, Math.ceil(p.optimalMoves * 0.5))
          : null,
      timeLimitMs:
        mode === "timed" ? Math.max(60000, p.optimalMoves * 9000) : null,
      lesson: challenge
        ? "Kết hợp những kỹ năng đã học. Hint chỉ gợi một bước, không tự giải màn."
        : lessons[Math.floor(i / 2) % lessons.length],
      challenge,
    };
  });
  if (
    new Set(
      bank.map((p) =>
        JSON.stringify(
          p.vehicles.map((v) => [v.isHorizontal, v.length, v.row, v.col]),
        ),
      ),
    ).size !== 100
  )
    throw new Error("Duplicate board");
  fs.writeFileSync(
    new URL("../src/games/car-escape/levels.json", import.meta.url),
    JSON.stringify(bank),
  );
  console.log(
    bank
      .map((p) => `${p.level}:${p.size}x${p.size}/${p.optimalMoves}/${p.mode}`)
      .join("\n"),
  );
}
