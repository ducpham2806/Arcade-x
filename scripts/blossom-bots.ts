import {
  act,
  area,
  groups,
  hasHazard,
  key,
  neighbors,
  tappable,
} from "../src/games/hex-match/blossom/engine";
import { Action, Run } from "../src/games/hex-match/blossom/types";
export type Bot = "A" | "B" | "C" | "D";
export function candidates(s: Run): { action: Action; value: number }[] {
  const actions = groups(s).map((cells) => ({
    action: { type: "tap", cell: cells[0] } as Action,
    value: cells.length,
    cells,
  }));
  for (let i = 0; i < s.board.length; i++)
    if (s.board[i].special && tappable(s.board[i]))
      actions.push({ action: { type: "tap", cell: i }, value: 12, cells: [i] });
  const pairs: { action: Action; value: number; cells: number[] }[] = [];
  for (let i = 0; i < s.board.length; i++)
    if (s.board[i].special && tappable(s.board[i]))
      for (const n of neighbors(s, i))
        if (n > i && s.board[n].special && tappable(s.board[n]))
          pairs.push({
            action: { type: "merge", cell: i, other: n },
            value: 30,
            cells: [i, n],
          });
  return [...actions, ...pairs].map((a) => {
    let value = a.value;
    for (const g of s.level.goals) {
      if (g.kind === "score") continue;
      const remaining = g.target - (s.progress[key(g)] || 0);
      if (remaining <= 0) continue;
      if (g.kind === "collect")
        value += a.cells.filter((i) => s.board[i].color === g.color).length * 4;
      else if (g.kind === "boss")
        value += a.cells.some((i) =>
          neighbors(s, i).some((n) => s.board[n].boss),
        )
          ? 25
          : 0;
      else if (g.kind === "drop") {
        const affected =
          a.action.type === "tap" && s.board[a.action.cell].special
            ? area(s, a.action.cell, s.board[a.action.cell].special!)
            : a.cells;
        for (const i of affected) {
          const above = s.board
            .slice(0, i)
            .map((t, n) =>
              t.seed && n % s.level.cols === i % s.level.cols
                ? Math.floor((i - n) / s.level.cols)
                : 0,
            )
            .filter((d) => d > 0);
          if (above.length) value += 15 / Math.min(...above);
        }
      } else {
        const cells = [
          ...new Set(a.cells.flatMap((i) => [i, ...neighbors(s, i)])),
        ];
        value +=
          cells.filter((i) =>
            g.kind === "rescue"
              ? s.board[i].pet
              : hasHazard(
                  s.board[i],
                  g.kind as import("../src/games/hex-match/blossom/types").Hazard,
                ),
          ).length * 8;
      }
    }
    value += a.cells
      .flatMap((i) => neighbors(s, i))
      .filter((i) => s.board[i].hazard === "bomb")
      .reduce((sum, i) => sum + 30 / (s.board[i].timer || 1), 0);
    return { action: a.action, value };
  });
}

export function utility(s: Run): number {
  if (s.status === "won") return 10000;
  if (s.status === "lost") return -10000;
  let value = 0;
  for (const g of s.level.goals) {
    const p =
      g.kind === "score"
        ? s.score
        : g.kind === "boss"
          ? g.target - s.bossHP
          : g.kind === "combo"
            ? s.maxCombo
            : s.progress[key(g)] || 0;
    value += 100 * Math.min(1, p / g.target);
  }
  const seeds = s.board.flatMap((t, i) => (t.seed ? [i] : []));
  if (s.level.seeds)
    value +=
      seeds.reduce(
        (sum, i) => sum + Math.floor(i / s.level.cols) / s.level.rows,
        0,
      ) * 8;
  if (s.level.seeds) {
    const readyCells = new Set(groups(s).flat());
    s.board.forEach((t, i) => {
      if (t.special && tappable(t))
        area(s, i, t.special).forEach((n) => readyCells.add(n));
    });
    value +=
      seeds.filter((seed) => readyCells.has(seed + s.level.cols)).length * 18;
  }
  value += s.board.filter((t) => t.special).length * 0.7;
  value += Math.min(s.score, 20000) * 0.00001;
  return value;
}
export function chooseAction(
  s: Run,
  bot: Bot,
  now: number,
): Action | undefined {
  const choices = candidates(s).sort((a, b) => b.value - a.value);
  if (!choices.length) return;
  if (bot === "A") {
    const normal = choices.filter(
      (c) => c.action.type === "tap" && !s.board[c.action.cell].special,
    );
    const list = normal.length ? normal : choices;
    const n = (Math.imul(s.initialSeed ^ s.turns, 1664525) + 1013904223) >>> 0;
    return list[n % list.length].action;
  }
  if (bot === "B") {
    const g = groups(s).sort((a, b) => b.length - a.length)[0];
    return g ? { type: "tap", cell: g[0] } : choices[0].action;
  }
  if (bot === "C" && !s.level.seeds) return choices[0].action;
  const ranked = choices
    .map((c) => ({
      action: c.action,
      run: act(s, c.action, now).run,
      tie: c.value,
    }))
    .sort((a, b) => utility(b.run) - utility(a.run) || b.tie - a.tie);
  if (bot === "C") return ranked[0].action;
  return ranked
    .slice(0, 6)
    .map((c) => {
      let future = utility(c.run);
      if (c.run.status === "playing")
        for (const next of candidates(c.run))
          future = Math.max(
            future,
            utility(act(c.run, next.action, now + 1500).run),
          );
      return { ...c, future };
    })
    .sort((a, b) => b.future - a.future || utility(b.run) - utility(a.run))[0]
    .action;
}
