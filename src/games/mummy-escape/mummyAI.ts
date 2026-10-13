import { MummyEntity, Position, Gate, TrapItem, KeyItem, Direction, MummyThreatPath } from './types';
import { hasWallBetween } from './levels';

export interface TurnSimulationResult {
  nextPlayerPos: Position;
  nextPlayerFacing: Direction;
  nextMummies: MummyEntity[];
  nextGates: Gate[];
  nextKeys: KeyItem[];
  nextTraps: TrapItem[];
  playerCaught: boolean;
  playerEscaped: boolean;
  mummiesDestroyedCount: number;
  events: Array<{
    type: 'step' | 'mummy_step' | 'mummy_crush' | 'key_pickup' | 'gate_open' | 'trap_trigger' | 'caught' | 'escape';
    mummyId?: string;
    pos?: Position;
    message?: string;
  }>;
}

export function simulatePlayerAndMummiesTurn(
  playerPos: Position,
  moveDir: Direction,
  mummies: MummyEntity[],
  hWalls: Array<[number, number]>,
  vWalls: Array<[number, number]>,
  gates: Gate[] = [],
  keys: KeyItem[] = [],
  traps: TrapItem[] = [],
  exitPos: Position,
  gridSize: { cols: number; rows: number } = { cols: 6, rows: 6 }
): TurnSimulationResult {
  const { cols, rows } = gridSize;
  const events: TurnSimulationResult['events'] = [];
  let nextPlayerPos = { ...playerPos };
  let nextPlayerFacing: Direction = moveDir === 'wait' ? 'down' : moveDir;
  let nextGates = gates.map((g) => ({ ...g }));
  let nextKeys = keys.map((k) => ({ ...k }));
  let nextTraps = traps.map((t) => ({ ...t }));
  let nextMummies = mummies.map((m) => ({ ...m }));
  let playerCaught = false;
  let playerEscaped = false;
  let mummiesDestroyedCount = 0;

  // 1. Player Movement
  if (moveDir !== 'wait') {
    let targetX = playerPos.x;
    let targetY = playerPos.y;
    if (moveDir === 'up') targetY -= 1;
    if (moveDir === 'down') targetY += 1;
    if (moveDir === 'left') targetX -= 1;
    if (moveDir === 'right') targetX += 1;

    // Check if movement is valid (no wall between)
    const isBlocked = hasWallBetween(playerPos.x, playerPos.y, targetX, targetY, hWalls, vWalls, nextGates, cols, rows);
    if (!isBlocked && targetX >= 0 && targetX < cols && targetY >= 0 && targetY < rows) {
      nextPlayerPos = { x: targetX, y: targetY };
      events.push({ type: 'step', pos: nextPlayerPos });
    }
  }

  // Check key pickups by player
  nextKeys.forEach((key) => {
    if (!key.collected && key.x === nextPlayerPos.x && key.y === nextPlayerPos.y) {
      key.collected = true;
      // Open corresponding gates
      nextGates.forEach((gate) => {
        if (gate.color === key.color) {
          gate.isOpen = true;
        }
      });
      events.push({ type: 'key_pickup', pos: { x: key.x, y: key.y }, message: `Nhặt chìa khóa ${key.color}!` });
      events.push({ type: 'gate_open', message: `Cổng ${key.color} đã mở!` });
    }
  });

  // Check if player reached exit stairs before mummies move
  if (nextPlayerPos.x === exitPos.x && nextPlayerPos.y === exitPos.y) {
    playerEscaped = true;
    events.push({ type: 'escape', pos: exitPos });
    return {
      nextPlayerPos,
      nextPlayerFacing,
      nextMummies,
      nextGates,
      nextKeys,
      nextTraps,
      playerCaught: false,
      playerEscaped: true,
      mummiesDestroyedCount: 0,
      events,
    };
  }

  // 2. Mummies Movement (Turn-based AI simulation)
  // Max sub-steps in one turn: 2 sub-steps for White/Red mummy, 1 sub-step for Scorpion
  const maxSubSteps = 2;

  for (let subStep = 0; subStep < maxSubSteps; subStep++) {
    for (let i = 0; i < nextMummies.length; i++) {
      const mummy = nextMummies[i];
      if (!mummy.alive) continue;

      // Scorpion only moves on subStep 0
      if (mummy.type === 'scorpion' && subStep > 0) continue;

      let movedThisSubStep = false;
      let newX = mummy.x;
      let newY = mummy.y;
      let facing: Direction = mummy.facing || 'down';

      if (mummy.type === 'white' || mummy.type === 'scorpion') {
        // Horizontal priority first
        if (nextPlayerPos.x !== mummy.x) {
          const dx = nextPlayerPos.x > mummy.x ? 1 : -1;
          const candidateX = mummy.x + dx;
          const blocked = hasWallBetween(mummy.x, mummy.y, candidateX, mummy.y, hWalls, vWalls, nextGates, cols, rows);
          if (!blocked) {
            newX = candidateX;
            facing = dx > 0 ? 'right' : 'left';
            movedThisSubStep = true;
          }
        }

        // If horizontal blocked or already on same X, try vertical
        if (!movedThisSubStep && nextPlayerPos.y !== mummy.y) {
          const dy = nextPlayerPos.y > mummy.y ? 1 : -1;
          const candidateY = mummy.y + dy;
          const blocked = hasWallBetween(mummy.x, mummy.y, mummy.x, candidateY, hWalls, vWalls, nextGates, cols, rows);
          if (!blocked) {
            newY = candidateY;
            facing = dy > 0 ? 'down' : 'up';
            movedThisSubStep = true;
          }
        }
      } else if (mummy.type === 'red') {
        // Red Mummy: Vertical priority first!
        if (nextPlayerPos.y !== mummy.y) {
          const dy = nextPlayerPos.y > mummy.y ? 1 : -1;
          const candidateY = mummy.y + dy;
          const blocked = hasWallBetween(mummy.x, mummy.y, mummy.x, candidateY, hWalls, vWalls, nextGates, cols, rows);
          if (!blocked) {
            newY = candidateY;
            facing = dy > 0 ? 'down' : 'up';
            movedThisSubStep = true;
          }
        }

        // If vertical blocked or already on same Y, try horizontal
        if (!movedThisSubStep && nextPlayerPos.x !== mummy.x) {
          const dx = nextPlayerPos.x > mummy.x ? 1 : -1;
          const candidateX = mummy.x + dx;
          const blocked = hasWallBetween(mummy.x, mummy.y, candidateX, mummy.y, hWalls, vWalls, nextGates, cols, rows);
          if (!blocked) {
            newX = candidateX;
            facing = dx > 0 ? 'right' : 'left';
            movedThisSubStep = true;
          }
        }
      }

      if (movedThisSubStep) {
        mummy.x = newX;
        mummy.y = newY;
        mummy.facing = facing;
        events.push({ type: 'mummy_step', mummyId: mummy.id, pos: { x: newX, y: newY } });

        // Check if mummy caught player
        if (mummy.x === nextPlayerPos.x && mummy.y === nextPlayerPos.y) {
          playerCaught = true;
          events.push({ type: 'caught', mummyId: mummy.id, pos: nextPlayerPos });
          return {
            nextPlayerPos,
            nextPlayerFacing,
            nextMummies,
            nextGates,
            nextKeys,
            nextTraps,
            playerCaught: true,
            playerEscaped: false,
            mummiesDestroyedCount,
            events,
          };
        }

        // Check trap collisions
        nextTraps.forEach((trap) => {
          if (trap.x === mummy.x && trap.y === mummy.y && !trap.triggered) {
            mummy.alive = false;
            if (trap.type === 'spikes') {
              trap.triggered = true;
            }
            mummiesDestroyedCount++;
            events.push({
              type: 'trap_trigger',
              mummyId: mummy.id,
              pos: { x: trap.x, y: trap.y },
              message: `Xác ướp đã sập bẫy ${trap.type === 'pit' ? 'Hố Cát' : 'Bàn Chông'}!`,
            });
          }
        });
      }
    }

    // Check mummy-to-mummy collisions (when 2 or more mummies occupy the same tile)
    const positionMap = new Map<string, MummyEntity[]>();
    for (const m of nextMummies) {
      if (!m.alive) continue;
      const key = `${m.x},${m.y}`;
      if (!positionMap.has(key)) positionMap.set(key, []);
      positionMap.get(key)!.push(m);
    }

    positionMap.forEach((mList, posKey) => {
      if (mList.length > 1) {
        // Collision! Mummies crash into each other and turn into dust
        const [cx, cy] = posKey.split(',').map(Number);
        mList.forEach((m) => {
          m.alive = false;
          mummiesDestroyedCount++;
        });
        events.push({
          type: 'mummy_crush',
          pos: { x: cx, y: cy },
          message: `Các xác ướp đã va chạm và tan biến thành cát bụi! (+${mList.length * 150} Điểm)`,
        });
      }
    });
  }

  return {
    nextPlayerPos,
    nextPlayerFacing,
    nextMummies,
    nextGates,
    nextKeys,
    nextTraps,
    playerCaught,
    playerEscaped,
    mummiesDestroyedCount,
    events,
  };
}

