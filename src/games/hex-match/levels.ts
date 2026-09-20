import { LevelConfig, HEX_COLORS, TileColor, ObstacleType, GameplayType } from './types';

const [CYAN, ROSE, PURPLE, AMBER, EMERALD, ORANGE] = HEX_COLORS;

// Chapter titles
const CHAPTER_TITLES = [
  'Vườn Kẹo Ngọt',
  'Băng Bắc Cực',
  'Xưởng Chocolate',
  'Lâu Đài Quà Tặng',
  'Đua Tốc Độ Kẹo',
  'Đảo Cầu Vồng',
  'Hẻm Núi Ngọt Ngào',
  'Đầm Lầy Thạch Dẻo',
  'Lâu Đài Pha Lê',
  'Đỉnh Núi Kẹo Bông',
  'Rừng Kẹo Thần Bí',
  'Thung Lũng Núi Lửa',
  'Vương Quốc Hoàng Gia',
  'Vũ Trụ Kẹo Ngọt',
  'Đại Thử Thách Tối Thượng',
];

// Helper to generate board obstacle presets deterministically based on level seed and exact target requirements
function generateObstaclePreset(
  levelId: number,
  gameplayType: GameplayType,
  requestedObstacles?: { ice?: number; stone?: number; chain?: number }
): { obstacles: { r: number; c: number; type: ObstacleType }[] } | undefined {
  const obstacles: { r: number; c: number; type: ObstacleType }[] = [];
  const ROWS = 8;
  const COLS = 7;
  const occupied = new Set<string>();

  const placeObstacle = (type: ObstacleType, count: number, startOffset: number) => {
    let placed = 0;
    // Prioritize center-friendly accessible coordinates (rows 2-5, cols 1-5), then expand
    const candidatePositions: { r: number; c: number }[] = [];
    for (let r = 2; r <= 5; r++) {
      for (let c = 1; c <= 5; c++) {
        candidatePositions.push({ r, c });
      }
    }
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!candidatePositions.some((p) => p.r === r && p.c === c)) {
          candidatePositions.push({ r, c });
        }
      }
    }

    // Deterministically shuffle candidates based on levelId and offset
    const shuffled = [...candidatePositions].sort((a, b) => {
      const hashA = (a.r * 19 + a.c * 37 + levelId * 11 + startOffset * 23) % 1000;
      const hashB = (b.r * 19 + b.c * 37 + levelId * 11 + startOffset * 23) % 1000;
      return hashA - hashB;
    });

    for (const pos of shuffled) {
      if (placed >= count) break;
      const key = `${pos.r},${pos.c}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        obstacles.push({ r: pos.r, c: pos.c, type });
        placed++;
      }
    }
  };

  if (gameplayType === 'rescue') {
    const iceCount = requestedObstacles?.ice || 6;
    placeObstacle('ice', iceCount, 0);
  } else if (gameplayType === 'chocolate') {
    const stoneCount = requestedObstacles?.stone || 5;
    placeObstacle('stone', stoneCount, 1);
  } else if (gameplayType === 'gift') {
    const chainCount = requestedObstacles?.chain || 4;
    placeObstacle('chain', chainCount, 2);
  } else if (gameplayType === 'boss') {
    const iceCount = requestedObstacles?.ice || 6;
    const stoneCount = requestedObstacles?.stone || 4;
    placeObstacle('ice', iceCount, 3);
    placeObstacle('stone', stoneCount, 4);
  }

  return obstacles.length > 0 ? { obstacles } : undefined;
}

// Generate the 150 Level Collection with balanced gameplay modes and progressive difficulty
function buildAll150Levels(): LevelConfig[] {
  const levels: LevelConfig[] = [];

  // Gameplay mode cycle patterns with gradual introductions
  const modePool: GameplayType[] = ['moves', 'rescue', 'time', 'chocolate', 'moves', 'gift', 'rescue', 'time', 'chocolate', 'boss'];

  for (let i = 1; i <= 150; i++) {
    const chapterIndex = Math.floor((i - 1) / 10);
    const chapterName = CHAPTER_TITLES[chapterIndex] || `Chương ${chapterIndex + 1}`;
    const levelInChapter = ((i - 1) % 10) + 1;

    // Determine gameplay type
    let gameplayType: GameplayType = modePool[(i - 1) % modePool.length];
    if (i <= 3) gameplayType = 'moves'; // First 3 are gentle moves tutorials
    if (i === 4 || i === 5) gameplayType = 'rescue'; // Introduce Ice Bear rescue
    if (i === 10) gameplayType = 'boss';
    if (i % 10 === 0) gameplayType = 'boss'; // Every 10th level is a boss challenge

    // Color palette progression (3 colors early on -> 6 colors later)
    let availableColors: TileColor[] = [CYAN, ROSE, AMBER];
    if (i >= 4 && i <= 15) availableColors = [CYAN, ROSE, AMBER, EMERALD];
    else if (i > 15 && i <= 40) availableColors = [CYAN, ROSE, PURPLE, AMBER, EMERALD];
    else if (i > 40) availableColors = [CYAN, ROSE, PURPLE, AMBER, EMERALD, ORANGE];

    // Moves and Time calculation based on difficulty
    const baseMoves = Math.max(18, 30 - Math.floor(i / 15));
    const timeLimit = Math.max(45, 80 - Math.floor(i / 20) * 5); // 45s to 80s

    // Star score thresholds
    const baseScore = 1200 + i * 180;
    const stars: [number, number, number] = [
      baseScore,
      Math.round(baseScore * 1.8),
      Math.round(baseScore * 2.7),
    ];

    // Subtitle, Targets & Preset Obstacles
    let subtitle = '';
    const targets: LevelConfig['targets'] = [];
    let boardPreset: { obstacles?: { r: number; c: number; type: ObstacleType }[] } | undefined = undefined;

    if (gameplayType === 'moves') {
      const color1 = availableColors[(i) % availableColors.length];
      const color2 = availableColors[(i + 2) % availableColors.length];
      const qty = 15 + Math.floor(i * 0.4);
      subtitle = `Thu thập kẹo ngọt trong ${baseMoves} lượt đi`;
      targets.push({
        type: 'collect_color',
        current: 0,
        target: qty,
        color: color1,
        label: `Kẹo ${color1}`,
      });
      if (i > 8) {
        targets.push({
          type: 'collect_color',
          current: 0,
          target: Math.round(qty * 0.8),
          color: color2,
          label: `Kẹo ${color2}`,
        });
      }
      targets.push({
        type: 'score',
        current: 0,
        target: baseScore,
        label: `Đạt ${baseScore.toLocaleString()} điểm`,
      });
    } else if (gameplayType === 'time') {
      subtitle = `⚡ Đua thời gian! Hoàn thành trong ${timeLimit} giây`;
      const ptsTarget = Math.round(baseScore * 1.2);
      targets.push({
        type: 'score',
        current: 0,
        target: ptsTarget,
        label: `Đạt ${ptsTarget.toLocaleString()} điểm`,
      });
      const colorTarget = availableColors[i % availableColors.length];
      targets.push({
        type: 'collect_color',
        current: 0,
        target: 12 + Math.floor(i * 0.25),
        color: colorTarget,
        label: `Kẹo ${colorTarget}`,
      });
    } else if (gameplayType === 'rescue') {
      // Ice count strictly synced between targets and board preset
      const iceCount = Math.min(14, 4 + Math.floor(i / 10) * 2);
      subtitle = `Giải cứu ${iceCount} chú Gấu Dẻo bị đóng băng!`;
      targets.push({
        type: 'clear_ice',
        current: 0,
        target: iceCount,
        label: `Phá ${iceCount} ô Băng Gấu`,
      });
      targets.push({
        type: 'score',
        current: 0,
        target: baseScore,
        label: `Đạt ${baseScore.toLocaleString()} điểm`,
      });
      boardPreset = generateObstaclePreset(i, 'rescue', { ice: iceCount });
    } else if (gameplayType === 'chocolate') {
      const stoneCount = Math.min(12, 4 + Math.floor(i / 12) * 2);
      subtitle = `Đập vỡ ${stoneCount} khối Chocolate Waffle!`;
      targets.push({
        type: 'clear_stone',
        current: 0,
        target: stoneCount,
        label: `Đập ${stoneCount} Chocolate`,
      });
      const colorTarget = availableColors[(i + 1) % availableColors.length];
      targets.push({
        type: 'collect_color',
        current: 0,
        target: 15 + Math.floor(i * 0.3),
        color: colorTarget,
        label: `Kẹo ${colorTarget}`,
      });
      boardPreset = generateObstaclePreset(i, 'chocolate', { stone: stoneCount });
    } else if (gameplayType === 'gift') {
      const chainCount = Math.min(10, 3 + Math.floor(i / 14) * 2);
      subtitle = `Mở khóa ${chainCount} Nơ Quà Vàng!`;
      targets.push({
        type: 'clear_chain',
        current: 0,
        target: chainCount,
        label: `Mở ${chainCount} Nơ Quà`,
      });
      targets.push({
        type: 'score',
        current: 0,
        target: baseScore,
        label: `Đạt ${baseScore.toLocaleString()} điểm`,
      });
      boardPreset = generateObstaclePreset(i, 'gift', { chain: chainCount });
    } else if (gameplayType === 'boss') {
      subtitle = `👑 Màn Đại Thử Thách Chương: Phá Băng & Chocolate!`;
      const iceQty = Math.min(8, 4 + Math.floor(i / 20) * 2);
      const chocoQty = Math.min(6, 3 + Math.floor(i / 20) * 2);
      targets.push({
        type: 'clear_ice',
        current: 0,
        target: iceQty,
        label: `Phá ${iceQty} Băng`,
      });
      targets.push({
        type: 'clear_stone',
        current: 0,
        target: chocoQty,
        label: `Đập ${chocoQty} Chocolate`,
      });
      targets.push({
        type: 'score',
        current: 0,
        target: Math.round(baseScore * 1.5),
        label: `Đạt ${(Math.round(baseScore * 1.5)).toLocaleString()} điểm`,
      });
      boardPreset = generateObstaclePreset(i, 'boss', { ice: iceQty, stone: chocoQty });
    }

    levels.push({
      id: i,
      name: `Màn ${i}: ${chapterName} (${levelInChapter}/10)`,
      subtitle,
      gameplayType,
      moves: gameplayType === 'time' ? undefined : baseMoves,
      timeLimit: gameplayType === 'time' ? timeLimit : undefined,
      stars,
      colors: availableColors,
      targets,
      boardPreset,
    });
  }

  return levels;
}

export const HEX_LEVELS: LevelConfig[] = buildAll150Levels();
