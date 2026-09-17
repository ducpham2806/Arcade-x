export const THEMES = [
  { name: 'Colors', words: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE', 'BLACK', 'WHITE', 'CYAN', 'MAGENTA', 'TEAL', 'INDIGO', 'MAROON', 'NAVY', 'OLIVE', 'SILVER'] },
  { name: 'Animals', words: ['DOG', 'CAT', 'BIRD', 'FISH', 'LION', 'TIGER', 'BEAR', 'WOLF', 'FOX', 'DEER', 'RABBIT', 'HORSE', 'COW', 'PIG', 'SHEEP', 'GOAT', 'DUCK', 'SWAN', 'EAGLE'] },
  { name: 'Fruits', words: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'MANGO', 'LEMON', 'LIME', 'CHERRY', 'PEACH', 'PEAR', 'PLUM', 'MELON', 'KIWI', 'PAPAYA'] },
  { name: 'Countries', words: ['USA', 'UK', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN', 'JAPAN', 'CHINA', 'INDIA', 'BRAZIL', 'CANADA', 'MEXICO', 'RUSSIA'] },
  { name: 'Sports', words: ['SOCCER', 'TENNIS', 'GOLF', 'BOXING', 'RUGBY', 'TRACK', 'HOCKEY', 'KARATE', 'JUDO', 'SURFING', 'SKIING'] },
  { name: 'Planets', words: ['MERCURY', 'VENUS', 'EARTH', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO'] },
  { name: 'Jobs', words: ['DOCTOR', 'NURSE', 'TEACHER', 'POLICE', 'PILOT', 'CHEF', 'ACTOR', 'SINGER', 'FARMER', 'BAKER', 'JUDGE'] },
  { name: 'Vehicles', words: ['CAR', 'BUS', 'BIKE', 'TRAIN', 'PLANE', 'BOAT', 'SHIP', 'TRUCK', 'TRAM', 'VAN', 'TAXI'] },
  { name: 'Body', words: ['HEAD', 'HAND', 'FOOT', 'ARM', 'LEG', 'EYE', 'EAR', 'NOSE', 'MOUTH', 'HAIR', 'KNEE', 'NECK', 'BACK'] },
  { name: 'Weather', words: ['SUN', 'RAIN', 'WIND', 'SNOW', 'STORM', 'CLOUD', 'FOG', 'HAIL', 'ICE', 'THUNDER', 'MIST'] },
];

const DIRS = [
  [0, 1],   // E
  [1, 0],   // S
  [1, 1],   // SE
  [-1, 1],  // NE
  [0, -1],  // W
  [-1, 0],  // N
  [-1, -1], // NW
  [1, -1]   // SW
];

export const THEME_COLORS = [
  'bg-blue-900', 'bg-emerald-900', 'bg-rose-900', 'bg-amber-900', 'bg-fuchsia-900', 'bg-indigo-900', 'bg-slate-900'
];

export function createSeededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function() {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const generateDailyPuzzle = (dateKey: string) => {
  const rng = createSeededRandom(`wordcross_daily_${dateKey}`);
  
  // Pick 2 mixed themes deterministically for diverse daily challenges
  const t1 = Math.floor(rng() * THEMES.length);
  let t2 = Math.floor(rng() * THEMES.length);
  if (t2 === t1) t2 = (t1 + 1) % THEMES.length;

  const pool = [...THEMES[t1].words, ...THEMES[t2].words];
  // Seeded shuffle pool
  pool.sort(() => rng() - 0.5);

  const wordCount = 7; // Challenging but perfectly balanced for daily play
  const selectedWords = pool.slice(0, wordCount);
  selectedWords.sort((a, b) => b.length - a.length);

  const size = 10;
  const { grid, placedWords } = generateGrid(size, size, selectedWords, rng);

  return {
    id: `daily_${dateKey}`,
    level: 0,
    mode: 'daily' as const,
    themeName: `Thử Thách Ngày ${dateKey}`,
    bgColor: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
    difficulty: 'THỬ THÁCH NGÀY',
    size,
    grid,
    words: placedWords,
    timeLimit: 180, // 3 minutes challenging time limit
    dateKey,
  };
};

export const generateLevel = (levelIndex: number, mode: 'classic' | 'mystery' = 'classic') => {
  // Determine difficulty based on level
  const difficultyStr = levelIndex < 30 ? 'EASY' : levelIndex < 70 ? 'NORMAL' : 'HARD';
  
  // Pick theme based on level
  const themeIndex = levelIndex % THEMES.length;
  const theme = THEMES[themeIndex];
  const bgColor = THEME_COLORS[levelIndex % THEME_COLORS.length];
  
  // Mix and pick words
  const allWords = [...theme.words].sort((a, b) => b.length - a.length); // Sort longest first for better intersection
  
  let size = 8;
  let wordCount = 4;
  let timeLimit = 60; // 0 means unlimit
  
  if (difficultyStr === 'EASY') {
    size = 6 + Math.floor(Math.random() * 3); // 6-8
    wordCount = 3 + Math.floor(Math.random() * 3); // 3-5
    timeLimit = levelIndex % 5 === 0 ? 60 : 0; // Every 5th level is time attack
  } else if (difficultyStr === 'NORMAL') {
    size = 9 + Math.floor(Math.random() * 4); // 9-12
    wordCount = 6 + Math.floor(Math.random() * 3); // 6-8
    timeLimit = levelIndex % 4 === 0 ? 120 : 0;
  } else {
    size = 13 + Math.floor(Math.random() * 3); // 13-15
    wordCount = 9 + Math.floor(Math.random() * 4); // 9-12
    timeLimit = levelIndex % 3 === 0 ? 180 : 0;
  }
  
  // Select subset and shuffle
  const selectedWords = [...allWords].sort(() => Math.random() - 0.5).slice(0, Math.min(wordCount, allWords.length));
  // Re-sort by length descending to place large words first
  selectedWords.sort((a, b) => b.length - a.length);

  // Generate Grid
  const { grid, placedWords } = generateGrid(size, size, selectedWords, Math.random);
  
  return {
    id: `level_${levelIndex}_${mode}`,
    level: levelIndex,
    mode,
    themeName: theme.name,
    bgColor,
    difficulty: difficultyStr,
    size,
    grid,
    words: placedWords, // [{ word: string, path: [{r, c}] }]
    timeLimit
  };
};

function generateGrid(rows: number, cols: number, wordsToPlace: string[], rng: () => number = Math.random) {
  const grid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
  const placedWords: any[] = [];

  for (const word of wordsToPlace) {
    let placed = false;
    let attempts = 0;
    
    // First, try to intersect with existing letters
    if (placedWords.length > 0) {
      const existingPositions = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] !== '') {
            existingPositions.push({ r, c, letter: grid[r][c] });
          }
        }
      }
      // Shuffle positions
      existingPositions.sort(() => rng() - 0.5);
      
      for (const pos of existingPositions) {
        if (placed) break;
        // Check if current word contains this letter
        const matchIndexes = [];
        for (let i = 0; i < word.length; i++) {
          if (word[i] === pos.letter) matchIndexes.push(i);
        }
        
        for (const wordIdx of matchIndexes) {
          if (placed) break;
          // Try all directions, favor diagonals a bit
          const shuffledDirs = [...DIRS].sort(() => rng() - 0.5);
          for (const dir of shuffledDirs) {
            const rStart = pos.r - wordIdx * dir[0];
            const cStart = pos.c - wordIdx * dir[1];
            
            if (canPlaceWord(grid, word, rStart, cStart, dir[0], dir[1], rows, cols)) {
              placeWord(grid, placedWords, word, rStart, cStart, dir[0], dir[1]);
              placed = true;
              break;
            }
          }
        }
      }
    }

    // If still not placed (or first word), place randomly
    while (!placed && attempts < 250) {
      attempts++;
      const dir = DIRS[Math.floor(rng() * DIRS.length)];
      const rStart = Math.floor(rng() * rows);
      const cStart = Math.floor(rng() * cols);
      
      if (canPlaceWord(grid, word, rStart, cStart, dir[0], dir[1], rows, cols)) {
        placeWord(grid, placedWords, word, rStart, cStart, dir[0], dir[1]);
        placed = true;
      }
    }
  }

  // Fill empty spaces
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = ALPHABET[Math.floor(rng() * ALPHABET.length)];
      }
    }
  }

  return { grid, placedWords };
}

function placeWord(grid: string[][], placedWords: any[], word: string, rStart: number, cStart: number, dr: number, dc: number) {
  const path = [];
  for (let i = 0; i < word.length; i++) {
    const r = rStart + i * dr;
    const c = cStart + i * dc;
    grid[r][c] = word[i];
    path.push({ r, c });
  }
  placedWords.push({ word, path });
}

function canPlaceWord(grid: string[][], word: string, rStart: number, cStart: number, dr: number, dc: number, rows: number, cols: number) {
  for (let i = 0; i < word.length; i++) {
    const r = rStart + i * dr;
    const c = cStart + i * dc;
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
  }
  return true;
}