/**
 * Calculates the predicted next-turn path for all living mummies (and identifies the nearest one)
 * to render danger warning path indicators on the board grid.
 */
export function calculateMummyThreatPaths(
  playerPos: Position,
  mummies: MummyEntity[],
  hWalls: Array<[number, number]>,
  vWalls: Array<[number, number]>,
  gates: Gate[] = [],
  gridSize: { cols: number; rows: number } = { cols: 6, rows: 6 }
): MummyThreatPath[] {
  const { cols, rows } = gridSize;
  const aliveMummies = mummies.filter((m) => m.alive);
  if (aliveMummies.length === 0) return [];

  // Find nearest mummy based on Manhattan distance
  let minDistance = Infinity;
  let nearestId = '';

  aliveMummies.forEach((m) => {
    const dist = Math.abs(m.x - playerPos.x) + Math.abs(m.y - playerPos.y);
    if (dist < minDistance) {
      minDistance = dist;
      nearestId = m.id;
    }
  });

  const threatPaths: MummyThreatPath[] = [];

  aliveMummies.forEach((mummy) => {
    const steps: Array<{ from: Position; to: Position; stepIndex: number; facing: Direction }> = [];
    let curX = mummy.x;
    let curY = mummy.y;
    let willCatch = false;
    const maxSubSteps = mummy.type === 'scorpion' ? 1 : 2;

    for (let subStep = 0; subStep < maxSubSteps; subStep++) {
      const fromPos = { x: curX, y: curY };
      let moved = false;
      let nextX = curX;
      let nextY = curY;
      let facing: Direction = mummy.facing || 'down';

      if (mummy.type === 'white' || mummy.type === 'scorpion') {
        // Horizontal first
        if (playerPos.x !== curX) {
          const dx = playerPos.x > curX ? 1 : -1;
          const candidateX = curX + dx;
          const blocked = hasWallBetween(curX, curY, candidateX, curY, hWalls, vWalls, gates, cols, rows);
          if (!blocked) {
            nextX = candidateX;
            facing = dx > 0 ? 'right' : 'left';
            moved = true;
          }
        }

        // Vertical second
        if (!moved && playerPos.y !== curY) {
          const dy = playerPos.y > curY ? 1 : -1;
          const candidateY = curY + dy;
          const blocked = hasWallBetween(curX, curY, curX, candidateY, hWalls, vWalls, gates, cols, rows);
          if (!blocked) {
            nextY = candidateY;
            facing = dy > 0 ? 'down' : 'up';
            moved = true;
          }
        }
      } else if (mummy.type === 'red') {
        // Vertical first
        if (playerPos.y !== curY) {
          const dy = playerPos.y > curY ? 1 : -1;
          const candidateY = curY + dy;
          const blocked = hasWallBetween(curX, curY, curX, candidateY, hWalls, vWalls, gates, cols, rows);
          if (!blocked) {
            nextY = candidateY;
            facing = dy > 0 ? 'down' : 'up';
            moved = true;
          }
        }

        // Horizontal second
        if (!moved && playerPos.x !== curX) {
          const dx = playerPos.x > curX ? 1 : -1;
          const candidateX = curX + dx;
          const blocked = hasWallBetween(curX, curY, candidateX, curY, hWalls, vWalls, gates, cols, rows);
          if (!blocked) {
            nextX = candidateX;
            facing = dx > 0 ? 'right' : 'left';
            moved = true;
          }
        }
      }

      if (moved) {
        curX = nextX;
        curY = nextY;
        steps.push({
          from: fromPos,
          to: { x: curX, y: curY },
          stepIndex: subStep + 1,
          facing,
        });

        if (curX === playerPos.x && curY === playerPos.y) {
          willCatch = true;
          break; // stops if it reaches player
        }
      } else {
        // Blocked, can't move further this turn
        break;
      }
    }

    threatPaths.push({
      mummyId: mummy.id,
      type: mummy.type,
      currentPos: { x: mummy.x, y: mummy.y },
      steps,
      finalPos: { x: curX, y: curY },
      isNearest: mummy.id === nearestId,
      willCatchPlayer: willCatch,
    });
  });

  return threatPaths;
}

