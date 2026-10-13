import { LevelData } from './types';

export const CAMPAIGN_LEVELS: LevelData[] = [
  // LEVEL 1: Introduction to White Mummy (2 moves, Horizontal First) & Wall Trap
  {
    id: 1,
    name: 'Hầm Mộ Khởi Đầu',
    pyramidName: 'Kim Tự Tháp Giza - Tầng 1',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'right',
    mummies: [{ type: 'white', x: 4, y: 0 }],
    horizontalWalls: [
      [1, 1], [2, 1], [3, 1],
      [3, 3], [4, 3]
    ],
    verticalWalls: [
      [0, 1], [3, 2], [3, 3]
    ],
    parTurns: 10,
    maxTurns: 18,
    timeLimitSec: 45,
    hintTip: 'Xác ướp trắng đi 2 bước và ưu tiên đi Ngang. Lợi dụng các góc tường để bẫy nó!',
  },

  // LEVEL 2: The U-Pocket Trap
  {
    id: 2,
    name: 'Góc Chết Chữ U',
    pyramidName: 'Kim Tự Tháp Giza - Tầng 2',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'right',
    mummies: [{ type: 'white', x: 4, y: 1 }],
    horizontalWalls: [
      [1, 1], [2, 1],
      [2, 3], [3, 3]
    ],
    verticalWalls: [
      [2, 1], [2, 2],
      [4, 2], [4, 3]
    ],
    parTurns: 11,
    maxTurns: 20,
    timeLimitSec: 45,
    hintTip: 'Dụ xác ướp vào hốc tường hình chữ U, sau đó thong thả vòng ra lối thoát.',
  },

  // LEVEL 3: The Wait / Pass Turn Mechanic (Using Space or Wait Button)
  {
    id: 3,
    name: 'Mê Cung Zic-Zac & Đứng Yên',
    pyramidName: 'Kim Tự Tháp Giza - Tầng 3',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 2 },
    exitPos: { x: 5, y: 3 },
    exitDirection: 'right',
    mummies: [{ type: 'white', x: 3, y: 0 }],
    horizontalWalls: [
      [0, 1], [1, 1], [2, 1],
      [2, 3], [3, 3], [4, 3]
    ],
    verticalWalls: [
      [1, 2], [3, 1], [3, 2]
    ],
    parTurns: 10,
    maxTurns: 18,
    timeLimitSec: 45,
    hintTip: 'Dùng nút ĐỨNG YÊN (hoặc chạm vào chính mình) để bỏ lượt khi xác ướp đang bị kẹt sau vách chắn.',
  },

  // LEVEL 4: Dual Mummies Crash (Two mummies crash and destroy each other)
  {
    id: 4,
    name: 'Song Hồn Trắng & Va Chạm',
    pyramidName: 'Lăng Mộ Saqqara - Tầng 4',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 2, y: 5 },
    exitPos: { x: 2, y: 0 },
    exitDirection: 'up',
    mummies: [
      { type: 'white', x: 0, y: 1 },
      { type: 'white', x: 5, y: 1 }
    ],
    horizontalWalls: [
      [1, 2], [2, 2], [3, 2], [4, 2],
      [0, 3], [5, 3]
    ],
    verticalWalls: [
      [2, 3], [3, 3], [0, 4], [4, 4]
    ],
    parTurns: 9,
    maxTurns: 18,
    timeLimitSec: 50,
    hintTip: 'Khi 2 xác ướp cùng tiến vào 1 ô, chúng sẽ đâm sầm vào nhau và vỡ vụn thành cát bụi!',
  },

  // LEVEL 5: Dual Corridor Split
  {
    id: 5,
    name: 'Hành Lang Anubis',
    pyramidName: 'Lăng Mộ Saqqara - Tầng 5',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 5 },
    exitPos: { x: 5, y: 0 },
    exitDirection: 'right',
    mummies: [
      { type: 'white', x: 3, y: 2 },
      { type: 'white', x: 4, y: 4 }
    ],
    horizontalWalls: [
      [1, 0], [2, 0], [0, 2], [1, 2], [4, 2], [5, 2],
      [2, 4], [3, 4]
    ],
    verticalWalls: [
      [1, 1], [3, 1], [2, 3], [4, 3], [0, 4]
    ],
    parTurns: 12,
    maxTurns: 22,
    timeLimitSec: 55,
    hintTip: 'Hãy chia cắt 2 xác ướp sang hai lối rẽ khác nhau để không bị bao vây.',
  },

  // LEVEL 6: Golden Key & Stone Gate
  {
    id: 6,
    name: 'Chìa Khóa Vàng & Cổng Đá',
    pyramidName: 'Đền Thờ Luxor - Tầng 6',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'right',
    mummies: [{ type: 'white', x: 5, y: 0 }],
    horizontalWalls: [
      [1, 1], [2, 1], [3, 1],
      [2, 3], [3, 3]
    ],
    verticalWalls: [
      [2, 1], [2, 2],
      [4, 4]
    ],
    keys: [
      { id: 'k1', x: 0, y: 4, color: 'yellow', collected: false }
    ],
    gates: [
      { id: 'g1', x1: 4, y1: 5, x2: 5, y2: 5, color: 'yellow', isOpen: false }
    ],
    parTurns: 10,
    maxTurns: 20,
    timeLimitSec: 50,
    hintTip: 'Nhặt Chìa Khóa Vàng Ankh để mở Cánh Cổng Vàng giải phóng lối thoát hiểm!',
  },

  // LEVEL 7: Introduction to Red Mummy (Vertical Priority First!)
  {
    id: 7,
    name: 'Xác Ướp Đỏ Thức Giấc',
    pyramidName: 'Đền Thờ Luxor - Tầng 7',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'right',
    mummies: [{ type: 'red', x: 4, y: 1 }],
    horizontalWalls: [
      [2, 1], [3, 1], [4, 1],
      [2, 3], [3, 3]
    ],
    verticalWalls: [
      [1, 1], [1, 2], [4, 3], [4, 4]
    ],
    parTurns: 10,
    maxTurns: 18,
    timeLimitSec: 45,
    hintTip: 'XÁC ƯỚP ĐỎ: Luôn ưu tiên đi DỌC (Lên/Xuống) trước khi đi Ngang! Hãy dùng tường ngang để chặn nó.',
  },

  // LEVEL 8: White Mummy (Horizontal) vs Red Mummy (Vertical)
  {
    id: 8,
    name: 'Âm Dương Tương Phản',
    pyramidName: 'Thung Lũng Các Vị Vua - Tầng 8',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'right',
    mummies: [
      { type: 'white', x: 4, y: 0 },
      { type: 'red', x: 0, y: 5 }
    ],
    horizontalWalls: [
      [1, 1], [2, 1], [3, 1],
      [0, 3], [1, 3]
    ],
    verticalWalls: [
      [3, 1], [3, 2], [0, 4]
    ],
    parTurns: 10,
    maxTurns: 20,
    timeLimitSec: 50,
    hintTip: 'Xác ướp trắng đi Ngang trước, Xác ướp đỏ đi Dọc trước. Tính toán hướng đi của cả 2 để bẫy chúng.',
  },

  // LEVEL 9: Pit Traps & Sarcophagi
  {
    id: 9,
    name: 'Cạm Bẫy Hố Sâu',
    pyramidName: 'Thung Lũng Các Vị Vua - Tầng 9',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 5 },
    exitPos: { x: 5, y: 0 },
    exitDirection: 'up',
    mummies: [
      { type: 'white', x: 3, y: 3 },
      { type: 'red', x: 4, y: 1 }
    ],
    horizontalWalls: [
      [0, 2], [1, 2], [4, 2], [5, 2],
      [2, 4], [3, 4]
    ],
    verticalWalls: [
      [1, 0], [4, 0], [1, 3], [4, 3]
    ],
    traps: [
      { id: 't1', x: 3, y: 1, type: 'pit', triggered: false }
    ],
    parTurns: 12,
    maxTurns: 22,
    timeLimitSec: 55,
    hintTip: 'Dụ xác ướp bước vào hố bẫy để tiêu diệt chúng ngay lập tức!',
  },

  // LEVEL 10: Dual Key Mystery
  {
    id: 10,
    name: 'Song Khóa Thần Ra',
    pyramidName: 'Đại Lăng Mộ Abu Simbel - Tầng 10',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'down',
    mummies: [
      { type: 'white', x: 4, y: 0 },
      { type: 'red', x: 0, y: 4 }
    ],
    horizontalWalls: [
      [1, 1], [2, 1], [3, 1],
      [0, 2], [1, 2], [4, 3]
    ],
    verticalWalls: [
      [3, 1], [3, 2], [0, 3]
    ],
    keys: [
      { id: 'k1', x: 5, y: 0, color: 'yellow', collected: false },
      { id: 'k2', x: 0, y: 5, color: 'red', collected: false }
    ],
    gates: [
      { id: 'g1', x1: 4, y1: 4, x2: 5, y2: 4, color: 'yellow', isOpen: false },
      { id: 'g2', x1: 4, y1: 5, x2: 5, y2: 5, color: 'red', isOpen: false }
    ],
    parTurns: 10,
    maxTurns: 20,
    timeLimitSec: 60,
    hintTip: 'Thu thập đủ cả 2 chìa khóa vàng và đỏ để mở thông các tầng cửa đá!',
  },

  // LEVEL 11: The Scorpion (1 step per turn, horizontal priority)
  {
    id: 11,
    name: 'Độc Bọ Cạp Vàng',
    pyramidName: 'Đại Lăng Mộ Abu Simbel - Tầng 11',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 3, y: 0 },
    exitPos: { x: 3, y: 5 },
    exitDirection: 'down',
    mummies: [
      { type: 'scorpion', x: 0, y: 2 },
      { type: 'white', x: 5, y: 2 }
    ],
    horizontalWalls: [
      [1, 1], [2, 1], [3, 1], [4, 1],
      [1, 3], [2, 3], [3, 3], [4, 3]
    ],
    verticalWalls: [
      [0, 2], [1, 2], [4, 2], [5, 2],
      [2, 4], [3, 4]
    ],
    parTurns: 11,
    maxTurns: 22,
    timeLimitSec: 55,
    hintTip: 'Bọ Cạp vàng chỉ đi 1 bước mỗi lượt nhưng cực kỳ nguy hiểm trong không gian hẹp.',
  },

  // LEVEL 12: Triple Mummy Chaos
  {
    id: 12,
    name: 'Hầm Mộ Xương Tàn',
    pyramidName: 'Đại Kim Tự Tháp Đỏ - Tầng 12',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'right',
    mummies: [
      { type: 'white', x: 4, y: 0 },
      { type: 'white', x: 5, y: 1 },
      { type: 'red', x: 0, y: 4 }
    ],
    horizontalWalls: [
      [1, 1], [2, 1], [3, 1],
      [0, 3], [1, 3], [4, 3]
    ],
    verticalWalls: [
      [3, 1], [3, 2], [0, 4]
    ],
    parTurns: 13,
    maxTurns: 25,
    timeLimitSec: 65,
    hintTip: 'Dụ các xác ướp va chạm vào nhau hoặc kẹt vào vách đá trước khi tiến về lối thoát.',
  },

  // LEVEL 13: Three Guardians
  {
    id: 13,
    name: 'Tam Đại Vệ Binh',
    pyramidName: 'Đại Kim Tự Tháp Đỏ - Tầng 13',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'right',
    mummies: [
      { type: 'white', x: 4, y: 0 },
      { type: 'red', x: 0, y: 5 },
      { type: 'scorpion', x: 4, y: 4 }
    ],
    horizontalWalls: [
      [1, 1], [2, 1], [3, 1],
      [0, 2], [1, 2], [4, 3]
    ],
    verticalWalls: [
      [3, 1], [3, 2], [0, 4]
    ],
    parTurns: 11,
    maxTurns: 22,
    timeLimitSec: 70,
    hintTip: 'Phối hợp tránh né 3 vệ binh khác chủng loại.',
  },

  // LEVEL 14: Cursed Tomb (Trap + Key + Scorpion)
  {
    id: 14,
    name: 'Lăng Mộ Bị Nguyền Rủa',
    pyramidName: 'Đền Thờ Karnak - Tầng 14',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 0 },
    exitPos: { x: 5, y: 5 },
    exitDirection: 'down',
    mummies: [
      { type: 'white', x: 4, y: 0 },
      { type: 'red', x: 1, y: 4 },
      { type: 'scorpion', x: 4, y: 3 }
    ],
    horizontalWalls: [
      [1, 1], [3, 1],
      [0, 3], [2, 3], [4, 3]
    ],
    verticalWalls: [
      [2, 0], [1, 2], [3, 2], [4, 4]
    ],
    keys: [
      { id: 'k1', x: 4, y: 1, color: 'yellow', collected: false }
    ],
    gates: [
      { id: 'g1', x1: 4, y1: 5, x2: 5, y2: 5, color: 'yellow', isOpen: false }
    ],
    traps: [
      { id: 't1', x: 2, y: 2, type: 'pit', triggered: false }
    ],
    parTurns: 15,
    maxTurns: 28,
    timeLimitSec: 75,
    hintTip: 'Phối hợp nhặt chìa khóa, né bọ cạp và dẫn dụ xác ướp sập bẫy hố sâu.',
  },

  // LEVEL 15: Grand Finale: The Heart of Tutankhamun
  {
    id: 15,
    name: 'Trái Tim Pharaoh Tutankhamun',
    pyramidName: 'Đền Thờ Karnak - Tầng Hoàng Kim 15',
    gridSize: { cols: 6, rows: 6 },
    playerStart: { x: 0, y: 5 },
    exitPos: { x: 5, y: 0 },
    exitDirection: 'up',
    mummies: [
      { type: 'white', x: 5, y: 5 },
      { type: 'red', x: 0, y: 0 },
      { type: 'scorpion', x: 2, y: 2 }
    ],
    horizontalWalls: [
      [0, 1], [2, 1], [4, 1],
      [1, 3], [3, 3], [5, 3]
    ],
    verticalWalls: [
      [1, 0], [3, 0], [2, 2], [4, 2], [1, 4]
    ],
    keys: [
      { id: 'k1', x: 0, y: 2, color: 'yellow', collected: false }
    ],
    gates: [
      { id: 'g1', x1: 3, y1: 0, x2: 4, y2: 0, color: 'yellow', isOpen: false }
    ],
    traps: [
      { id: 't1', x: 3, y: 2, type: 'pit', triggered: false }
    ],
    parTurns: 10,
    maxTurns: 20,
    timeLimitSec: 85,
    hintTip: 'Tầng thử thách tối thượng! Hãy dùng trí tuệ lừa các hộ vệ rơi vào hố bẫy và mở cổng hoàng kim.',
  },
];

