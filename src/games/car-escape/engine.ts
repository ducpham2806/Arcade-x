import type { Vehicle, LevelConfig } from "./types";
export type Move = { vehicleId: number; to: number };
export type Solution = {
  status: "solved" | "unsolvable" | "limit";
  moves: Move[];
  visited: number;
};
export function bounds(vehicle: Vehicle, vehicles: Vehicle[], size: number) {
  const occupied = new Uint8Array(size * size);
  for (const other of vehicles)
    if (other.id !== vehicle.id)
      for (let i = 0; i < other.length; i++)
        occupied[
          (other.row + (other.isHorizontal ? 0 : i)) * size +
            other.col +
            (other.isHorizontal ? i : 0)
        ] = 1;
  const pos = vehicle.isHorizontal ? vehicle.col : vehicle.row;
  let min = pos,
    max = pos;
  const cell = (p: number) =>
    vehicle.isHorizontal ? vehicle.row * size + p : p * size + vehicle.col;
  while (min > 0 && !occupied[cell(min - 1)]) min--;
  while (max + vehicle.length < size && !occupied[cell(max + vehicle.length)])
    max++;
  return { min, max };
}
export function applyMove(
  vehicles: Vehicle[],
  size: number,
  move: Move,
): Vehicle[] | null {
  const v = vehicles.find((v) => v.id === move.vehicleId);
  if (!v || !Number.isInteger(move.to)) return null;
  const { min, max } = bounds(v, vehicles, size),
    pos = v.isHorizontal ? v.col : v.row;
  if (move.to < min || move.to > max || move.to === pos) return null;
  return vehicles.map((o) =>
    o.id === v.id
      ? { ...o, ...(v.isHorizontal ? { col: move.to } : { row: move.to }) }
      : o,
  );
}
export function won(vehicles: Vehicle[], size: number) {
  const v = vehicles.find((v) => v.isTarget);
  return !!v && v.col + v.length === size;
}
export function legalMoves(vehicles: Vehicle[], size: number): Move[] {
  return vehicles.flatMap((v) => {
    const { min, max } = bounds(v, vehicles, size);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i)
      .filter((p) => p !== (v.isHorizontal ? v.col : v.row))
      .map((to) => ({ vehicleId: v.id, to }));
  });
}
/** A* with an admissible distinct-blocker heuristic. Every arbitrary-distance slide costs ONE turn. */
export function solve(
  config: Pick<LevelConfig, "size" | "targetRow">,
  vehicles: Vehicle[],
  maxStates = 160000,
): Solution {
  const n = config.size,
    base = vehicles,
    target = base.findIndex((v) => v.isTarget);
  if (target < 0) return { status: "unsolvable", moves: [], visited: 0 };
  const start = base
    .map((v) => String.fromCharCode(65 + (v.isHorizontal ? v.col : v.row)))
    .join("");
  const occupancy = (key: string) => {
    const grid = new Int16Array(n * n).fill(-1);
    for (let i = 0; i < base.length; i++) {
      const v = base[i],
        p = key.charCodeAt(i) - 65;
      for (let j = 0; j < v.length; j++)
        grid[
          (v.isHorizontal ? v.row : p + j) * n +
            (v.isHorizontal ? p + j : v.col)
        ] = i;
    }
    return grid;
  };
  const heuristic = (key: string, grid: Int16Array) => {
    const p = key.charCodeAt(target) - 65;
    if (p + base[target].length === n) return 0;
    const blockers = new Set<number>();
    for (let c = p + base[target].length; c < n; c++)
      if (grid[config.targetRow * n + c] >= 0)
        blockers.add(grid[config.targetRow * n + c]);
    return 1 + blockers.size;
  };
  type Node = { key: string; g: number; f: number };
  const heap: Node[] = [];
  const push = (node: Node) => {
    let i = heap.length;
    heap.push(node);
    while (i) {
      const p = (i - 1) >> 1;
      if (heap[p].f < node.f || (heap[p].f === node.f && heap[p].g >= node.g))
        break;
      heap[i] = heap[p];
      i = p;
    }
    heap[i] = node;
  };
  const pop = () => {
    const first = heap[0],
      last = heap.pop()!;
    if (heap.length) {
      let i = 0;
      while (2 * i + 1 < heap.length) {
        let j = 2 * i + 1;
        if (
          j + 1 < heap.length &&
          (heap[j + 1].f < heap[j].f ||
            (heap[j + 1].f === heap[j].f && heap[j + 1].g > heap[j].g))
        )
          j++;
        if (last.f < heap[j].f || (last.f === heap[j].f && last.g >= heap[j].g))
          break;
        heap[i] = heap[j];
        i = j;
      }
      heap[i] = last;
    }
    return first;
  };
  const distances = new Map<string, number>([[start, 0]]),
    parents = new Map<string, { key: string; move: Move }>();
  push({ key: start, g: 0, f: heuristic(start, occupancy(start)) });
  let visited = 0;
  while (heap.length) {
    const cur = pop();
    if (distances.get(cur.key) !== cur.g) continue;
    if (++visited > maxStates) return { status: "limit", moves: [], visited };
    if (cur.key.charCodeAt(target) - 65 + base[target].length === n) {
      const moves: Move[] = [];
      let k = cur.key;
      while (k !== start) {
        const p = parents.get(k)!;
        moves.push(p.move);
        k = p.key;
      }
      return { status: "solved", moves: moves.reverse(), visited };
    }
    const grid = occupancy(cur.key);
    for (let i = 0; i < base.length; i++) {
      const v = base[i],
        p = cur.key.charCodeAt(i) - 65;
      for (const d of [-1, 1])
        for (let q = p + d; q >= 0 && q + v.length <= n; q += d) {
          const edge = d < 0 ? q : q + v.length - 1;
          const index = v.isHorizontal ? v.row * n + edge : edge * n + v.col;
          if (grid[index] >= 0 && grid[index] !== i) break;
          const key =
              cur.key.slice(0, i) +
              String.fromCharCode(q + 65) +
              cur.key.slice(i + 1),
            g = cur.g + 1;
          if ((distances.get(key) ?? Infinity) <= g) continue;
          distances.set(key, g);
          parents.set(key, { key: cur.key, move: { vehicleId: v.id, to: q } });
          push({ key, g, f: g + heuristic(key, occupancy(key)) });
        }
    }
  }
  return { status: "unsolvable", moves: [], visited };
}
export const MODE_LABELS = {
  classic: "Tự do",
  turns: "Giới hạn lượt",
  timed: "Đếm ngược",
  endless: "Đường dài",
};
export type PlayMode = keyof typeof MODE_LABELS;
export function starsFor(
  optimal: number,
  moves: number,
  hints: number,
  elapsedMs: number,
  timeLimit: number | null,
): number {
  if (moves < optimal) return 0;
  if (hints > 0) return 1;
  if (
    moves <= optimal + Math.max(1, Math.floor(optimal * 0.15)) &&
    (!timeLimit || elapsedMs <= timeLimit * 0.7)
  )
    return 3;
  return moves <= optimal + Math.ceil(optimal * 0.5) ? 2 : 1;
}
export function scoreFor(
  optimal: number,
  moves: number,
  elapsedMs: number,
  hints: number,
) {
  return Math.max(
    100,
    Math.round(
      (optimal * 1000) / Math.max(optimal, moves) +
        optimal * 40 +
        Math.max(0, 300 - Math.floor(elapsedMs / 1000) * 2) -
        hints * 150,
    ),
  );
}
