export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export function slideBoard(grid: number[][], direction: Direction) {
  const size = grid.length, next = grid.map(row => [...row]);
  let points = 0, merges = 0;
  for (let line = 0; line < size; line++) {
    const positions = Array.from({ length: size }, (_, i) =>
      direction === 'LEFT' ? [line, i] : direction === 'RIGHT' ? [line, size - 1 - i] :
        direction === 'UP' ? [i, line] : [size - 1 - i, line]);
    const values = positions.map(([r, c]) => grid[r][c]).filter(Boolean), output: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1] && values[i] <= Number.MAX_SAFE_INTEGER / 2) {
        const value = values[i] * 2;
        output.push(value); points += value; merges++; i++;
      } else output.push(values[i]);
    }
    positions.forEach(([r, c], i) => { next[r][c] = output[i] ?? 0; });
  }
  return { grid: next, points, merges, moved: next.some((row, r) => row.some((n, c) => n !== grid[r][c])), maxTile: Math.max(...next.flat()) };
}
export function randomStep(seed: number) {
  const state = (Math.imul(seed >>> 0, 1664525) + 1013904223) >>> 0;
  return { state, value: state / 4294967296 };
}
export function spawnBoardTile(grid: number[][], seed: number) {
  const cells = grid.flatMap((row, r) => row.flatMap((n, c) => n === 0 ? [{ r, c }] : []));
  if (!cells.length) return { grid, seed, spawned: false };
  const position = randomStep(seed), number = randomStep(position.state);
  const { r, c } = cells[Math.floor(position.value * cells.length)];
  const next = grid.map(row => [...row]); next[r][c] = number.value < .9 ? 2 : 4;
  return { grid: next, seed: number.state, spawned: true };
}

