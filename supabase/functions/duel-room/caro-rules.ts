// Pure Caro/Gomoku rules shared by the client room code and the authoritative duel server.
export const BOARD_SIZE = 15; // 15x15 Caro / Gomoku standard tournament grid

/**
 * Check 5-in-a-row Gomoku/Caro win condition
 */
export function checkCaroWin(
  boardState: Record<string, string>,
  lastX: number,
  lastY: number,
  symbol: string,
  gridSize = BOARD_SIZE
): { isWin: boolean; winningLine: { x: number; y: number }[] | null } {
  const directions = [
    { dx: 1, dy: 0 },  // Horizontal
    { dx: 0, dy: 1 },  // Vertical
    { dx: 1, dy: 1 },  // Diagonal \
    { dx: 1, dy: -1 }, // Diagonal /
  ];

  for (const { dx, dy } of directions) {
    const line: { x: number; y: number }[] = [{ x: lastX, y: lastY }];

    // Forward direction
    let step = 1;
    while (true) {
      const nx = lastX + dx * step;
      const ny = lastY + dy * step;
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) break;
      if (boardState[`${nx}_${ny}`] === symbol) {
        line.push({ x: nx, y: ny });
        step++;
      } else {
        break;
      }
    }

    // Backward direction
    step = 1;
    while (true) {
      const nx = lastX - dx * step;
      const ny = lastY - dy * step;
      if (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize) break;
      if (boardState[`${nx}_${ny}`] === symbol) {
        line.push({ x: nx, y: ny });
        step++;
      } else {
        break;
      }
    }

    if (line.length >= 5) {
      return { isWin: true, winningLine: line };
    }
  }

  return { isWin: false, winningLine: null };
}
