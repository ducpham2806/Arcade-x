import { Position, Direction, MummyEntity, Gate, KeyItem, TrapItem } from './types';
import { hasWallBetween } from './levels';
import { simulatePlayerAndMummiesTurn } from './mummyAI';

export interface MoveSafetyEvaluation {
  dir: Direction;
  targetPos: Position;
  safety: 'safe' | 'risky' | 'fatal' | 'winning';
  score: number;
  reason: string;
}

export interface HintSuggestion {
  bestDir: Direction;
  targetPos: Position;
  isWait: boolean;
  safetyScore: number;
  reason: string;
  isWinningMove: boolean;
  allEvaluations: MoveSafetyEvaluation[];
}

/**
 * Multi-source BFS to compute shortest path distances from all grid cells
 * to any destination in targetPositions, respecting static walls and closed gates.
 */
export function computeBfsDistances(
  targetPositions: Position[],
  hWalls: Array<[number, number]>,
  vWalls: Array<[number, number]>,
  gates: Gate[] = [],
  cols: number = 6,
  rows: number = 6
): number[][] {
  const dist: number[][] = Array.from({ length: cols }, () => Array(rows).fill(Infinity));
  const queue: Array<[number, number]> = [];

  targetPositions.forEach((pos) => {
    if (pos.x >= 0 && pos.x < cols && pos.y >= 0 && pos.y < rows) {
      dist[pos.x][pos.y] = 0;
      queue.push([pos.x, pos.y]);
    }
  });

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    const curDist = dist[cx][cy];

    for (const { dx, dy } of directions) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        if (!hasWallBetween(cx, cy, nx, ny, hWalls, vWalls, gates, cols, rows)) {
          if (dist[nx][ny] > curDist + 1) {
            dist[nx][ny] = curDist + 1;
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  return dist;
}

/**
 * Pathfinding and threat simulation algorithm that evaluates all possible moves,
 * simulating mummy reactions up to 2 turns ahead to identify the absolute safest grid cell.
 */
export function findSafestMove(params: {
  playerPos: Position;
  mummies: MummyEntity[];
  hWalls: Array<[number, number]>;
  vWalls: Array<[number, number]>;
  gates?: Gate[];
  keys?: KeyItem[];
  traps?: TrapItem[];
  exitPos: Position;
  gridSize?: { cols: number; rows: number };
}): HintSuggestion {
  const {
    playerPos,
    mummies,
    hWalls,
    vWalls,
    gates = [],
    keys = [],
    traps = [],
    exitPos,
    gridSize = { cols: 6, rows: 6 },
  } = params;

  const { cols, rows } = gridSize;

  // Determine current objectives: uncollected keys first, then exit stairs
  const uncollectedKeys = keys.filter((k) => !k.collected);
  const primaryTargets = uncollectedKeys.length > 0 ? uncollectedKeys.map((k) => ({ x: k.x, y: k.y })) : [exitPos];

  const distToGoal = computeBfsDistances(primaryTargets, hWalls, vWalls, gates, cols, rows);
  const distToExit = computeBfsDistances([exitPos], hWalls, vWalls, gates, cols, rows);

  const candidateDirections: Direction[] = ['up', 'down', 'left', 'right', 'wait'];
  const evaluations: MoveSafetyEvaluation[] = [];

  for (const dir of candidateDirections) {
    let targetX = playerPos.x;
    let targetY = playerPos.y;

    if (dir === 'up') targetY -= 1;
    if (dir === 'down') targetY += 1;
    if (dir === 'left') targetX -= 1;
    if (dir === 'right') targetX += 1;

    // Check if move is legal (within bounds & not blocked by wall)
    let isLegal = true;
    if (dir !== 'wait') {
      if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) {
        isLegal = false;
      } else if (hasWallBetween(playerPos.x, playerPos.y, targetX, targetY, hWalls, vWalls, gates, cols, rows)) {
        isLegal = false;
      }
    }

    if (!isLegal) {
      continue;
    }

    const simTargetPos = { x: targetX, y: targetY };

    // Run Turn 1 Simulation
    const turn1Result = simulatePlayerAndMummiesTurn(
      playerPos,
      dir,
      mummies,
      hWalls,
      vWalls,
      gates,
      keys,
      traps,
      exitPos,
      gridSize
    );

    // 1. Immediate Win Check
    if (turn1Result.playerEscaped) {
      evaluations.push({
        dir,
        targetPos: simTargetPos,
        safety: 'winning',
        score: 100000,
        reason: 'Tiến thẳng vào lối thoát để hoàn thành màn chơi ngay lập tức! 🪜✨',
      });
      continue;
    }

    // 2. Fatal Caught Check
    if (turn1Result.playerCaught) {
      evaluations.push({
        dir,
        targetPos: simTargetPos,
        safety: 'fatal',
        score: -100000,
        reason: 'Nguy hiểm chết người! Xác ướp sẽ tóm được bạn ở lượt này.',
      });
      continue;
    }

    // 3. Survives Turn 1: Calculate nuanced safety & heuristic score
    let score = 1000;

    // A. Goal Proximity Reward (Closer to keys/exit is better)
    const goalDist = distToGoal[turn1Result.nextPlayerPos.x]?.[turn1Result.nextPlayerPos.y] ?? 99;
    const exitDist = distToExit[turn1Result.nextPlayerPos.x]?.[turn1Result.nextPlayerPos.y] ?? 99;

    score -= goalDist * 40;
    score -= exitDist * 15;

    // B. Mummy Destruction Bonus (crushing mummies is high value)
    if (turn1Result.mummiesDestroyedCount > 0) {
      score += turn1Result.mummiesDestroyedCount * 300;
    }

    // C. Mummy Proximity Threat Analysis
    const aliveMummiesAfterTurn1 = turn1Result.nextMummies.filter((m) => m.alive);
    let minMummyDist = 99;

    aliveMummiesAfterTurn1.forEach((m) => {
      const d = Math.abs(m.x - turn1Result.nextPlayerPos.x) + Math.abs(m.y - turn1Result.nextPlayerPos.y);
      if (d < minMummyDist) {
        minMummyDist = d;
      }
    });

    if (minMummyDist <= 1) {
      score -= 250; // Proximity danger
    } else if (minMummyDist >= 3) {
      score += 80; // Safe breathing room
    }

    // D. Turn 2 Lookahead (Deep analysis to prevent walking into dead ends)
    let safeMovesInTurn2 = 0;
    let turn2CanEscape = false;
    const turn2Candidates: Direction[] = ['up', 'down', 'left', 'right', 'wait'];

    for (const dir2 of turn2Candidates) {
      let t2X = turn1Result.nextPlayerPos.x;
      let t2Y = turn1Result.nextPlayerPos.y;
      if (dir2 === 'up') t2Y -= 1;
      if (dir2 === 'down') t2Y += 1;
      if (dir2 === 'left') t2X -= 1;
      if (dir2 === 'right') t2X += 1;

      let legal2 = true;
      if (dir2 !== 'wait') {
        if (t2X < 0 || t2X >= cols || t2Y < 0 || t2Y >= rows) {
          legal2 = false;
        } else if (
          hasWallBetween(
            turn1Result.nextPlayerPos.x,
            turn1Result.nextPlayerPos.y,
            t2X,
            t2Y,
            hWalls,
            vWalls,
            turn1Result.nextGates,
            cols,
            rows
          )
        ) {
          legal2 = false;
        }
      }

      if (legal2) {
        const turn2Result = simulatePlayerAndMummiesTurn(
          turn1Result.nextPlayerPos,
          dir2,
          turn1Result.nextMummies,
          hWalls,
          vWalls,
          turn1Result.nextGates,
          turn1Result.nextKeys,
          turn1Result.nextTraps,
          exitPos,
          gridSize
        );

        if (turn2Result.playerEscaped) {
          turn2CanEscape = true;
          safeMovesInTurn2++;
        } else if (!turn2Result.playerCaught) {
          safeMovesInTurn2++;
        }
      }
    }

    // Heavy penalty if player has 0 escape options in next turn
    if (safeMovesInTurn2 === 0) {
      score -= 5000;
    } else {
      score += safeMovesInTurn2 * 35;
    }

    if (turn2CanEscape) {
      score += 2000;
    }

    // If action is 'wait', slight penalty unless it specifically traps/crushes a mummy or avoids danger
    if (dir === 'wait' && turn1Result.mummiesDestroyedCount === 0) {
      score -= 10;
    }

    // Formulate tactical explanation
    let reason = '';
    const safety: 'safe' | 'risky' = safeMovesInTurn2 > 0 && minMummyDist > 1 ? 'safe' : 'risky';

    if (dir === 'wait') {
      if (turn1Result.mummiesDestroyedCount > 0) {
        reason = 'Đứng yên (Bỏ lượt) để dụ xác ướp tự đâm vào bẫy/tường!';
      } else {
        reason = 'Đứng yên né nhịp di chuyển của quái vật.';
      }
    } else {
      if (turn1Result.nextKeys.some((k, idx) => k.collected && !keys[idx]?.collected)) {
        reason = 'Di chuyển nhặt chìa khóa giải phóng lối đi!';
      } else if (goalDist < (distToGoal[playerPos.x]?.[playerPos.y] ?? 99)) {
        reason = 'Rút ngắn khoảng cách về phía lối thoát an toàn.';
      } else {
        reason = 'Tạo khoảng cách an toàn với xác ướp lân cận.';
      }
    }

    evaluations.push({
      dir,
      targetPos: simTargetPos,
      safety,
      score,
      reason,
    });
  }

  // If no legal evaluations exist, default to current pos
  if (evaluations.length === 0) {
    return {
      bestDir: 'wait',
      targetPos: { ...playerPos },
      isWait: true,
      safetyScore: 0,
      reason: 'Không có đường di chuyển hợp lệ.',
      isWinningMove: false,
      allEvaluations: [],
    };
  }

  // Sort by score descending
  evaluations.sort((a, b) => b.score - a.score);
  const best = evaluations[0];

  return {
    bestDir: best.dir,
    targetPos: best.targetPos,
    isWait: best.dir === 'wait',
    safetyScore: best.score,
    reason: best.reason,
    isWinningMove: best.safety === 'winning',
    allEvaluations: evaluations,
  };
}
