import {
  LevelData,
  Position,
  MummyType,
  Gate,
  KeyItem,
  TrapItem,
  ProceduralGenerationOptions,
  MapSizePreset,
  ChamberArchetype,
} from './types';
import { hasWallBetween } from './levels';
import { findEscapeTurns } from './escapeSolver';

// Seeded PRNG (Mulberry32)
function createPRNG(seedStr: string | number) {
  let seed = 0;
  if (typeof seedStr === 'string') {
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    }
  } else {
    seed = Math.floor(Math.abs(seedStr)) >>> 0;
  }
  if (seed === 0) seed = 123456789;

  return function next(): number {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ARCHETYPE_NAMES: Record<ChamberArchetype, { name: string; prefix: string; tip: string }> = {
  labyrinth: {
    name: 'Mê Cung Bụi Cát',
    prefix: 'Mê Cung Quanh Co',
    tip: 'Tận dụng các ngã rẽ và vòng cung để tách xác ướp trắng và đỏ ra các lối đi khác nhau.',
  },
  pillars_of_karnak: {
    name: 'Điện Thờ Thạch Trụ',
    prefix: 'Hàng Cột Karnak',
    tip: 'Vòng qua các trụ đá lớn để khiến xác ướp bị khựng lại bởi quy tắc ưu tiên di chuyển.',
  },
  gauntlet_of_traps: {
    name: 'Hành Lang Lưỡi Dao',
    prefix: 'Thử Thách Bẫy Cổ',
    tip: 'Dụ xác ướp bước thẳng vào hố cát lún hoặc bàn chông để tiêu diệt chúng vĩnh viễn!',
  },
  royal_vault: {
    name: 'Hầm Kho Báu Hoàng Gia',
    prefix: 'Lăng Tẩm Pharaoh',
    tip: 'Tìm chìa khóa ở các góc phòng để mở cổng phong ấn trước khi tiến về cầu thang thoát hiểm.',
  },
  scorpion_nest: {
    name: 'Tổ Bọ Cạp Sa Mạc',
    prefix: 'Hầm Độc Bọ Cạp',
    tip: 'Bọ cạp di chuyển chậm 1 bước nhưng rất khó đoán. Hãy giữ khoảng cách an toàn.',
  },
  twin_crypts: {
    name: 'Song Hầm Đối Xứng',
    prefix: 'Mộ Đôi Tử Thần',
    tip: 'Di chuyển khéo léo giữa hai gian phòng để khiến các xác ướp va chạm vào nhau.',
  },
};

const PHARAOH_TITLES = [
  'Ramesses',
  'Tutankhamun',
  'Anubis',
  'Osiris',
  'Horus',
  'Cleopatra',
  'Nefertiti',
  'Seti',
  'Khufu',
  'Sobek',
  'Thutmose',
  'Hatshepsut',
];

/**
 * Validates whether a generated grid layout is solvable using Breadth-First Search (BFS)
 */
function isGridSolvable(
  cols: number,
  rows: number,
  start: Position,
  exit: Position,
  hWalls: Array<[number, number]>,
  vWalls: Array<[number, number]>,
  keys: KeyItem[] = [],
  gates: Gate[] = []
): { solvable: boolean; shortestPath: number } {
  // Check if player start has walkable space
  const getNeighbors = (pos: Position, currentGates: Gate[]): Position[] => {
    const res: Position[] = [];
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];
    for (const d of dirs) {
      const nx = pos.x + d.dx;
      const ny = pos.y + d.dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        if (!hasWallBetween(pos.x, pos.y, nx, ny, hWalls, vWalls, currentGates, cols, rows)) {
          res.push({ x: nx, y: ny });
        }
      }
    }
    return res;
  };

  // Helper BFS distance finder
  const bfsDistance = (from: Position, to: Position, activeGates: Gate[]): number => {
    const queue: Array<{ pos: Position; dist: number }> = [{ pos: from, dist: 0 }];
    const visited = new Set<string>();
    visited.add(`${from.x},${from.y}`);

    while (queue.length > 0) {
      const { pos, dist } = queue.shift()!;
      if (pos.x === to.x && pos.y === to.y) return dist;

      const neighbors = getNeighbors(pos, activeGates);
      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ pos: n, dist: dist + 1 });
        }
      }
    }
    return -1;
  };

  // If there are keys, player must reach keys first, then reach exit with open gates
  if (keys.length > 0) {
    let totalDist = 0;
    let currentPos = start;

    // Check path to all keys (with initial closed gates)
    for (const key of keys) {
      const d = bfsDistance(currentPos, { x: key.x, y: key.y }, gates);
      if (d === -1) return { solvable: false, shortestPath: -1 };
      totalDist += d;
      currentPos = { x: key.x, y: key.y };
    }

    // Now all gates open
    const openGates = gates.map((g) => ({ ...g, isOpen: true }));
    const exitDist = bfsDistance(currentPos, exit, openGates);
    if (exitDist === -1) return { solvable: false, shortestPath: -1 };
    totalDist += exitDist;

    return { solvable: true, shortestPath: totalDist };
  } else {
    // No keys, direct path with closed gates (if any)
    const dist = bfsDistance(start, exit, gates);
    return { solvable: dist !== -1, shortestPath: dist };
  }
}