// Helper to check if wall exists between cell (x1, y1) and (x2, y2)
export function hasWallBetween(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  hWalls: Array<[number, number]>,
  vWalls: Array<[number, number]>,
  gates: LevelData['gates'] = [],
  cols: number = 6,
  rows: number = 6
): boolean {
  // Check bounds
  if (x2 < 0 || x2 >= cols || y2 < 0 || y2 >= rows) {
    return true; // outer boundary wall
  }

  // Vertical movement (y changes)
  if (x1 === x2) {
    const minY = Math.min(y1, y2);
    // Horizontal wall between (x1, minY) and (x1, minY+1)
    const hasHW = hWalls.some(([wx, wy]) => wx === x1 && wy === minY);
    if (hasHW) return true;

    // Check closed gate
    const gateBlock = gates.some(
      (g) =>
        !g.isOpen &&
        ((g.x1 === x1 && g.y1 === minY && g.x2 === x1 && g.y2 === minY + 1) ||
         (g.x1 === x1 && g.y1 === minY + 1 && g.x2 === x1 && g.y2 === minY))
    );
    if (gateBlock) return true;
  }

  // Horizontal movement (x changes)
  if (y1 === y2) {
    const minX = Math.min(x1, x2);
    // Vertical wall between (minX, y1) and (minX+1, y1)
    const hasVW = vWalls.some(([wx, wy]) => wx === minX && wy === y1);
    if (hasVW) return true;

    // Check closed gate
    const gateBlock = gates.some(
      (g) =>
        !g.isOpen &&
        ((g.x1 === minX && g.y1 === y1 && g.x2 === minX + 1 && g.y2 === y1) ||
         (g.x1 === minX + 1 && g.y1 === y1 && g.x2 === minX && g.y2 === y1))
    );
    if (gateBlock) return true;
  }

  return false;
}

export { generateProceduralChamber } from './proceduralGenerator';

