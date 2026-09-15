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

// Helper to generate board obstacle presets deterministically based on level seed
function generateObstaclePreset(levelId: number, gameplayType: GameplayType) {
  const obstacles: { r: number; c: number; type: ObstacleType }[] = [];
  const ROWS = 8;
  const COLS = 7;

  if (gameplayType === 'rescue') {
    // Ice count scales with level (4 up to 16)
    const count = Math.min(18, 4 + Math.floor(levelId / 10) * 2);
    // Center cluster or ring
    for (let i = 0; i < count; i++) {
      const r = 2 + ((i + levelId) % (ROWS - 4));
      const c = 1 + ((i * 2 + Math.floor(levelId / 3)) % (COLS - 2));
      if (!obstacles.some((o) => o.r === r && o.c === c)) {
        obstacles.push({ r, c, type: 'ice' });
      }
    }
  } else if (gameplayType === 'chocolate') {
    // Stone / Waffle chocolate blocks (3 up to 14)
    const count = Math.min(14, 3 + Math.floor(levelId / 12) * 2);
    for (let i = 0; i < count; i++) {
      const r = 1 + ((i * 2 + levelId) % (ROWS - 2));
      const c = 1 + ((i * 3 + levelId) % (COLS - 2));
      if (!obstacles.some((o) => o.r === r && o.c === c)) {
        obstacles.push({ r, c, type: 'stone' });
      }
    }
  } else if (gameplayType === 'gift') {
    // Chain / Gift ribbons
    const count = Math.min(12, 3 + Math.floor(levelId / 15) * 2);
    for (let i = 0; i < count; i++) {
      const r = 2 + ((i + levelId * 2) % (ROWS - 3));
      const c = ((i * 2 + levelId) % COLS);
      if (!obstacles.some((o) => o.r === r && o.c === c)) {
        obstacles.push({ r, c, type: 'chain' });
      }
    }
  } else if (gameplayType === 'boss') {
    // Mixed hazards
    for (let r = 2; r <= 5; r++) {
      for (let c = 1; c <= 5; c++) {
        if ((r + c + levelId) % 3 === 0) {
          obstacles.push({ r, c, type: 'ice' });
        } else if ((r + c + levelId) % 5 === 0) {
          obstacles.push({ r, c, type: 'stone' });
        } else if ((r + c + levelId) % 4 === 0) {
          obstacles.push({ r, c, type: 'chain' });
        }
      }
    }
  }

  return obstacles.length > 0 ? { obstacles } : undefined;
}

// Generate the 150 Level Collection with randomized/shuffled gameplay modes and progressive difficulty
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
    if (i === 4 || i === 5) gameplayType = 'rescue'; // Introduce Ice
    if (i === 10) gameplayType = 'boss';
    if (i % 10 === 0) gameplayType = 'boss'; // Every 10th level is a boss challenge

    // Color palette progression (3 colors early on -> 6 colors later)
    let availableColors: TileColor[] = [CYAN, ROSE, AMBER];
    if (i >= 4 && i <= 15) availableColors = [CYAN, ROSE, AMBER, EMERALD];
    else if (i > 15 && i <= 40) availableColors = [CYAN, ROSE, PURPLE, AMBER, EMERALD];
    else if (i > 40) availableColors = [CYAN, ROSE, PURPLE, AMBER, EMERALD, ORANGE];

    // Moves and Time calculation based on difficulty
    const baseMoves = Math.max(16, 28 - Math.floor(i / 15));
    const timeLimit = Math.max(40, 75 - Math.floor(i / 20) * 5); // 40s to 75s

    // Star score thresholds
    const baseScore = 1200 + i * 180;
    const stars: [number, number, number] = [
      baseScore,
      Math.round(baseScore * 1.8),
      Math.round(baseScore * 2.7),
    ];

    // Subtitle & Targets
    let subtitle = '';
    const targets: LevelConfig['targets'] = [];

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
      const iceCount = Math.min(18, 6 + Math.floor(i / 8) * 2);
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
    } else if (gameplayType === 'chocolate') {
      const stoneCount = Math.min(16, 5 + Math.floor(i / 10) * 2);
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
    } else if (gameplayType === 'gift') {
      const chainCount = Math.min(14, 4 + Math.floor(i / 12) * 2);
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
    } else if (gameplayType === 'boss') {
      subtitle = `👑 Màn Đại Thử Thách Chương: Phá Băng & Chocolate!`;
      const iceQty = 8 + Math.floor(i / 15) * 2;
      const chocoQty = 6 + Math.floor(i / 15) * 2;
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
      boardPreset: generateObstaclePreset(i, gameplayType),
    });
  }

  return levels;
}

export const HEX_LEVELS: LevelConfig[] = buildAll150Levels();