/**
 * Master Procedural Chamber Generator
 * Creates unique, non-repeating Egyptian puzzle dungeons with dynamic sizes, archetypes, and traps.
 */
export function generateProceduralChamber(
  floorOrOptions: number | ProceduralGenerationOptions = {}
): LevelData {
  const options: ProceduralGenerationOptions =
    typeof floorOrOptions === 'number' ? { floor: floorOrOptions } : floorOrOptions;

  const seedString = options.seed
    ? String(options.seed)
    : `${Date.now()}-${Math.random()}`;
  const rng = createPRNG(seedString);

  const floor = options.floor || 1;

  // 1. Resolve Grid Dimensions (5x5, 6x6, 7x7, 8x8, or auto-scaled)
  let cols = 6;
  let rows = 6;

  if (options.cols && options.rows) {
    cols = Math.max(5, Math.min(8, options.cols));
    rows = Math.max(5, Math.min(8, options.rows));
  } else if (options.sizePreset) {
    switch (options.sizePreset) {
      case '5x5':
      case 'compact_5x5':
        cols = 5;
        rows = 5;
        break;
      case '6x6':
      case 'standard_6x6':
        cols = 6;
        rows = 6;
        break;
      case '7x7':
      case 'large_7x7':
        cols = 7;
        rows = 7;
        break;
      case '8x8':
      case 'grand_8x8':
        cols = 8;
        rows = 8;
        break;
      case 'random':
        const sizes = [5, 6, 7, 8];
        cols = sizes[Math.floor(rng() * sizes.length)];
        rows = cols;
        break;
    }
  } else {
    // Floor-based progressive scaling
    if (floor <= 2) {
      cols = 5;
      rows = 5;
    } else if (floor <= 7) {
      cols = 6;
      rows = 6;
    } else if (floor <= 12) {
      cols = 7;
      rows = 7;
    } else {
      cols = 8;
      rows = 8;
    }
  }

  // 2. Resolve Chamber Archetype
  const archetypes: ChamberArchetype[] = [
    'labyrinth',
    'pillars_of_karnak',
    'gauntlet_of_traps',
    'royal_vault',
    'scorpion_nest',
    'twin_crypts',
  ];

  const archetype: ChamberArchetype =
    options.archetype ||
    archetypes[Math.floor(rng() * archetypes.length)];

  const archetypeMeta = ARCHETYPE_NAMES[archetype];
  const pharaoh = PHARAOH_TITLES[Math.floor(rng() * PHARAOH_TITLES.length)];

  // 3. Attempt Generation with Solvability Guarantee (up to 25 attempts)
  let bestLevel: LevelData | null = null;

  for (let attempt = 0; attempt < 25; attempt++) {
    const hWalls: Array<[number, number]> = [];
    const vWalls: Array<[number, number]> = [];
    const traps: TrapItem[] = [];
    const keys: KeyItem[] = [];
    const gates: Gate[] = [];
    const mummies: Array<{ type: MummyType; x: number; y: number }> = [];

    // Player Start & Exit Positions (opposite corners or edges)
    const playerStart: Position = { x: 0, y: 0 };
    const exitPos: Position = { x: cols - 1, y: rows - 1 };

    // Vary exit location slightly on larger boards
    if (cols >= 7 && rng() > 0.5) {
      exitPos.x = cols - 1;
      exitPos.y = Math.floor(rows / 2);
    }

    // Generate Walls according to Chamber Archetype
    if (archetype === 'labyrinth') {
      // Maze with corridor cuts
      const targetWallCount = Math.floor((cols * rows) * 0.45);
      for (let i = 0; i < targetWallCount; i++) {
        const isHoriz = rng() > 0.5;
        if (isHoriz) {
          const wx = Math.floor(rng() * cols);
          const wy = Math.floor(rng() * (rows - 1));
          if ((wx === 0 && wy === 0) || (wx === exitPos.x && wy === exitPos.y - 1)) continue;
          if (!hWalls.some(([x, y]) => x === wx && y === wy)) hWalls.push([wx, wy]);
        } else {
          const vx = Math.floor(rng() * (cols - 1));
          const vy = Math.floor(rng() * rows);
          if ((vx === 0 && vy === 0) || (vx === exitPos.x - 1 && vy === exitPos.y)) continue;
          if (!vWalls.some(([x, y]) => x === vx && y === vy)) vWalls.push([vx, vy]);
        }
      }
    } else if (archetype === 'pillars_of_karnak') {
      // Symmetrical pillar blocks
      const stepX = Math.max(2, Math.floor(cols / 3));
      const stepY = Math.max(2, Math.floor(rows / 3));

      for (let px = 1; px < cols - 1; px += stepX) {
        for (let py = 1; py < rows - 1; py += stepY) {
          // Add small 1-cell or 2-cell pillar barrier
          if (py < rows - 1) hWalls.push([px, py]);
          if (px < cols - 1) vWalls.push([px, py]);
        }
      }
      // Add random perimeter deflectors
      for (let i = 0; i < 4; i++) {
        const wx = Math.floor(rng() * cols);
        const wy = Math.floor(rng() * (rows - 1));
        if (!hWalls.some(([x, y]) => x === wx && y === wy)) hWalls.push([wx, wy]);
      }
    } else if (archetype === 'gauntlet_of_traps') {
      // Zig-zag staggered horizontal lanes
      for (let y = 1; y < rows - 1; y += 2) {
        // Leave opening on left or right
        const openLeft = (y / 2) % 2 === 0;
        for (let x = 0; x < cols; x++) {
          if (openLeft && x === 0) continue;
          if (!openLeft && x === cols - 1) continue;
          hWalls.push([x, y]);
        }
      }
    } else if (archetype === 'royal_vault') {
      // Central vault chamber surrounded by walls with gated entrance
      const midX = Math.floor(cols / 2);
      const midY = Math.floor(rows / 2);

      // Vault perimeter walls
      if (midY > 0) hWalls.push([midX, midY - 1]);
      if (midY < rows - 1) hWalls.push([midX, midY]);
      if (midX > 0) vWalls.push([midX - 1, midY]);

      // Gate at the vault entrance
      gates.push({
        id: `gate-vault-${attempt}`,
        x1: midX,
        y1: midY,
        x2: midX + 1,
        y2: midY,
        color: 'yellow',
        isOpen: false,
      });

      // Key placed in an opposite corner
      keys.push({
        id: `key-vault-${attempt}`,
        x: cols - 1,
        y: 0,
        color: 'yellow',
        collected: false,
      });
    } else if (archetype === 'twin_crypts') {
      // Partition grid vertically down the middle with 1-2 door openings
      const midX = Math.floor(cols / 2) - 1;
      const openGap1 = 1;
      const openGap2 = rows - 2;

      for (let y = 0; y < rows; y++) {
        if (y === openGap1 || y === openGap2) continue;
        vWalls.push([midX, y]);
      }

      // Add a couple internal wing walls
      for (let i = 0; i < 4; i++) {
        const wx = Math.floor(rng() * cols);
        const wy = Math.floor(rng() * (rows - 1));
        if (!hWalls.some(([x, y]) => x === wx && y === wy)) hWalls.push([wx, wy]);
      }
    } else if (archetype === 'scorpion_nest') {
      // Irregular scattered walls and traps
      const targetWallCount = Math.floor((cols * rows) * 0.35);
      for (let i = 0; i < targetWallCount; i++) {
        if (rng() > 0.5) {
          const wx = Math.floor(rng() * cols);
          const wy = Math.floor(rng() * (rows - 1));
          if (!hWalls.some(([x, y]) => x === wx && y === wy)) hWalls.push([wx, wy]);
        } else {
          const vx = Math.floor(rng() * (cols - 1));
          const vy = Math.floor(rng() * rows);
          if (!vWalls.some(([x, y]) => x === vx && y === vy)) vWalls.push([vx, vy]);
        }
      }
    }

    // Optional Key & Gate for other archetypes if requested or higher floor
    const shouldAddKey =
      options.includeKeysAndGates !== false &&
      (options.includeKeysAndGates === true || (floor >= 3 && floor % 2 === 1 && archetype !== 'royal_vault'));

    if (shouldAddKey && keys.length === 0) {
      const gateX = Math.floor(cols / 2);
      const gateY = Math.floor(rows / 2);
      gates.push({
        id: `pgate-${attempt}`,
        x1: gateX,
        y1: gateY,
        x2: Math.min(cols - 1, gateX + 1),
        y2: gateY,
        color: 'yellow',
        isOpen: false,
      });

      keys.push({
        id: `pkey-${attempt}`,
        x: cols - 1,
        y: 0,
        color: 'yellow',
        collected: false,
      });
    }

    // Generate Traps (Pits, Spikes, Sarcophagus)
    let trapCount = 0;
    const density = options.trapDensity || (floor >= 5 ? 'medium' : floor >= 2 ? 'low' : 'none');
    if (density === 'low') trapCount = Math.max(1, Math.floor((cols * rows) / 18));
    else if (density === 'medium') trapCount = Math.max(2, Math.floor((cols * rows) / 12));
    else if (density === 'high') trapCount = Math.max(3, Math.floor((cols * rows) / 8));

    for (let t = 0; t < trapCount; t++) {
      const tx = Math.floor(rng() * (cols - 2)) + 1;
      const ty = Math.floor(rng() * (rows - 2)) + 1;

      // Ensure no duplicate trap or spawn on start/exit/keys
      const isStart = tx === playerStart.x && ty === playerStart.y;
      const isExit = tx === exitPos.x && ty === exitPos.y;
      const hasTrapAlready = traps.some((trap) => trap.x === tx && trap.y === ty);
      const isKey = keys.some((k) => k.x === tx && k.y === ty);

      if (!isStart && !isExit && !hasTrapAlready && !isKey) {
        const trapType = rng() > 0.4 ? 'pit' : 'spikes';
        traps.push({
          id: `ptrap-${attempt}-${t}`,
          x: tx,
          y: ty,
          type: trapType,
          triggered: false,
        });
      }
    }

    // Generate Mummies based on Map Size & Difficulty
    let mummyCount = 1;
    const totalTiles = cols * rows;

    if (options.mummyCount !== undefined && options.mummyCount > 0) {
      mummyCount = Math.min(6, Math.max(1, options.mummyCount));
    } else if (options.mummyDifficulty === 'easy') {
      mummyCount = 1;
    } else if (options.mummyDifficulty === 'normal') {
      mummyCount = totalTiles >= 49 ? 3 : 2;
    } else if (options.mummyDifficulty === 'hard') {
      mummyCount = totalTiles >= 64 ? 4 : totalTiles >= 49 ? 3 : 2;
    } else if (options.mummyDifficulty === 'nightmare') {
      mummyCount = totalTiles >= 64 ? 5 : 4;
    } else {
      // Scale naturally with floor & map size
      if (totalTiles <= 25) mummyCount = floor >= 4 ? 2 : 1;
      else if (totalTiles <= 36) mummyCount = floor >= 6 ? 3 : floor >= 3 ? 2 : 1;
      else if (totalTiles <= 49) mummyCount = floor >= 8 ? 4 : floor >= 4 ? 3 : 2;
      else mummyCount = Math.min(5, Math.max(2, 2 + Math.floor(floor / 3)));
    }

    const hasRedMummies = floor >= 2 || options.mummyDifficulty === 'hard' || options.mummyDifficulty === 'nightmare';
    const hasScorpions = floor >= 4 || archetype === 'scorpion_nest' || options.mummyDifficulty === 'nightmare';

    for (let m = 0; m < mummyCount; m++) {
      let mx = Math.floor(rng() * (cols - 2)) + 2;
      let my = Math.floor(rng() * (rows - 2)) + 1;

      // Safe Manhattan distance from player
      const distFromStart = Math.abs(mx - playerStart.x) + Math.abs(my - playerStart.y);
      if (distFromStart < 3) {
        mx = cols - 1 - (m % 2);
        my = Math.min(rows - 1, 2 + m);
      }

      // Avoid spawning directly on exit or duplicate
      if (mx === exitPos.x && my === exitPos.y) mx = Math.max(0, mx - 1);

      let mType: MummyType = 'white';
      if (archetype === 'scorpion_nest' && m === 0) {
        mType = 'scorpion';
      } else if (m === 1 && hasRedMummies) {
        mType = 'red';
      } else if (m === 2 && hasScorpions) {
        mType = 'scorpion';
      } else if (m >= 3 && hasRedMummies) {
        mType = m % 2 === 0 ? 'red' : 'white';
      }

      mummies.push({ type: mType, x: mx, y: my });
    }

    // 4. Solvability Verification via BFS
    const { solvable, shortestPath } = isGridSolvable(
      cols,
      rows,
      playerStart,
      exitPos,
      hWalls,
      vWalls,
      keys,
      gates
    );

    if (solvable && shortestPath > 0) {
      // Calculate realistic Par turns & time limits
      const parTurns = Math.max(8, shortestPath + 3 + mummies.length * 2 + (keys.length > 0 ? 3 : 0));
      const maxTurns = Math.floor(parTurns * 1.6);
      const timeLimitSec = Math.max(35, Math.min(90, shortestPath * 4 + 20));

      const sizeLabel = `${cols}x${rows}`;
      const levelId = 2000 + floor * 10 + attempt;

      const candidate: LevelData = {
        id: levelId,
        name: `${archetypeMeta.name} (#${floor})`,
        pyramidName: `Lăng Mộ ${pharaoh} (${sizeLabel} - ${archetypeMeta.prefix})`,
        gridSize: { cols, rows },
        playerStart,
        exitPos,
        exitDirection: 'right',
        mummies,
        horizontalWalls: hWalls,
        verticalWalls: vWalls,
        gates: gates.length > 0 ? gates : undefined,
        keys: keys.length > 0 ? keys : undefined,
        traps: traps.length > 0 ? traps : undefined,
        parTurns,
        maxTurns,
        timeLimitSec,
        hintTip: `${archetypeMeta.tip} [Kích thước: ${sizeLabel} | Bẫy: ${traps.length} | Xác ướp: ${mummies.length}]`,
      };

      // The grid check above ignores mummies; reject layouts where they always catch the player,
      // and make sure par / the turn limit are reachable when the real escape is longer.
      const escapeTurns = findEscapeTurns(candidate);
      if (escapeTurns === null) continue;
      if (typeof escapeTurns === 'number' && escapeTurns > candidate.parTurns) {
        candidate.parTurns = escapeTurns;
        candidate.maxTurns = Math.floor(escapeTurns * 1.6);
      }
      bestLevel = candidate;
      break;
    }
  }

  // Guaranteed fallback if all random attempts were blocked
  return bestLevel ?? fallbackChamber(floor, cols, rows, pharaoh);
}

/** Open fallback chamber used when every random layout was rejected. */
export function fallbackChamber(floor: number, cols: number, rows: number, pharaoh: string): LevelData {
  return {
    id: 3000 + floor,
    name: `Điện Thờ ${pharaoh}`,
    pyramidName: `Mê Cung Bất Tận - Tầng ${floor} (${cols}x${rows})`,
    gridSize: { cols, rows },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: cols - 1, y: rows - 1 },
    exitDirection: 'right',
    mummies: [{ type: 'white', x: cols - 1, y: 0 }],
    horizontalWalls: [[1, 1], [cols - 2, rows - 2]],
    verticalWalls: [[2, 1], [cols - 3, rows - 3]],
    parTurns: cols + rows + 4,
    maxTurns: (cols + rows) * 2,
    timeLimitSec: 45,
    hintTip: 'Hầm mộ thông thoáng. Tận dụng các góc tường để điều hướng xác ướp.',
  };
}
